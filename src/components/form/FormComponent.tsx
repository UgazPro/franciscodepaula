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

export function FormComponent({ fields, form, otherType }: FormComponentProps) {

    return (

        <div className="space-y-8">

            {fields.map((field) => {

                switch (field.type) {
                    case "text":
                        return (
                            <div key={field.name} className="space-y-2 relative">
                                <Label>{field.label}</Label>
                                <Input
                                    type={field.inputType ?? "text"}
                                    {...form.register(field.name)}
                                />
                                {form.formState.errors[field.name] && (<ErrorMessage>{form.formState.errors[field.name]?.message}</ErrorMessage>)}
                            </div>

                        );

                    case "textarea":
                        return (
                            <div key={field.name} className="space-y-2 relative">
                                <Label>{field.label}</Label>
                                <Textarea {...form.register(field.name)} />
                                {form.formState.errors[field.name] && (<ErrorMessage>{form.formState.errors[field.name]?.message}</ErrorMessage>)}
                            </div>
                        );

                    case "select":
                        return (
                            <div key={field.name} className="space-y-2 relative">

                                <SelectComponentForm
                                    form={form}
                                    name={field.name}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    options={field.options}
                                    disabled={field.disabled}
                                />
                                {form.formState.errors[field.name] && (<ErrorMessage>{form.formState.errors[field.name]?.message}</ErrorMessage>)}

                            </div>
                        );

                    case "date":
                        return (
                            <div key={field.name} className="space-y-2 relative">
                                <Label>{field.label}</Label>
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
                                {form.formState.errors[field.name] && (<ErrorMessage>{form.formState.errors[field.name]?.message}</ErrorMessage>)}
                            </div>
                        );

                    case "multiselect":
                        return (
                            <div key={field.name} className="space-y-2 relative">
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
                            <div key={field.name} className="space-y-2 relative">
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
