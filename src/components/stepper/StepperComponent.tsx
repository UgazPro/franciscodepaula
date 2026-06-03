import { Check } from "lucide-react";

export interface Step {
  title: string;
  description: string;
}

interface StepperComponentProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function StepperComponent({ steps, currentStep, onStepClick }: StepperComponentProps) {
  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-start justify-between relative">
        {/* Línea de fondo */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />

        {/* Línea de progreso */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-(--blueColor) -z-10 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <button
                type="button"
                onClick={() => onStepClick(stepNumber)}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0 cursor-pointer
                  ${isCompleted ? "bg-(--greenColor) text-white" : ""}
                  ${isActive ? "bg-(--blueColor) text-white ring-4 ring-(--blueColor)/20" : ""}
                  ${!isActive && !isCompleted ? "bg-gray-200 text-gray-400 hover:bg-gray-300" : ""}
                  ${!isCompleted ? "hover:brightness-110" : ""}
                `}
              >
                {isCompleted ? <Check size={14} /> : stepNumber}
              </button>

              <div
                className="mt-2 text-center cursor-pointer"
                onClick={() => onStepClick(stepNumber)}
              >
                <p
                  className={`text-xs font-semibold leading-tight ${
                    isActive
                      ? "text-(--darkBlueColor)"
                      : isCompleted
                        ? "text-(--greenColor)"
                        : "text-gray-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5 hidden sm:block max-w-24">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
