import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TooltipComponentProps {
  content: string;
  children: React.ReactNode;
}

export function TooltipComponent({ content, children }: TooltipComponentProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={4}>
          <p className="max-w-xs text-xl">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
