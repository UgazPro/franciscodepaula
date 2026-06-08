import { Controller } from "react-hook-form";
import { MultiSelectField } from "./MultiSelectField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectComponentForm } from "./SelectComponent";
import { CalendarFieldComponent } from "./CalendarFieldComponent";

interface FormRendererProps {
    field: any;
    form: any;
}

export function FormRenderer({ field, form, }: FormRendererProps) {

    const inputStyle = `
w-full
px-4
py-2

border

rounded-lg

focus:outline-none
focus:ring-2
focus:ring-green-500
focus:border-transparent

transition


`;

    switch (field.type) {

        case "text":

            return (

                <Controller
                    name={field.name}
                    control={form.control}
                    render={({ field: controller }) => (

                        <Input
                            {...controller}
                            type={field.inputType}
                            className={inputStyle}
                        />

                    )}
                />

            );

        case "textarea":

            return (

                <Controller
                    name={field.name}
                    control={form.control}
                    render={({ field: controller }) => (

                        <Textarea
                            {...controller}
                            className={`
        ${inputStyle}
        min-h-25
        resize-none
    `}
                        />

                    )}
                />

            );

        case "select":

            return (

                <SelectComponentForm
                    form={form}
                    {...field}
                />

            );

        case "date":

            return (

                <Controller
                    control={form.control}
                    name={field.name}
                    render={({ field: controller }) => (

                        <CalendarFieldComponent
                            value={controller.value}
                            onChange={controller.onChange}
                        />

                    )}
                />

            );

        case "multiselect":

            return (

                <MultiSelectField
                    form={form}
                    {...field}
                />

            );

        case "custom":

            return field.render;

        default:
            return null;
    }

}