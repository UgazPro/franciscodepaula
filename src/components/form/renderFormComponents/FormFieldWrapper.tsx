import { Label } from "@/components/ui/label";
import ErrorMessage from "./ErrorMessage";

interface Props {

    label?: string;

    error?: string;

    children: React.ReactNode;
}

export function FormFieldWrapper({
    label,
    error,
    children,
}: Props) {

    return (

        <div className="space-y-1">

            {label && (

                <Label
                    className="
                        block
                        text-sm
                        font-medium
                        text-gray-700
                    "
                >
                    {label}
                </Label>

            )}

            {children}

            {error && (

                <ErrorMessage>
                    {error}
                </ErrorMessage>

            )}

        </div>

    );

}