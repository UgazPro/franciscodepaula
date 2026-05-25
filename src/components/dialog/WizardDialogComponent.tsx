import { Dialog, DialogContent, DialogDescription, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface WizardDialogComponentProps {
  openDialog: boolean;
  onClose: (open: boolean) => void;

  title: string;
  description?: string;

  step: number;
  totalSteps: number;

  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;

  isSubmitting?: boolean;

  children: React.ReactNode;
}

export default function WizardDialogComponent({
  openDialog,
  onClose,
  title,
  description,
  step,
  totalSteps,
  onNext,
  onBack,
  onFinish,
  isSubmitting,
  children,
}: WizardDialogComponentProps) {

  const progress = (step / totalSteps) * 100;

  return (
    <Dialog open={openDialog} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden rounded-2xl max-w-3xl">

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4">
          <div className="flex justify-between items-start">

            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {title}
              </DialogTitle>

              {description && (
                <DialogDescription className="text-blue-100 text-sm mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>

            <button
              onClick={() => onClose(false)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* STEPPER */}
          <div className="mt-4">
            <Progress value={progress} className="h-1.5 bg-white/20" />

            <div className="flex justify-between mt-2 text-xs text-blue-100">
              <span className={step >= 1 ? "text-green-400" : ""}>
                Paso 1
              </span>
              <span className={step >= 2 ? "text-green-400" : ""}>
                Paso 2
              </span>
              <span className={step >= 3 ? "text-green-400" : ""}>
                Paso 3
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 h-100 overflow-y-auto">
          {children}
        </div>

        {/* FOOTER */}
        <div className="border-t px-6 py-3 flex justify-between bg-white">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={step === 1}
          >
            <ChevronLeft size={16} className="mr-2" />
            Anterior
          </Button>

          {step < totalSteps ? (
            <Button onClick={onNext}>
              Siguiente
              <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button onClick={onFinish} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Finalizar"}
              {!isSubmitting && <Check size={16} className="ml-2" />}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}