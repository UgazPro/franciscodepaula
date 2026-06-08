import { Check } from "lucide-react";
import type { FC } from "react";

interface ToastMessageProps {
    success: boolean;
    message: string;
    visible: boolean;
}

export const ToastMessage: FC<ToastMessageProps> = ({ success, message, visible }) => {
    const containerClasses = success
        ? "border-emerald-300/70 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-900/20"
        : "border-rose-300/70 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-900/20";

    const iconWrapClasses = success
        ? "bg-emerald-100/20 ring-1 ring-emerald-50/35"
        : "bg-rose-100/20 ring-1 ring-rose-50/35";

    return (
        <div
            className={[
                "pointer-events-auto w-[min(92vw,420px)] rounded-xl border px-4 py-3",
                "backdrop-blur-sm shadow-lg",
                "flex items-start gap-3",
                "transition-all duration-300 ease-out",
                visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6",
                containerClasses,
            ].join(" ")}
        >
            {success && (
                <span className={["mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full", iconWrapClasses].join(" ")}>
                    <Check className="h-4 w-4" />
                </span>
            )}

            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/80">
                    {success ? "Operacion exitosa" : "Operacion fallida"}
                </p>
                <p className="mt-0.5 text-sm font-semibold leading-5 wrap-break-word">{message}</p>
            </div>
        </div>
    )
}