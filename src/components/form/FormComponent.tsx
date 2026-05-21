import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectComponentForm } from "./renderFormComponents/SelectComponent";
import { CalendarFieldComponent } from "./renderFormComponents/CalendarFieldComponent";
import { Controller } from "react-hook-form";
import ErrorMessage from "./renderFormComponents/ErrorMessage";
import { MultiSelectField } from "./renderFormComponents/MultiSelectField";
import type { FormField } from "./formComponent.interface";

interface FormComponentProps {
    fields: FormField[];
    form: any;
    otherType?: React.ReactNode;
}

export function FormComponent({ fields, form, otherType, }: FormComponentProps) {

    const inputStyle = `
        bg-white
        border-2
        border-(--lightBlueColor)/30
        rounded-xl
        shadow-sm

        focus-visible:ring-0
        focus-visible:border-(--blueColor)

        hover:border-(--lightBlueColor)
        transition-all
        duration-200
    `;

    const wrapperStyle = `
        rounded-2xl
        bg-white
        border
        border-(--lightBlueColor)/25
        shadow-sm

        px-5
        py-4

        hover:shadow-md
        hover:border-(--lightBlueColor)/50

        transition-all
        duration-300
    `;

    const labelStyle = `
        text-sm
        font-semibold
        text-(--darkBlueColor)
        block
    `;

    return (
        <div className="space-y-5">

            {fields.map((field) => {

                switch (field.type) {

                    case "text":
                        return (
                            <div
                                key={field.name}
                                className={wrapperStyle}
                            >
                                <Label className={labelStyle}>
                                    {field.label}
                                </Label>

                                <Controller
                                    control={form.control}
                                    name={field.name}
                                    render={({ field }) => (
                                        <Input {...field} className={inputStyle} />
                                    )}
                                />

                                {form.formState.errors[field.name] && (
                                    <ErrorMessage>
                                        {form.formState.errors[field.name]?.message}
                                    </ErrorMessage>
                                )}
                            </div>
                        );

                    case "textarea":
                        return (
                            <div
                                key={field.name}
                                className={wrapperStyle}
                            >
                                <Label className={labelStyle}>
                                    {field.label}
                                </Label>

                                <Controller
                                    control={form.control}
                                    name={field.name}
                                    render={({ field: controllerField }) => (
                                        <Textarea
                                            {...controllerField}
                                            className={`${inputStyle} min-h-25 resize-none`}
                                            value={controllerField.value ?? ""}
                                        />
                                    )}
                                />

                                {form.formState.errors[field.name] && (
                                    <ErrorMessage>
                                        {form.formState.errors[field.name]?.message}
                                    </ErrorMessage>
                                )}
                            </div>
                        );

                    case "select":
                        return (
                            <div
                                key={field.name}
                                className={wrapperStyle}
                            >
                                <SelectComponentForm
                                    form={form}
                                    name={field.name}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    options={field.options}
                                    disabled={field.disabled}
                                    labelStyle={labelStyle}
                                />

                                {form.formState.errors[field.name] && (
                                    <ErrorMessage>
                                        {form.formState.errors[field.name]?.message}
                                    </ErrorMessage>
                                )}
                            </div>
                        );

                    case "date":
                        return (
                            <div
                                key={field.name}
                                className={wrapperStyle}
                            >
                                <Label className={labelStyle}>
                                    {field.label}
                                </Label>

                                <Controller
                                    control={form.control}
                                    name={field.name}
                                    render={({ field: controllerField }) => (
                                        <CalendarFieldComponent
                                            value={controllerField.value}
                                            onChange={controllerField.onChange}
                                        />
                                    )}
                                />

                                {form.formState.errors[field.name] && (
                                    <ErrorMessage>
                                        {form.formState.errors[field.name]?.message}
                                    </ErrorMessage>
                                )}
                            </div>
                        );

                    case "multiselect":
                        return (
                            <div
                                key={field.name}
                                className={wrapperStyle}
                            >
                                <MultiSelectField
                                    form={form}
                                    name={field.name}
                                    label={field.label}
                                    options={field.options}
                                    disabled={field.disabled}
                                    placeholder={field.placeholder!}
                                />

                                {form.formState.errors[field.name] && (
                                    <ErrorMessage>
                                        {form.formState.errors[field.name]?.message}
                                    </ErrorMessage>
                                )}
                            </div>
                        );

                    case "other":
                        return (
                            <div
                                key={field.name}
                                className={`
                                    ${wrapperStyle}
                                    bg-linear-to-b
                                    from-white
                                    to-(--grayColor)
                                `}
                            >
                                {otherType}
                            </div>
                        );

                    default:
                        return null;
                }

            })}
        </div>
    );
}