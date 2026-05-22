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

export default function TabsComponent<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = "",
}: TabsComponentProps<T>) {

  return (

    <div
      className={`
        flex flex-wrap gap-1
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
            className={`group rounded-none rounded-t-xl px-5 py-2 h-auto flex items-center gap-2 border-b-[3px] transition-all duration-300 cursor-pointer ${isActive ? ` bg-white text-(--darkBlueColor) border-(--greenColor) shadow-[0_-2px_12px_rgba(12,18,143,0.06)]` : ` bg-transparent text-(--lightBlueColor) border-transparent hover:bg-white hover:text-(--blueColor)`}`}
          >

            {tab.icon && (
              <span
                className={`
                  transition-colors
                  duration-300

                  ${isActive
                    ? "text-(--greenColor)"
                    : "text-(--lightBlueColor) group-hover:text-(--blueColor)"
                  }
                `}
              >
                {tab.icon}
              </span>
            )}

            <span className="font-medium">
              {tab.label}
            </span>

          </Button>

        );

      })}

    </div>

  );

}