import { useEffect, useMemo, useState, useCallback, useRef, useLayoutEffect, type ChangeEvent, type KeyboardEvent, type Dispatch, type SetStateAction, type RefObject } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enrollmentSchema, type EnrollmentFormValues, step1Schema, step2Schema } from "./enrollment.schema";
import { step1ByName } from "./steps/step1Fields.data";
import { step3ByName } from "./steps/step3Fields.data";
import { step4ByName } from "./steps/step4Fields.data";
import type { FormField } from "@/components/form/formComponent.interface";
import { useEnrollmentMutation, useUpdateEnrollment } from "@/queries/useEnrollmentMutations";
import { useUpdateStudent, useUpdateRepresentative } from "@/queries/useUserMutations";
import { useLevels, useSections, useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { useSchools } from "@/hooks/useSchools";
import { useCountries, useStates, useMunicipalities, useParishes } from "@/hooks/useLocations";
import type { ICountry, IState, IMunicipality, IParish } from "@/services/locations/location.service";
import { checkIdentification, searchRepresentatives } from "@/services/users/user.service";
import { getDataApi } from "@/services/api";
import type { IStudent, IRepresentative } from "@/services/users/user.interface";
import AutocompleteField from "@/components/locationAutocomplete/AutocompleteField";
import toast from "react-hot-toast";
import { ToastMessage } from "@/components/toast/ToastMessage";
import { useStudentsStore } from "@/stores/students.store";
import type { ApprovedSubject, PendingSubject } from "./enrollment.schema";

interface LevelSubject {
  id: number;
  subject: { subject: string; code: string | null };
  highSchoolLevel: { level: string };
}

interface UseEnrollmentFormProps {
  initialData?: Partial<EnrollmentFormValues>;
  mode: "create" | "edit";
  selectedStudent?: IStudent;
  step: number;
  setStep: (step: number) => void;
  totalSteps: number;
  onClose: () => void;
}

export interface UseEnrollmentFormReturn {
  form: UseFormReturn<EnrollmentFormValues>;
  trigger: UseFormReturn<EnrollmentFormValues>["trigger"];
  setValue: UseFormReturn<EnrollmentFormValues>["setValue"];
  watch: UseFormReturn<EnrollmentFormValues>["watch"];
  isEditMode: boolean;
  enrollmentType: string | null;
  studentPhotoPreview: string | null;
  completedStep: number;
  setCompletedStep: Dispatch<SetStateAction<number>>;
  schoolYearField: Record<string, FormField>;
  levelField: Record<string, FormField>;
  sectionField: Record<string, FormField>;
  isLevelDisabled: boolean;
  isSectionDisabled: boolean;
  levels: any[];
  schools: any[];
  countryOptions: { label: string; value: string }[];
  stateOptions: { label: string; value: string }[];
  municipalityOptions: { label: string; value: string }[];
  parishOptions: { label: string; value: string }[];
  birthCountry: string;
  state: string;
  municipality: string;
  locationFieldRenderer: (field: FormField) => React.ReactNode;
  representativeMode: string;
  repSearchQuery: string;
  repSearchResults: IRepresentative[];
  repSearchOpen: boolean;
  repHighlightIdx: number;
  repSearchRef: RefObject<HTMLDivElement | null>;
  handleRepSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRepKeyDown: (e: KeyboardEvent) => void;
  selectRepresentative: (rep: IRepresentative) => void;
  levelSubjects: LevelSubject[];
  loadingSubjects: boolean;
  approvedSubjects: ApprovedSubject[];
  setApprovedSubjects: Dispatch<SetStateAction<ApprovedSubject[]>>;
  pendingSubjects: PendingSubject[];
  setPendingSubjects: Dispatch<SetStateAction<PendingSubject[]>>;
  selectedSchoolId: number | null;
  setSelectedSchoolId: (id: number | null) => void;
  previousYearEndDate: string;
  previousLevelName: string | null;
  goBack: () => void;
  validateStep: () => Promise<void>;
  resetForm: () => void;
  handleStudentPhotoChange: (e: ChangeEvent<HTMLInputElement>) => void;
  removeStudentPhoto: () => void;
  isPending: boolean;
  isLastStep: boolean;
  f1: Record<string, FormField>;
  f3: Record<string, FormField>;
}

export function useEnrollmentForm({ initialData, mode, selectedStudent, step, setStep, totalSteps, onClose }: UseEnrollmentFormProps): UseEnrollmentFormReturn {
  const isEditMode = mode === "edit";
  const enrollmentType = useStudentsStore((s) => s.enrollmentType);

  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string | null>(null);
  const [completedStep, setCompletedStep] = useState(mode === "edit" ? totalSteps : 0);
  const enrollmentMutation = useEnrollmentMutation();
  const { mutateAsync: updateStudent } = useUpdateStudent();
  const { mutateAsync: updateRepresentative } = useUpdateRepresentative();
  const { mutateAsync: updateEnrollment } = useUpdateEnrollment();
  const { data: activeSchoolYear } = useActiveSchoolYear();
  const { data: levels = [] } = useLevels();
  const { data: sections = [] } = useSections();
  const { data: schoolsData } = useSchools();

  const schools = useMemo(() => {
    const data = schoolsData as any;
    return Array.isArray(data) ? data : (data?.data ?? []);
  }, [schoolsData]);

  const [levelSubjects, setLevelSubjects] = useState<{ id: number; subject: { subject: string; code: string | null }; highSchoolLevel: { level: string } }[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [approvedSubjects, setApprovedSubjects] = useState<ApprovedSubject[]>([]);
  const [pendingSubjects, setPendingSubjects] = useState<PendingSubject[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);

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
      schoolYearId: undefined as never,
      levelId: undefined as never,
      sectionId: undefined as never,
      enrollmentDate: new Date(),
      ...initialData,
    },
    shouldUnregister: false,
  });

  const { trigger, setValue, watch } = form;

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
      const filtered = enrollmentType === "pending"
        ? (levels ?? []).filter((l: { id: number; level: string }) => {
            const match = l.level.match(/(\d)/);
            return match ? parseInt(match[1]) > 1 : true;
          })
        : (levels ?? []);
      field.options = filtered.map((l: { id: number; level: string }) => ({
        label: l.level,
        value: l.id,
      }));
    }
    return step4ByName;
  }, [levels, enrollmentType]);

  const previousYearEndDate = useMemo(() => {
    if (!activeSchoolYear?.startDate) return "";
    const d = new Date(activeSchoolYear.startDate);
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [activeSchoolYear]);

  const previousLevelId = useMemo(() => {
    if (enrollmentType !== "pending" || !levelId || !levels?.length) return null;
    const sorted = [...levels].sort((a: any, b: any) => {
      const na = parseInt((a.level ?? "").match(/(\d)/)?.[1] ?? "99");
      const nb = parseInt((b.level ?? "").match(/(\d)/)?.[1] ?? "99");
      return na - nb;
    });
    const idx = sorted.findIndex((l: any) => l.id === levelId);
    return idx > 0 ? sorted[idx - 1].id : null;
  }, [levelId, levels, enrollmentType]);

  const previousLevelName = useMemo(() => {
    if (!previousLevelId || !levels?.length) return null;
    const found = levels.find((l: any) => l.id === previousLevelId);
    return found?.level ?? null;
  }, [previousLevelId, levels]);

  const filteredSections = useMemo(() => {
    if (!schoolYearId || !levelId) return [];
    return (sections ?? []).filter(
      (s: { schoolYearId: number; highSchoolLevelId: number }) => s.schoolYearId === schoolYearId && s.highSchoolLevelId === levelId,
    );
  }, [sections, schoolYearId, levelId]);

  const sectionField = useMemo(() => {
    const field = step4ByName.sectionId;
    if (field.type === "select") {
      field.options = filteredSections.map((s: { id: number; section: string; highSchoolLevel?: { level: string } }) => ({
        label: `${s.section} - ${s.highSchoolLevel?.level ?? ""}`,
        value: s.id,
      }));
    }
    return step4ByName;
  }, [filteredSections]);

  const { data: countries = [] } = useCountries();
  const venezuela = countries.find((c: ICountry) => c.name === "Venezuela");
  const { data: states = [] } = useStates(venezuela?.id);
  const zuliaState = states.find((s: IState) => s.name === "Zulia");
  const { data: municipalities = [] } = useMunicipalities(zuliaState?.id);

  const selectedMunicipalityObj = municipalities.find(
    (m: IMunicipality) => m.name === municipality,
  );
  const { data: parishes = [] } = useParishes(selectedMunicipalityObj?.id);

  const countryOptions = countries.map((c: ICountry) => ({ label: c.name, value: c.name }));
  const stateOptions = states.map((s: IState) => ({ label: s.name, value: s.name }));
  const municipalityOptions = municipalities.map((m: IMunicipality) => ({ label: m.name, value: m.name }));
  const parishOptions = parishes.map((p: IParish) => ({ label: p.name, value: p.name }));

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

  const handleRepSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setRepSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchReps(q), 300);
  };

  const selectRepresentative = (rep: IRepresentative) => {
    setValue("existingRepresentative", rep as IRepresentative);
    setRepSearchQuery(`${rep.person.firstNames} ${rep.person.lastNames} - ${rep.person.identificationNumber}`);
    setRepSearchOpen(false);
    setRepSearchResults([]);
  };

  const handleRepKeyDown = (e: KeyboardEvent) => {
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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (repSearchRef.current && !repSearchRef.current.contains(e.target as Node)) {
        setRepSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useLayoutEffect(() => {
    form.clearErrors();
  }, [step]);

  useEffect(() => {
    if (activeSchoolYear && !initialData?.schoolYearId) {
      form.setValue("schoolYearId", activeSchoolYear.id);
    }
  }, [activeSchoolYear, initialData?.schoolYearId]);

  useEffect(() => {
    form.setValue("sectionId", undefined as never);
  }, [schoolYearId, levelId]);

  useEffect(() => {
    if (!levelId || !enrollmentType || enrollmentType === "regular") {
      setLevelSubjects([]);
      return;
    }
    const fetchLevelId = enrollmentType === "pending" ? previousLevelId : levelId;
    if (enrollmentType === "pending" && !fetchLevelId) {
      setLevelSubjects([]);
      return;
    }
    setLoadingSubjects(true);
    getDataApi(`/enrollment/subjects-by-level/${fetchLevelId}`)
      .then((res: any) => {
        const excludedSubjects = ["robótica", "música", "metodología"];
        const filtered = (res?.data ?? []).filter((ls: any) =>
          !excludedSubjects.includes(ls.subject.subject.toLowerCase())
        );
        setLevelSubjects(filtered);
        setApprovedSubjects([]);
        setPendingSubjects([]);
      })
      .catch(() => setLevelSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, [levelId, enrollmentType, previousLevelId]);

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

  const submitEdit = async () => {
    if (!selectedStudent) return;

    const formData = form.getValues();

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
        formData.representativeIdentification || "",
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
      address: formData.address,
      status: true,
    };

    try {
      await updateStudent({ id: selectedStudent.id, data: studentPayload });

      const repRelationship = selectedStudent.representatives?.[0];
      if (repRelationship) {
        const repId = repRelationship.representative.id;
        const representativePayload = {
          firstNames: formData.representativeFirstNames,
          lastNames: formData.representativeLastNames,
          identificationNumber: formData.representativeIdentification,
          birthDate: formData.representativeBirthDate ? new Date(formData.representativeBirthDate) : undefined,
          gender: formData.representativeGender,
          email: formData.representativeEmail,
          phone: formData.representativePhone,
          occupation: formData.representativeProfession,
        };
        await updateRepresentative({ id: repId, data: representativePayload });
      }

      const enrollment = selectedStudent.enrollments?.[0];
      if (enrollment) {
        const enrollmentPayload = {
          schoolYearId: formData.schoolYearId,
          sectionId: formData.sectionId,
          enrollmentDate: formData.enrollmentDate,
          status: enrollment.status,
        };
        await updateEnrollment({ id: enrollment.id, data: enrollmentPayload });
      }

      onClose();
      resetForm();
    } catch (error: unknown) {
      console.log(error);
    }
  };

  const sendForm = async (data: EnrollmentFormValues) => {
    try {
      await enrollmentMutation.mutateAsync({
        ...data,
        enrollmentType: enrollmentType || "regular",
        approvedSubjects: approvedSubjects.map((s) => ({
          ...s,
          schoolId: selectedSchoolId,
        })),
        pendingSubjects,
      });
      onClose();
      resetForm();
    } catch (error: unknown) {
      console.log(error);
    }
  };

  const validateStep = async () => {
    let fieldsToValidate: (keyof EnrollmentFormValues)[] = [];

    if (step === 1) {
      form.clearErrors(["firstNames", "lastNames", "identificationNumber", "birthDate", "gender"]);
      const result = step1Schema.safeParse(form.getValues());
      if (!result.success) {
        const issues = result.error?.issues ?? [];
        issues.forEach((err) => {
          form.setError(err.path[0] as keyof EnrollmentFormValues, { message: err.message ?? "" });
        });
        return;
      }
    } else if (step === 2) {
      form.clearErrors(["birthCountry", "state", "municipality", "parish", "currentParish", "address"]);
      const result = step2Schema.safeParse(form.getValues());
      if (!result.success) {
        const issues = result.error?.issues ?? [];
        issues.forEach((err) => {
          form.setError(err.path[0] as keyof EnrollmentFormValues, { message: err.message ?? "" });
        });
        return;
      }
    } else if (step === 3) {
      const vals = form.getValues();
      let hasError = false;

      form.clearErrors([
        "representativeFirstNames", "representativeLastNames", "representativeIdentification",
        "representativeBirthDate", "representativeGender", "representativeEmail",
        "representativePhone", "representativeRelation", "existingRepresentative",
      ]);

      if (vals.representativeMode === "create") {
        if (!vals.representativeFirstNames || vals.representativeFirstNames.trim().length < 2) {
          form.setError("representativeFirstNames", { message: "Los nombres del representante son requeridos" });
          hasError = true;
        }
        if (!vals.representativeLastNames || vals.representativeLastNames.trim().length < 2) {
          form.setError("representativeLastNames", { message: "Los apellidos del representante son requeridos" });
          hasError = true;
        }
        if (!vals.representativeIdentification || vals.representativeIdentification.trim().length < 6) {
          form.setError("representativeIdentification", { message: "La cédula del representante es requerida" });
          hasError = true;
        }
        if (!vals.representativeBirthDate || isNaN(new Date(vals.representativeBirthDate as Date | string).getTime())) {
          form.setError("representativeBirthDate", { message: "La fecha de nacimiento del representante es requerida" });
          hasError = true;
        }
        if (!vals.representativeGender) {
          form.setError("representativeGender", { message: "Seleccione el género del representante" });
          hasError = true;
        }
        if (!vals.representativeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vals.representativeEmail)) {
          form.setError("representativeEmail", { message: "Email inválido" });
          hasError = true;
        }
        if (!vals.representativePhone || vals.representativePhone.length < 10) {
          form.setError("representativePhone", { message: "El teléfono del representante es requerido" });
          hasError = true;
        }
        if (!vals.representativeRelation) {
          form.setError("representativeRelation", { message: "Indique la relación con el estudiante" });
          hasError = true;
        }
      } else {
        if (!vals.existingRepresentative) {
          form.setError("existingRepresentative", { message: "Seleccione un representante existente" });
          hasError = true;
        }
        if (!vals.representativeRelation) {
          form.setError("representativeRelation", { message: "Indique la relación con el estudiante" });
          hasError = true;
        }
      }

      if (hasError) return;

      if (isEditMode && vals.representativeMode === "create") {
        const repPersonId =
          selectedStudent?.representatives?.[0]?.representative?.user?.person?.id;
        const { exists } = await checkIdentification(
          vals.representativeIdentification || "",
          repPersonId,
        );
        if (exists) {
          toast.custom((t) => (
            <ToastMessage success={false} message="Esta cédula ya está registrada por otro estudiante o usuario" visible={t.visible} />
          ), { duration: 5000 });
          return;
        }
      }
    } else if (step === 4) {
      fieldsToValidate = ["schoolYearId", "levelId", "sectionId", "enrollmentDate"];
    } else if (step === 5 && enrollmentType === "repitiente") {
      if (!selectedSchoolId) {
        toast.custom((t) => (
          <ToastMessage success={false} message="Seleccione la escuela de origen" visible={t.visible} />
        ), { duration: 3000 });
        return;
      }
      const missingSubjects = levelSubjects.filter(ls =>
        !approvedSubjects.some(a => a.levelSubjectId === ls.id)
      );
      if (missingSubjects.length > 0) {
        toast.custom((t) => (
          <ToastMessage success={false} message={`Faltan materias por indicar: ${missingSubjects.map(s => s.subject.subject).join(", ")}`} visible={t.visible} />
        ), { duration: 4000 });
        return;
      }
      for (const subj of approvedSubjects) {
        if (!subj.isRepeating) {
          if (subj.finalScore === undefined || subj.finalScore === null) {
            toast.custom((t) => (
              <ToastMessage success={false} message={`La materia "${subj.subjectName}" necesita una calificación`} visible={t.visible} />
            ), { duration: 3000 });
            return;
          }
          if (!subj.typeOf) {
            toast.custom((t) => (
              <ToastMessage success={false} message={`Seleccione el tipo de aprobación de ${subj.subjectName}`} visible={t.visible} />
            ), { duration: 3000 });
            return;
          }
          if (!subj.approvalDate) {
            toast.custom((t) => (
              <ToastMessage success={false} message={`La fecha de aprobación de ${subj.subjectName} es requerida`} visible={t.visible} />
            ), { duration: 3000 });
            return;
          }
        }
      }
    } else if (step === 5 && enrollmentType === "pending") {
      if (pendingSubjects.length === 0) {
        toast.custom((t) => (
          <ToastMessage success={false} message="Seleccione al menos una materia pendiente" visible={t.visible} />
        ), { duration: 3000 });
        return;
      }
      if (pendingSubjects.length > 2) {
        toast.custom((t) => (
          <ToastMessage success={false} message="Máximo 2 materias pendientes" visible={t.visible} />
        ), { duration: 3000 });
        return;
      }
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (isEditMode && step === 1) {
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

    if (isEditMode && step === 2) {
      setCompletedStep(prev => Math.max(prev, step));
      setStep(4);
    } else if (step < totalSteps) {
      setCompletedStep(prev => Math.max(prev, step));
      setStep(step + 1);
    } else if (isEditMode) {
      await submitEdit();
    } else {
      form.handleSubmit(sendForm)();
    }
  };

  const goBack = () => {
    if (isEditMode && step === 4) {
      setStep(2);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const resetForm = () => {
    form.reset();
    setStep(1);
    setCompletedStep(mode === "edit" ? totalSteps : 0);
    setStudentPhotoPreview(null);
    setRepSearchQuery("");
    setRepSearchResults([]);
    setApprovedSubjects([]);
    setPendingSubjects([]);
    setLevelSubjects([]);
    setSelectedSchoolId(null);
  };

  const handleStudentPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const isPending = isEditMode ? false : enrollmentMutation.isPending;
  const isLastStep = step === totalSteps;

  const locationFieldRenderer = (field: FormField) => {
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
            label="Municipio de Nacimiento"
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

  return {
    form,
    trigger,
    setValue,
    watch,
    isEditMode,
    enrollmentType,
    studentPhotoPreview,
    completedStep,
    setCompletedStep,
    schoolYearField,
    levelField,
    sectionField,
    isLevelDisabled,
    isSectionDisabled,
    levels,
    schools,
    countryOptions,
    stateOptions,
    municipalityOptions,
    parishOptions,
    birthCountry,
    state,
    municipality,
    locationFieldRenderer,
    representativeMode,
    repSearchQuery,
    repSearchResults,
    repSearchOpen,
    repHighlightIdx,
    repSearchRef,
    handleRepSearchChange,
    handleRepKeyDown,
    selectRepresentative,
    levelSubjects,
    loadingSubjects,
    approvedSubjects,
    setApprovedSubjects,
    pendingSubjects,
    setPendingSubjects,
    selectedSchoolId,
    setSelectedSchoolId,
    previousYearEndDate,
    previousLevelName,
    goBack,
    validateStep,
    resetForm,
    handleStudentPhotoChange,
    removeStudentPhoto,
    isPending,
    isLastStep,
    f1: step1ByName,
    f3: step3ByName,
  };
}
