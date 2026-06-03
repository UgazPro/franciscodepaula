import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Check, Camera, X, ArrowLeft } from "lucide-react";
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
import { useSchoolYears, useLevels, useSections } from "@/hooks/useSchoolYears";
import type { IStudent } from "@/services/users/user.interface";

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
  const enrollmentMutation = useEnrollmentMutation();
  const { mutateAsync: updateStudent } = useUpdateStudent();
  const { mutateAsync: updateRepresentative } = useUpdateRepresentative();
  const { mutateAsync: updateEnrollment } = useUpdateEnrollment();
  const { data: schoolYears = [] } = useSchoolYears();
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
      representativeFirstNames: "",
      representativeLastNames: "",
      representativeIdentification: "",
      representativeBirthDate: new Date(),
      representativeGender: "",
      representativeEmail: "",
      representativePhone: "",
      representativeRelation: "",
      representativeProfession: "",
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
  const isLevelDisabled = !schoolYearId;
  const isSectionDisabled = !schoolYearId || !levelId;

  const schoolYearField = useMemo(() => {
    const field = step4ByName.schoolYearId;
    if (field.type === "select") {
      field.options = (schoolYears ?? []).map((sy: any) => ({
        label: sy.name,
        value: sy.id,
      }));
    }
    return step4ByName;
  }, [schoolYears]);

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

  useEffect(() => {
    form.clearErrors();
  }, [step]);

  useEffect(() => {
    form.setValue("sectionId", undefined as any);
  }, [schoolYearId, levelId]);

  const validateStep = async () => {
    let fieldsToValidate: (keyof EnrollmentFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ["firstNames", "lastNames", "identificationNumber", "birthDate", "gender"];
    } else if (step === 2) {
      fieldsToValidate = ["birthCountry", "state", "municipality", "parish", "currentParish", "address"];
    } else if (step === 3) {
      fieldsToValidate = [
        "representativeFirstNames", "representativeLastNames", "representativeIdentification",
        "representativeBirthDate", "representativeGender", "representativeEmail",
        "representativePhone", "representativeRelation",
      ];
    } else if (step === 4) {
      fieldsToValidate = ["schoolYearId", "levelId", "sectionId", "enrollmentDate"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        await submitEdit();
      }
    }
  };

  const submitEdit = async () => {
    if (!selectedStudent) return;

    const formData = form.getValues();
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
      await updateStudent({ id: selectedStudent.id, data: studentPayload });

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
        await updateRepresentative({ id: repId, data: representativePayload });
      }

      const enrollment = selectedStudent.enrollments?.[0];
      if (enrollment) {
        const enrollmentPayload = {
          schoolYearId: formData.schoolYearId,
          sectionId: formData.sectionId,
          enrollmentDate: formData.enrollmentDate,
          status: true,
        };
        await updateEnrollment({ id: enrollment.id, data: enrollmentPayload });
      }

      onClose();
      resetForm();
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const sendForm = async (data: EnrollmentFormValues) => {
    try {
      await enrollmentMutation.mutateAsync(data);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const resetForm = () => {
    form.reset();
    setStep(1);
    setStudentPhotoPreview(null);
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
  const f2 = step2ByName;
  const f3 = step3ByName;

  const isPending = isEditMode ? false : enrollmentMutation.isPending;

  const isLastStep = isEditMode ? step === totalSteps : step === totalSteps;

  const handleStepClick = (targetStep: number) => {
    setStep(targetStep);
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
                <FieldRenderer field={f2.birthCountry} />
                <FieldRenderer field={f2.state} />
                <FieldRenderer field={f2.municipality} />
                <FieldRenderer field={f2.parish} />
                <FieldRenderer field={f2.currentParish} />
                <FieldRenderer field={f2.previousSchool} />
                <FieldRenderer field={f2.admissionDate} />
                <div className="md:col-span-2">
                  <FieldRenderer field={f2.address} />
                </div>
              </div>
            )}

            {/* ==================== PASO 3: DATOS DEL REPRESENTANTE ==================== */}
            {step === 3 && (
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
