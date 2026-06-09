import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Check, Camera, X, ArrowLeft, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { enrollmentSchema, type EnrollmentFormValues } from "./enrollment/enrollment.schema";
import { step1ByName } from "./enrollment/steps/step1Fields.data";
import { step2ByName } from "./enrollment/steps/step2Fields.data";
import { step3ByName } from "./enrollment/steps/step3Fields.data";
import { step4ByName } from "./enrollment/steps/step4Fields.data";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import StepperComponent from "@/components/stepper/StepperComponent";
import { useEnrollmentMutation, useUpdateEnrollment } from "@/queries/useEnrollmentMutations";
import { useUpdateStudent, useUpdateRepresentative } from "@/queries/useUserMutations";
import { useLevels, useSections, useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { useCountries, useStates, useMunicipalities, useParishes } from "@/hooks/useLocations";
import { checkIdentification, searchRepresentatives } from "@/services/users/user.service";
import type { IStudent, IRepresentative } from "@/services/users/user.interface";
import AutocompleteField from "@/components/locationAutocomplete/AutocompleteField";
import toast from "react-hot-toast";
import { ToastMessage } from "@/components/toast/ToastMessage";

interface EnrollmentFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<EnrollmentFormValues>;
  mode?: "create" | "edit";
  selectedStudent?: IStudent;
  step: number;
  setStep: (step: number) => void;
  totalSteps: number;
}

const STEPS = [
  { title: "Datos Personales", description: "Nombre, cédula, fecha de nacimiento" },
  { title: "Datos Generales", description: "Lugar de nacimiento, dirección" },
  { title: "Representante", description: "Datos del representante legal" },
  { title: "Asignación", description: "Año escolar, nivel y sección" },
];

