import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
    whatsDeleting: string;
    onConfirm: () => void;
    buttonStyles?: string;
    buttonText?: string;
    buttonType?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | "clickRed" | null;
    preposition?: string;
}

export function DeleteDialog({
    whatsDeleting,
    onConfirm,
    buttonStyles,
    buttonText,
    buttonType,
    preposition,
}: DeleteDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant={buttonType ? buttonType : "ghost"}
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className={buttonStyles}
                >
                    <Trash2 />
                    {buttonText}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-md p-0 overflow-hidden"
            >
                <div className="p-6 text-center">

                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={28} className="text-red-600" />
                    </div>

                    {/* TITULO */}
                    <AlertDialogHeader className="items-center text-center">
                        <AlertDialogTitle className="w-full text-center text-xl font-bold text-gray-800 mb-2">
                            ¿Eliminar estudiante?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-gray-500 text-center">
                            ¿Estás seguro de que deseas eliminar {preposition}{" "}
                            <strong>{whatsDeleting}</strong>? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* BOTONES */}
                    <AlertDialogFooter className="flex gap-3 mt-6">
                        <AlertDialogCancel className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                            Cancelar
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}