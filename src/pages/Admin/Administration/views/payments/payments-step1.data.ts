import type { FormField } from "@/components/form/formComponent.interface";

export const step1Fields: FormField[] = [];

export const step1ByName = Object.fromEntries(
  step1Fields.map((f) => [f.name, f]),
) as Record<string, FormField>;
