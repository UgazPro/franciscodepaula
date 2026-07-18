import type { FormField, OtherField, MultiSelectField as MultiSelectFieldType, GradeField as GradeFieldType } from "@/components/form/formComponent.interface";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { CalendarFieldComponent } from "@/components/form/renderFormComponents/CalendarFieldComponent";
import { SelectComponentForm } from "@/components/form/renderFormComponents/SelectComponent";
import { MultiSelectField } from "@/components/fieldRenderer/MultiSelectField";
import type { FieldValues, UseFormReturn, FieldPath } from "react-hook-form";

interface FieldRendererProps<T extends FieldValues = FieldValues> {
  field: FormField;
  disabled?: boolean;
  customFieldRenderer?: (
    field: OtherField,
    form: UseFormReturn<T>
  ) => React.ReactNode;
}

const inputBase =
  "w-full px-4 h-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent";

const inputBaseArea =
  "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent";

const labelStyle =
  "block text-sm font-medium text-(--darkBlueColor) mb-1";

const selectStyle = "text-sm font-medium text-(--darkBlueColor) block";

export function FieldRenderer<T extends FieldValues = FieldValues>({
  field,
  disabled,
  customFieldRenderer,
}: FieldRendererProps<T>) {
  const form = useFormContext<T>();

  const errorMessage = form.formState.errors[field.name as keyof T]?.message as string | undefined;
  const hasError = !!errorMessage;

  if (field.type === "other") {
    return customFieldRenderer?.(field as OtherField, form) ?? null;
  }

  if (field.type === "date") {
    return (
      <div>
        <label className={labelStyle}>
          {field.label} <span className="text-red-500">*</span>
        </label>
        <Controller
          control={form.control}
          name={field.name as FieldPath<T>}
          render={({ field: controllerField }) => (
            <CalendarFieldComponent
              value={controllerField.value as Date | undefined}
              onChange={controllerField.onChange}
            />
          )}
        />
        {hasError && (
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <SelectComponentForm
          form={form}
          name={field.name}
          label={field.label}
          placeholder={field.placeholder || "Seleccione..."}
          options={field.options || []}
          disabled={disabled}
          labelStyle={selectStyle}
        />
        {hasError && (
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label className={labelStyle}>
          {field.label} <span className="text-red-500">*</span>
        </label>
        <textarea
          {...form.register(field.name as FieldPath<T>)}
          rows={3}
          className={cn(
            inputBaseArea,
            hasError ? "border-red-500" : "border-(--lightBlueColor)/30",
          )}
          placeholder="Describa los objetivos de la evaluación..."
        />
        {hasError && (
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  if (field.type === "multiselect") {
    const msField = field as MultiSelectFieldType;
    return (
      <div>
        <MultiSelectField
          name={field.name}
          label={field.label}
          options={msField.options}
          disabled={disabled}
          placeholder={msField.placeholder || "Seleccione..."}
        />
        {hasError && (
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  if (field.type === "grade") {
    const gField = field as GradeFieldType;
    const min = gField.min ?? 1;
    const max = gField.max ?? 20;
    return (
      <div>
        {field.label && (
          <label className={labelStyle}>{field.label}</label>
        )}
        <Controller
          control={form.control}
          name={field.name as FieldPath<T>}
          render={({ field: controllerField }) => (
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={controllerField.value ?? ""}
              placeholder={gField.placeholder || "—"}
              onKeyDown={(e) => {
                if (["-", "e", "E", ".", ",", "+"].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9]/g, "");
                if (cleaned === "") {
                  controllerField.onChange(null);
                  return;
                }
                const num = parseInt(cleaned, 10);
                const clamped = Math.min(max, Math.max(min, num));
                controllerField.onChange(clamped);
              }}
              className={cn(
                "w-12 h-8 px-1 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-(--blueColor) bg-white",
                gField.inputClassName
              )}
            />
          )}
        />
        {hasError && (
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  if (field.type === "text") {
    return (
      <div>
        <label className={labelStyle}>
          {field.label} <span className="text-red-500">*</span>
        </label>
        <input
          type={field.inputType || "text"}
          disabled={disabled}
          {...form.register(field.name as FieldPath<T>, { valueAsNumber: field.inputType === "number" })}
          placeholder={field.placeholder || `Ingrese ${field.label.toLowerCase()}`}
          className={cn(
            inputBase,
            disabled && "bg-gray-100 cursor-not-allowed opacity-70",
            hasError ? "border-red-500" : "border-(--lightBlueColor)/30",
          )}
        />
        {hasError && (
          <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  return null;
}
