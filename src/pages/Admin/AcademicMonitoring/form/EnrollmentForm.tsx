import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Check, ArrowLeft } from "lucide-react";
import type { EnrollmentFormValues } from "./enrollment/enrollment.schema";
import { STEPS, STEPS_REPITIENTE, STEPS_PENDING, EDIT_STEPS } from "./enrollment/enrollment.constants";
import StepperComponent from "@/components/stepper/StepperComponent";
import { useStudentsStore } from "@/stores/students.store";
import type { IStudent } from "@/services/users/user.interface";

import Step1PersonalData from "./enrollment/steps/Step1PersonalData";
import Step2LocationData from "./enrollment/steps/Step2LocationData";
import Step3Representative from "./enrollment/steps/Step3Representative";
import Step4Assignment from "./enrollment/steps/Step4Assignment";
import Step5Repitiente from "./enrollment/steps/Step5Repitiente";
import Step5Pending from "./enrollment/steps/Step5Pending";
import { useEnrollmentForm } from "./enrollment/useEnrollmentForm";

interface EnrollmentFormProps {
  onClose: () => void;
  initialData?: Partial<EnrollmentFormValues>;
  mode?: "create" | "edit";
  selectedStudent?: IStudent;
  step: number;
  setStep: (step: number) => void;
  totalSteps: number;
}

export function EnrollmentForm({ onClose, initialData, mode = "create", selectedStudent, step, setStep, totalSteps }: EnrollmentFormProps) {
  const isEditMode = mode === "edit";
  const enrollmentType = useStudentsStore((s) => s.enrollmentType);

  const baseSteps = useMemo(() => {
    if (isEditMode) return EDIT_STEPS;
    if (enrollmentType === "repitiente") return STEPS_REPITIENTE;
    if (enrollmentType === "pending") return STEPS_PENDING;
    return STEPS;
  }, [isEditMode, enrollmentType]);

  const toDisplayStep = useCallback((actual: number) => (isEditMode && actual > 2 ? actual - 1 : actual), [isEditMode]);
  const toActualStep = useCallback((display: number) => (isEditMode && display >= 3 ? display + 1 : display), [isEditMode]);

  const hook = useEnrollmentForm({ initialData, mode, selectedStudent, step, setStep, totalSteps, onClose });

  const getFieldsForStep = (stepNumber: number): (keyof EnrollmentFormValues)[] => {
    if (stepNumber === 1) return ["firstNames", "lastNames", "identificationNumber", "birthDate", "gender"];
    if (stepNumber === 2) return ["birthCountry", "state", "municipality", "parish", "currentParish", "address"];
    if (stepNumber === 3) {
      if (hook.representativeMode === "create") {
        return [
          "representativeMode", "representativeFirstNames", "representativeLastNames",
          "representativeIdentification", "representativeBirthDate", "representativeGender",
          "representativeEmail", "representativePhone", "representativeRelation",
        ] as (keyof EnrollmentFormValues)[];
      }
      return ["representativeMode", "existingRepresentative", "representativeRelation"] as (keyof EnrollmentFormValues)[];
    }
    if (stepNumber === 4) return ["schoolYearId", "levelId", "sectionId", "enrollmentDate"];
    return [];
  };

  const handleStepClick = async (targetStep: number) => {
    if (mode === "edit") {
      const isValid = await hook.trigger(getFieldsForStep(targetStep));
      if (!isValid) return;
    }
    if (mode === "edit" || targetStep <= hook.completedStep) {
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
          steps={baseSteps}
          currentStep={toDisplayStep(step)}
          onStepClick={(n) => handleStepClick(toActualStep(n))}
        />

        <Form {...hook.form}>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-6 mt-4">
              {step === 1 && (
                <Step1PersonalData
                  studentPhotoPreview={hook.studentPhotoPreview}
                  onPhotoChange={hook.handleStudentPhotoChange}
                  onPhotoRemove={hook.removeStudentPhoto}
                  f1={hook.f1}
                />
              )}

              {step === 2 && (
                <Step2LocationData locationFieldRenderer={hook.locationFieldRenderer} />
              )}

              {!isEditMode && step === 3 && (
                <Step3Representative
                  form={hook.form}
                  f3={hook.f3}
                  representativeMode={hook.representativeMode}
                  repSearchQuery={hook.repSearchQuery}
                  repSearchResults={hook.repSearchResults}
                  repSearchOpen={hook.repSearchOpen}
                  repHighlightIdx={hook.repHighlightIdx}
                  repSearchRef={hook.repSearchRef}
                  onRepSearchChange={hook.handleRepSearchChange}
                  onRepKeyDown={hook.handleRepKeyDown}
                  onSelectRepresentative={hook.selectRepresentative}
                />
              )}

              {step === 4 && (
                <Step4Assignment
                  schoolYearField={hook.schoolYearField}
                  levelField={hook.levelField}
                  sectionField={hook.sectionField}
                  isLevelDisabled={hook.isLevelDisabled}
                  isSectionDisabled={hook.isSectionDisabled}
                />
              )}

              {step === 5 && enrollmentType === "repitiente" && (
                <Step5Repitiente
                  levelSubjects={hook.levelSubjects}
                  loadingSubjects={hook.loadingSubjects}
                  approvedSubjects={hook.approvedSubjects}
                  setApprovedSubjects={hook.setApprovedSubjects}
                  schools={hook.schools}
                  selectedSchoolId={hook.selectedSchoolId}
                  setSelectedSchoolId={hook.setSelectedSchoolId}
                  previousYearEndDate={hook.previousYearEndDate}
                />
              )}

              {step === 5 && enrollmentType === "pending" && (
                <Step5Pending
                  levelSubjects={hook.levelSubjects}
                  loadingSubjects={hook.loadingSubjects}
                  pendingSubjects={hook.pendingSubjects}
                  setPendingSubjects={hook.setPendingSubjects}
                  previousLevelName={hook.previousLevelName}
                />
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between pt-6 border-t border-(--lightBlueColor)/20">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={hook.goBack}
                    className="cursor-pointer border-(--lightBlueColor)/50 text-(--darkBlueColor) hover:bg-(--grayColor)">
                    <ChevronLeft size={16} className="mr-2" />
                    Anterior
                  </Button>
                ) : (
                  <div />
                )}

                {!hook.isLastStep ? (
                  <Button type="button" onClick={hook.validateStep}
                    className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer">
                    Siguiente
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                ) : isEditMode ? (
                  <Button type="button" onClick={hook.validateStep}
                    className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer">
                    <Check size={16} className="mr-2" />
                    Guardar Cambios
                  </Button>
                ) : (
                  <Button type="button" disabled={hook.isPending} onClick={hook.validateStep}
                    className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer disabled:opacity-60">
                    {hook.isPending ? "Guardando..." : "Finalizar"}
                    {!hook.isPending && <Check size={16} className="ml-2" />}
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
