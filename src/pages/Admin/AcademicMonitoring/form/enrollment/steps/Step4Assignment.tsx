import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { step4ByName } from "./step4Fields.data";
import type { FormField } from "@/components/form/formComponent.interface";

interface Step4AssignmentProps {
  schoolYearField: Record<string, FormField>;
  levelField: Record<string, FormField>;
  sectionField: Record<string, FormField>;
  isLevelDisabled: boolean;
  isSectionDisabled: boolean;
}

export default function Step4Assignment({
  schoolYearField,
  levelField,
  sectionField,
  isLevelDisabled,
  isSectionDisabled,
}: Step4AssignmentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <FieldRenderer field={schoolYearField.schoolYearId} />
      <FieldRenderer field={levelField.levelId} disabled={isLevelDisabled} />
      <FieldRenderer field={sectionField.sectionId} disabled={isSectionDisabled} />
      <FieldRenderer field={step4ByName.enrollmentDate} />
    </div>
  );
}
