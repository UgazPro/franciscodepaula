import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { Check } from "lucide-react";
import { formFieldsByName } from "./complete-enrollment.data";
import { completeEnrollmentSchema, type CompleteEnrollmentFormValues } from "./complete-enrollment.schema";
import { useAssignSection } from "@/queries/useEnrollmentMutations";
import { useEnrollmentsStore } from "@/stores/enrollments.store";
import { useSchoolYears, useLevels, useSections } from "@/hooks/useSchoolYears";

export function CompleteEnrollmentForm() {
  const { selectedStudentId, closeCompleteModal } = useEnrollmentsStore();
  const { data: schoolYears = [] } = useSchoolYears();
  const { data: levels = [] } = useLevels();
  const { data: sections = [] } = useSections();
  const { mutateAsync: assignSection, isPending } = useAssignSection();

  const form = useForm<CompleteEnrollmentFormValues>({
    resolver: zodResolver(completeEnrollmentSchema),
    defaultValues: {
      schoolYearId: undefined as any,
      levelId: undefined as any,
      sectionId: undefined as any,
      enrollmentDate: new Date(),
    },
    shouldUnregister: false,
  });

  const schoolYearId = form.watch("schoolYearId");
  const levelId = form.watch("levelId");
  const isLevelDisabled = !schoolYearId;
  const isSectionDisabled = !schoolYearId || !levelId;

  const schoolYearField = useMemo(() => {
    const field = formFieldsByName.schoolYearId;
    if (field.type === "select") {
      field.options = (schoolYears ?? []).map((sy: any) => ({
        label: sy.name,
        value: sy.id,
      }));
    }
    return formFieldsByName.schoolYearId;
  }, [schoolYears]);

  const levelField = useMemo(() => {
    const field = formFieldsByName.levelId;
    if (field.type === "select") {
      field.options = (levels ?? []).map((l: any) => ({
        label: l.level,
        value: l.id,
      }));
    }
    return formFieldsByName.levelId;
  }, [levels]);

  const filteredSections = useMemo(() => {
    if (!schoolYearId || !levelId) return [];
    return (sections ?? []).filter(
      (s: any) => s.schoolYearId === schoolYearId && s.highSchoolLevelId === levelId,
    );
  }, [sections, schoolYearId, levelId]);

  const sectionField = useMemo(() => {
    const field = formFieldsByName.sectionId;
    if (field.type === "select") {
      field.options = filteredSections.map((s: any) => ({
        label: `${s.section} - ${s.level?.level ?? ""}`,
        value: s.id,
      }));
    }
    return formFieldsByName.sectionId;
  }, [filteredSections]);

  useEffect(() => {
    form.clearErrors();
  }, []);

  useEffect(() => {
    form.setValue("sectionId", undefined as any);
  }, [schoolYearId, levelId]);

  const onSubmit = async (data: CompleteEnrollmentFormValues) => {
    if (!selectedStudentId) return;
    try {
      await assignSection({
        studentId: selectedStudentId,
        schoolYearId: data.schoolYearId,
        sectionId: data.sectionId,
        enrollmentDate: data.enrollmentDate,
      });
      closeCompleteModal();
      form.reset();
    } catch (error) {
      console.error("Error al asignar sección:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FieldRenderer field={schoolYearField} />
            <FieldRenderer field={levelField} disabled={isLevelDisabled} />
            <FieldRenderer field={sectionField} disabled={isSectionDisabled} />
            <FieldRenderer field={formFieldsByName.enrollmentDate} />
          </div>

          <div className="flex justify-end pt-6 border-t border-(--lightBlueColor)/20">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) hover:brightness-110 text-white shadow-md cursor-pointer disabled:opacity-60"
            >
              {isPending ? "Guardando..." : "Completar Inscripción"}
              {!isPending && <Check size={16} className="ml-2" />}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
