import type { FormField, OtherField } from "@/components/form/formComponent.interface";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { CalendarFieldComponent } from "@/components/form/renderFormComponents/CalendarFieldComponent";
import { SelectComponentForm } from "@/components/form/renderFormComponents/SelectComponent";
import type { FieldValues, UseFormReturn } from "react-hook-form";

interface FieldRendererProps<T extends FieldValues = FieldValues> {
  field: FormField;
  disabled?: boolean;
  customFieldRenderer?: (
    field: OtherField,
    form: UseFormReturn<T>,
  ) => React.ReactNode;
}

const inputBase =
  "w-full px-4 h-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent";

const inputBaseArea =
  "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--blueColor) focus:border-transparent";

const labelStyle =
  "block text-sm font-medium text-(--darkBlueColor) mb-1";

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
          name={field.name as any}
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
          labelStyle={labelStyle}
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
          {...form.register(field.name as any)}
          rows={3}
          className={cn(
            inputBaseArea,
            hasError ? "border-red-500" : "border-(--lightBlueColor)/30",
          )}
          placeholder="Ej: Av. Principal, Casa #123, Urbanización Las Mercedes"
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
          {...form.register(field.name as any, { valueAsNumber: field.inputType === "number" })}
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
