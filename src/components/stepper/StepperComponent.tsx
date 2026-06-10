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
    <div className="py-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gray-100" />

        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-(--blueColor) transition-all duration-500"
          style={{ width: `${(currentStep - 1) / (steps.length - 1) * 100}%` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div key={index} className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => onStepClick(stepNumber)}
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 cursor-pointer relative z-10
                  ${isCompleted ? "bg-(--greenColor) text-white" : ""}
                  ${isActive ? "bg-(--blueColor) text-white ring-4 ring-(--blueColor)/20" : ""}
                  ${!isActive && !isCompleted ? "bg-gray-200 text-gray-400 hover:bg-gray-300" : ""}
                `}
              >
                {isCompleted ? <Check size={12} /> : stepNumber}
              </button>

              <span
                onClick={() => onStepClick(stepNumber)}
                className={`text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "text-(--darkBlueColor) font-semibold"
                    : isCompleted
                      ? "text-(--greenColor)"
                      : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100/60 mt-4" />
    </div>
  );
}