export function EnrollmentForm({ open, onClose, initialData, mode = "create", selectedStudent, step, setStep, totalSteps }: EnrollmentFormProps) {
  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string | null>(null);
  const [completedStep, setCompletedStep] = useState(mode === "edit" ? totalSteps : 0);
  const enrollmentMutation = useEnrollmentMutation();
  const { mutateAsync: updateStudent } = useUpdateStudent();
  const { mutateAsync: updateRepresentative } = useUpdateRepresentative();
  const { mutateAsync: updateEnrollment } = useUpdateEnrollment();
  const { data: activeSchoolYear } = useActiveSchoolYear();
  const { data: levels = [] } = useLevels();
  const { data: sections = [] } = useSections();

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      firstNames: "",
      lastNames: "",
      identificationNumber: "",
      birthDate: new Date(),
      gender: "",
      profilePhoto: "",
      birthCountry: "",
      state: "",
      municipality: "",
      parish: "",
      currentParish: "",
      address: "",
      previousSchool: "",
      admissionDate: new Date(),
      representativeMode: "create" as const,
      representativeFirstNames: "",
      representativeLastNames: "",
      representativeIdentification: "",
      representativeBirthDate: new Date(),
      representativeGender: "",
      representativeEmail: "",
      representativePhone: "",
      representativeRelation: "",
      representativeProfession: "",
      existingRepresentative: undefined,
      schoolYearId: undefined as any,
      levelId: undefined as any,
      sectionId: undefined as any,
      enrollmentDate: new Date(),
      ...initialData,
    },
    shouldUnregister: false,
  });

  const { trigger, setValue, watch } = form;

  const isEditMode = mode === "edit";

  const schoolYearId = watch("schoolYearId");
  const levelId = watch("levelId");
  const birthCountry = watch("birthCountry");
  const state = watch("state");
  const municipality = watch("municipality");
  const representativeMode = watch("representativeMode");
  const isLevelDisabled = !schoolYearId;
  const isSectionDisabled = !schoolYearId || !levelId;

  const schoolYearField = useMemo(() => {
    const field = step4ByName.schoolYearId;
    if (field.type === "select") {
      field.options = activeSchoolYear
        ? [{ label: activeSchoolYear.name, value: activeSchoolYear.id }]
        : [];
    }
    return step4ByName;
  }, [activeSchoolYear]);

  const levelField = useMemo(() => {
    const field = step4ByName.levelId;
    if (field.type === "select") {
      field.options = (levels ?? []).map((l: any) => ({
        label: l.level,
        value: l.id,
      }));
    }
    return step4ByName;
  }, [levels]);

  const filteredSections = useMemo(() => {
    if (!schoolYearId || !levelId) return [];
    return (sections ?? []).filter(
      (s: any) => s.schoolYearId === schoolYearId && s.highSchoolLevelId === levelId,
    );
  }, [sections, schoolYearId, levelId]);

  const sectionField = useMemo(() => {
    const field = step4ByName.sectionId;
    if (field.type === "select") {
      field.options = filteredSections.map((s: any) => ({
        label: `${s.section} - ${s.highSchoolLevel?.level ?? ""}`,
        value: s.id,
      }));
    }
    return step4ByName;
  }, [filteredSections]);

  const { data: countries = [] } = useCountries();
  const venezuela = countries.find((c: any) => c.name === "Venezuela");
  const { data: states = [] } = useStates(venezuela?.id);
  const zuliaState = states.find((s: any) => s.name === "Zulia");
  const { data: municipalities = [] } = useMunicipalities(zuliaState?.id);

  const selectedMunicipalityObj = municipalities.find(
    (m: any) => m.name === municipality,
  );
  const { data: parishes = [] } = useParishes(selectedMunicipalityObj?.id);

  const countryOptions = countries.map((c: any) => ({ label: c.name, value: c.name }));
  const stateOptions = states.map((s: any) => ({ label: s.name, value: s.name }));
  const municipalityOptions = municipalities.map((m: any) => ({ label: m.name, value: m.name }));
  const parishOptions = parishes.map((p: any) => ({ label: p.name, value: p.name }));

  // ── Representative search state ──
  const [repSearchQuery, setRepSearchQuery] = useState("");
  const [repSearchResults, setRepSearchResults] = useState<IRepresentative[]>([]);
  const [repSearchOpen, setRepSearchOpen] = useState(false);
  const [repHighlightIdx, setRepHighlightIdx] = useState(-1);
  const repSearchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchReps = useCallback(async (query: string) => {
    try {
      const results = await searchRepresentatives(query || undefined);
      setRepSearchResults(results ?? []);
      setRepSearchOpen(true);
      setRepHighlightIdx(-1);
    } catch {
      setRepSearchResults([]);
    }
  }, []);

  const handleRepSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setRepSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchReps(q), 300);
  };

  const selectRepresentative = (rep: IRepresentative) => {
    setValue("existingRepresentative", rep as any);
    setRepSearchQuery(`${rep.person.firstNames} ${rep.person.lastNames} - ${rep.person.identificationNumber}`);
    setRepSearchOpen(false);
    setRepSearchResults([]);
  };

  const handleRepKeyDown = (e: React.KeyboardEvent) => {
    if (!repSearchOpen || repSearchResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setRepHighlightIdx((prev) => (prev < repSearchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setRepHighlightIdx((prev) => (prev > 0 ? prev - 1 : repSearchResults.length - 1));
    } else if (e.key === "Enter" && repHighlightIdx >= 0) {
      e.preventDefault();
      selectRepresentative(repSearchResults[repHighlightIdx]);
    } else if (e.key === "Escape") {
      setRepSearchOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (repSearchRef.current && !repSearchRef.current.contains(e.target as Node)) {
        setRepSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    form.clearErrors();
  }, [step]);

  useEffect(() => {
    if (activeSchoolYear && !initialData?.schoolYearId) {
      form.setValue("schoolYearId", activeSchoolYear.id);
    }
  }, [activeSchoolYear, initialData?.schoolYearId]);

  useEffect(() => {
    form.setValue("sectionId", undefined as any);
  }, [schoolYearId, levelId]);

  useEffect(() => {
    if (!isEditMode && !initialData?.birthCountry) {
      form.setValue("birthCountry", "Venezuela");
    }
  }, []);

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === "birthCountry" && values.birthCountry !== "Venezuela") {
        form.setValue("state", "");
        form.setValue("municipality", "");
        form.setValue("parish", "");
        form.setValue("currentParish", "");
      }
      if (name === "state" && values.state !== "Zulia") {
        form.setValue("municipality", "");
        form.setValue("parish", "");
        form.setValue("currentParish", "");
      }
      if (name === "municipality") {
        form.setValue("parish", "");
        form.setValue("currentParish", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const validateStep = async () => {
    let fieldsToValidate: (keyof EnrollmentFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["firstNames", "lastNames", "identificationNumber", "birthDate", "gender"];
    } else if (step === 2) {
      fieldsToValidate = ["birthCountry", "state", "municipality", "parish", "currentParish", "address"];
    } else if (step === 3) {
      fieldsToValidate = ["representativeMode"] as any;
      if (representativeMode === "create") {
        fieldsToValidate = [
          "representativeMode",
          "representativeFirstNames", "representativeLastNames", "representativeIdentification",
          "representativeBirthDate", "representativeGender", "representativeEmail",
          "representativePhone", "representativeRelation",
        ] as any;
      } else {
        fieldsToValidate = ["representativeMode", "existingRepresentative"] as any;
      }
    } else if (step === 4) {
      fieldsToValidate = ["schoolYearId", "levelId", "sectionId", "enrollmentDate"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (!isValid) return;

    // Duplicate identification checks (edit mode only)
    if (isEditMode) {
      if (step === 1) {
        const { exists } = await checkIdentification(
          form.getValues("identificationNumber"),
          selectedStudent?.personId,
        );
        if (exists) {
          toast.custom((t) => (
            <ToastMessage success={false} message="Esta cédula ya está registrada por otro estudiante o usuario" visible={t.visible} />
          ), { duration: 5000 });
          return;
        }
      }
      if (step === 3 && representativeMode === "create") {
        const repPersonId =
          selectedStudent?.representatives?.[0]?.representative?.user?.person?.id;
        const { exists } = await checkIdentification(
          form.getValues("representativeIdentification"),
          repPersonId,
        );
        if (exists) {
          toast.custom((t) => (
            <ToastMessage success={false} message="Esta cédula ya está registrada por otro estudiante o usuario" visible={t.visible} />
          ), { duration: 5000 });
          return;
        }
      }
    }

    if (step < totalSteps) {
        setCompletedStep(prev => Math.max(prev, step));
        setStep(step + 1);
      } else {
        await submitEdit();
      }
  };

  const submitEdit = async () => {
    if (!selectedStudent) return;

    const formData = form.getValues();

    // Final duplicate safety checks
    const { exists: studentIdExists } = await checkIdentification(
      formData.identificationNumber,
      selectedStudent.personId,
    );
    if (studentIdExists) {
      form.setError("identificationNumber", {
        type: "manual",
        message: "Esta cédula ya está registrada por otro estudiante o usuario",
      });
      return;
    }

    const repPersonId =
      selectedStudent.representatives?.[0]?.representative?.user?.person?.id;
    if (repPersonId) {
      const { exists: repIdExists } = await checkIdentification(
        formData.representativeIdentification,
        repPersonId,
      );
      if (repIdExists) {
        form.setError("representativeIdentification", {
          type: "manual",
          message: "Esta cédula ya está registrada por otro estudiante o usuario",
        });
        return;
      }
    }

    const studentPayload = {
      profilePhoto: formData.profilePhoto || "",
      firstNames: formData.firstNames,
      lastNames: formData.lastNames,
      identificationNumber: formData.identificationNumber,
      birthDate: formData.birthDate,
      gender: formData.gender,
      birthCountry: formData.birthCountry,
      state: formData.state,
      municipality: formData.municipality,
      parish: formData.parish,
      currentParish: formData.currentParish,
      previousSchool: formData.previousSchool || "",
      address: formData.address,
      status: true,
      admissionDate: formData.admissionDate || new Date(),
    };

    try {
      const studentResult = await updateStudent({ id: selectedStudent.id, data: studentPayload });
      if (studentResult?.success === false) return;

      const repRelationship = selectedStudent.representatives?.[0];
      if (repRelationship) {
        const repId = repRelationship.representative.id;
        const representativePayload = {
          profilePhoto: "",
          firstNames: formData.representativeFirstNames,
          lastNames: formData.representativeLastNames,
          identificationNumber: formData.representativeIdentification,
          birthDate: formData.representativeBirthDate,
          gender: formData.representativeGender,
          email: formData.representativeEmail,
          phone: formData.representativePhone,
          relationship: formData.representativeRelation,
          occupation: formData.representativeProfession,
        };
        const repResult = await updateRepresentative({ id: repId, data: representativePayload });
        if (repResult?.success === false) return;
      }

      const enrollment = selectedStudent.enrollments?.[0];
      if (enrollment) {
        const enrollmentPayload = {
          schoolYearId: formData.schoolYearId,
          sectionId: formData.sectionId,
          enrollmentDate: formData.enrollmentDate,
          status: enrollment.status,
        };
        const enrollmentResult = await updateEnrollment({ id: enrollment.id, data: enrollmentPayload });
        if (enrollmentResult?.success === false) return;
      }

      onClose();
      resetForm();
    } catch (error: any) {
      console.log(error);
    }
  };

  const sendForm = async (data: EnrollmentFormValues) => {
    try {
      await enrollmentMutation.mutateAsync(data);
      onClose();
      resetForm();
    } catch (error: any) {
      console.log(error);
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const resetForm = () => {
    form.reset();
    setStep(1);
    setCompletedStep(mode === "edit" ? totalSteps : 0);
    setStudentPhotoPreview(null);
    setRepSearchQuery("");
    setRepSearchResults([]);
  };

  const handleStudentPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen no puede superar 2MB");
        return;
      }
      const preview = URL.createObjectURL(file);
      setStudentPhotoPreview(preview);
      setValue("profilePhoto", preview);
    }
  };

  const removeStudentPhoto = () => {
    setStudentPhotoPreview(null);
    setValue("profilePhoto", "");
  };

  const f1 = step1ByName;
  const f3 = step3ByName;

  const locationFieldRenderer = (field: any) => {
    const isVenezuela = birthCountry === "Venezuela";

    switch (field.name) {
      case "birthCountry":
        return (
          <AutocompleteField
            name="birthCountry"
            label="País de Nacimiento"
            options={countryOptions}
            placeholder="Escriba para buscar..."
          />
        );
      case "state":
        return (
          <AutocompleteField
            name="state"
            label="Estado de Nacimiento"
            options={stateOptions}
            placeholder={isVenezuela ? "Escriba para buscar..." : "Escriba un estado"}
            disabled={!birthCountry}
          />
        );
      case "municipality":
        return (
          <AutocompleteField
            name="municipality"
            label="Municipio"
            options={municipalityOptions}
            placeholder={isVenezuela ? "Escriba para buscar..." : "Escriba un municipio"}
            disabled={!state}
          />
        );
      case "parish":
        return (
          <AutocompleteField
            name="parish"
            label="Parroquia de Nacimiento"
            options={parishOptions}
            placeholder="Escriba una parroquia"
            disabled={!municipality}
          />
        );
      case "currentParish":
        return (
          <AutocompleteField
            name="currentParish"
            label="Parroquia donde Vive"
            options={parishOptions}
            placeholder="Escriba una parroquia"
            disabled={!municipality}
          />
        );
      default:
        return null;
    }
  };

  const step3FieldRenderer = (field: any) => {
    switch (field.name) {
      case "representativeMode":
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-(--darkBlueColor)">¿El representante ya existe?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setValue("representativeMode", "create"); setValue("existingRepresentative", undefined as any); setRepSearchQuery(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  representativeMode === "create"
                    ? "bg-(--blueColor) text-white shadow-sm"
                    : "border border-(--lightBlueColor)/40 text-(--darkBlueColor) hover:bg-(--grayColor)"
                }`}
              >
                Nuevo Representante
              </button>
              <button
                type="button"
                onClick={() => { setValue("representativeMode", "existing"); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  representativeMode === "existing"
                    ? "bg-(--blueColor) text-white shadow-sm"
                    : "border border-(--lightBlueColor)/40 text-(--darkBlueColor) hover:bg-(--grayColor)"
                }`}
              >
                Ya existe
              </button>
            </div>
            {form.formState.errors.representativeMode && (
              <p className="text-sm text-red-500">{form.formState.errors.representativeMode.message}</p>
            )}
          </div>
        );
      case "existingRepresentative":
        if (representativeMode !== "existing") return null;
        return (
          <div ref={repSearchRef} className="space-y-2 relative">
            <label className="text-sm font-medium text-(--darkBlueColor)">Buscar representante por nombre o cédula</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--lightBlueColor)" />
              <input
                type="text"
                value={repSearchQuery}
                onChange={handleRepSearchChange}
                onKeyDown={handleRepKeyDown}
                onFocus={() => { if (repSearchResults.length > 0) setRepSearchOpen(true); }}
                placeholder="Escriba para buscar..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-(--lightBlueColor)/40 text-sm text-(--darkBlueColor) placeholder:text-(--lightBlueColor) focus:outline-none focus:ring-2 focus:ring-(--blueColor)/30"
              />
            </div>
            {repSearchOpen && repSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-(--lightBlueColor)/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {repSearchResults.map((rep, i) => (
                  <button
                    type="button"
                    key={rep.id}
                    onMouseDown={() => selectRepresentative(rep)}
                    className={`w-full text-left px-4 py-3 text-sm transition cursor-pointer ${
                      i === repHighlightIdx
                        ? "bg-(--blueColor)/10 text-(--darkBlueColor)"
                        : "hover:bg-(--grayColor) text-(--darkBlueColor)"
                    }`}
                  >
                    <div className="font-medium">{rep.person.firstNames} {rep.person.lastNames}</div>
                    <div className="text-xs text-(--lightBlueColor) flex gap-3 mt-0.5">
                      <span>{rep.person.identificationNumber}</span>
                      <span>{rep.relationship}</span>
                      <span>{rep.studentCount} estudiante(s)</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {/* Hidden field error */}
            {form.formState.errors.existingRepresentative && (
              <p className="text-sm text-red-500">{form.formState.errors.existingRepresentative.message as string}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const isPending = isEditMode ? false : enrollmentMutation.isPending;

  const isLastStep = isEditMode ? step === totalSteps : step === totalSteps;

  const getFieldsForStep = (stepNumber: number): (keyof EnrollmentFormValues)[] => {
    if (stepNumber === 1) return ["firstNames", "lastNames", "identificationNumber", "birthDate", "gender"];
    if (stepNumber === 2) return ["birthCountry", "state", "municipality", "parish", "currentParish", "address"];
    if (stepNumber === 3) {
      if (representativeMode === "create") {
        return [
          "representativeMode", "representativeFirstNames", "representativeLastNames",
          "representativeIdentification", "representativeBirthDate", "representativeGender",
          "representativeEmail", "representativePhone", "representativeRelation",
        ] as any;
      }
      return ["representativeMode", "existingRepresentative"] as any;
    }
    if (stepNumber === 4) return ["schoolYearId", "levelId", "sectionId", "enrollmentDate"];
    return [];
  };

  const handleStepClick = async (targetStep: number) => {
    if (mode === "edit") {
      const isValid = await trigger(getFieldsForStep(targetStep));
      if (!isValid) return;
    }
    if (mode === "edit" || targetStep <= completedStep) {
      setStep(targetStep);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-(--lightBlueColor)/20">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-(--grayColor) rounded-lg transition cursor-pointer"
          >
            <ArrowLeft size={20} className="text-(--darkBlueColor)" />
          </button>
          <h2 className="text-lg font-semibold text-(--darkBlueColor)">
            {isEditMode ? "Editar Estudiante" : "Inscripción de Estudiante"}
          </h2>
        </div>

        <StepperComponent
          steps={STEPS}
          currentStep={step}
          onStepClick={handleStepClick}
        />

        <Form {...form}>
          <form onSubmit={isEditMode ? (e) => e.preventDefault() : form.handleSubmit(sendForm)}>
            <div className="space-y-6 mt-4">
            {/* ==================== PASO 1: DATOS PERSONALES ==================== */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  <div className="flex justify-center md:justify-start">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-(--blueColor) shadow-lg">
                        {studentPhotoPreview ? (
                          <AvatarImage src={studentPhotoPreview} alt="Foto" />
                        ) : (
                          <AvatarFallback className="bg-linear-to-br from-(--darkBlueColor) to-(--blueColor) text-white text-2xl">
                            <Camera size={24} />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <label className="absolute -bottom-2 -right-2 p-1.5 bg-(--greenColor) rounded-full cursor-pointer shadow-md hover:brightness-110 transition">
                        <Camera size={16} className="text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleStudentPhotoChange} />
                      </label>
                      {studentPhotoPreview && (
                        <button type="button" onClick={removeStudentPhoto}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full shadow-md hover:bg-red-600 transition">
                          <X size={12} className="text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  <FieldRenderer field={f1.identificationNumber} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldRenderer field={f1.firstNames} />
                  <FieldRenderer field={f1.lastNames} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FieldRenderer field={f1.birthDate} />
                  <FieldRenderer field={f1.gender} />
                </div>
              </>
            )}

            {/* ==================== PASO 2: DATOS GENERALES ==================== */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldRenderer field={step2ByName.birthCountry} customFieldRenderer={locationFieldRenderer} />
                <FieldRenderer field={step2ByName.state} customFieldRenderer={locationFieldRenderer} />
                <FieldRenderer field={step2ByName.municipality} customFieldRenderer={locationFieldRenderer} />
                <FieldRenderer field={step2ByName.parish} customFieldRenderer={locationFieldRenderer} />
                <FieldRenderer field={step2ByName.currentParish} customFieldRenderer={locationFieldRenderer} />
                <FieldRenderer field={step2ByName.previousSchool} />
                <FieldRenderer field={step2ByName.admissionDate} />
                <div className="md:col-span-2">
                  <FieldRenderer field={step2ByName.address} />
                </div>
              </div>
            )}

            {/* ==================== PASO 3: DATOS DEL REPRESENTANTE ==================== */}
            {step === 3 && (
              <div className="space-y-5">
                <FieldRenderer field={f3.representativeMode} customFieldRenderer={step3FieldRenderer} />

                {representativeMode === "existing" && (
                  <FieldRenderer field={f3.existingRepresentative} customFieldRenderer={step3FieldRenderer} />
                )}

                {representativeMode !== "existing" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FieldRenderer field={f3.representativeFirstNames} />
                    <FieldRenderer field={f3.representativeLastNames} />
                    <FieldRenderer field={f3.representativeIdentification} />
                    <FieldRenderer field={f3.representativeBirthDate} />
                    <FieldRenderer field={f3.representativeGender} />
                    <FieldRenderer field={f3.representativeEmail} />
                    <FieldRenderer field={f3.representativePhone} />
                    <FieldRenderer field={f3.representativeRelation} />
                    <FieldRenderer field={f3.representativeProfession} />
                  </div>
                )}
              </div>
            )}

            {/* ==================== PASO 4: ASIGNACIÓN DE SECCIÓN ==================== */}
            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldRenderer field={schoolYearField.schoolYearId} />
                <FieldRenderer field={levelField.levelId} disabled={isLevelDisabled} />
                <FieldRenderer field={sectionField.sectionId} disabled={isSectionDisabled} />
                <FieldRenderer field={step4ByName.enrollmentDate} />
              </div>
            )}

            {/* ==================== BOTONES DE NAVEGACIÓN ==================== */}
            <div className="flex justify-between pt-6 border-t border-(--lightBlueColor)/20">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={goBack}
                  className="cursor-pointer border-(--lightBlueColor)/50 text-(--darkBlueColor) hover:bg-(--grayColor)">
                  <ChevronLeft size={16} className="mr-2" />
                  Anterior
                </Button>
              ) : (
                <div />
              )}

              {!isLastStep ? (
                <Button type="button" onClick={validateStep}
                  className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer">
                  Siguiente
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              ) : isEditMode ? (
                <Button type="button" onClick={validateStep}
                  className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer">
                  <Check size={16} className="mr-2" />
                  Guardar Cambios
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}
                  className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer disabled:opacity-60">
                  {isPending ? "Guardando..." : "Finalizar"}
                  {!isPending && <Check size={16} className="ml-2" />}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
      </div>
    </div>
  );
}
