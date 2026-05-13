import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface TabsComponentProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
}

export default function TabsComponent<T extends string>({ tabs, activeTab, onChange, className = "", } : TabsComponentProps<T>) {
    
  return (
    <div
      className={`
        flex flex-wrap gap-2 p-2
        bg-(--grayColor)
        border border-(--lightBlueColor)/30
        rounded-2xl shadow-sm
        ${className}
      `}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;

        return (
          <Button
            key={tab.value}
            type="button"
            variant="ghost"
            onClick={() => onChange(tab.value)}
            className={`
              flex-1 min-w-35
              rounded-xl
              font-medium
              transition-all duration-300
              border
              cursor-pointer
              ${isActive ? `bg-linear-to-r from-(--blueColor) to-(--darkBlueColor) text-white border-(--blueColor) shadow-md hover:from-(--darkBlueColor) hover:to-(--blueColor)` : `bg-white text-(--darkBlueColor) border-transparent hover:bg-(--lightBlueColor)/15 hover:text-(--blueColor) hover:border-(--lightBlueColor)/40`}
            `}
          >
            {tab.icon && (
              <span
                className={`
                  mr-2 flex items-center
                  ${isActive ? "text-white" : "text-(--blueColor)"}
                `}
              >
                {tab.icon}
              </span>
            )}

            <span className="truncate">
              {tab.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}