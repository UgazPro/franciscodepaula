import { FieldRenderer } from "@/components/fieldRenderer/FieldRenderer";
import { step2ByName } from "./step2Fields.data";
import type { FormField } from "@/components/form/formComponent.interface";

interface Step2LocationDataProps {
  locationFieldRenderer: (field: FormField) => React.ReactNode;
}

export default function Step2LocationData({ locationFieldRenderer }: Step2LocationDataProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <FieldRenderer field={step2ByName.birthCountry} customFieldRenderer={locationFieldRenderer} />
      <FieldRenderer field={step2ByName.state} customFieldRenderer={locationFieldRenderer} />
      <FieldRenderer field={step2ByName.municipality} customFieldRenderer={locationFieldRenderer} />
      <FieldRenderer field={step2ByName.parish} customFieldRenderer={locationFieldRenderer} />
      <FieldRenderer field={step2ByName.currentParish} customFieldRenderer={locationFieldRenderer} />
      <FieldRenderer field={step2ByName.address} />
    </div>
  );
}
