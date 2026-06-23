import { useState } from "react";
import TabsComponent from "@/components/tabs/TabsComponent";
import Rates from "./Rates";
import Employees from "./Employees";

type ActiveTab = "tarifas" | "empleados";

const tabs = [
  { value: "tarifas" as const, label: "Tarifas" },
  { value: "empleados" as const, label: "Empleados" },
];

export default function SchoolManagement() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tarifas");

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <TabsComponent tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex-1 min-h-0">
        {activeTab === "tarifas" && <Rates />}
        {activeTab === "empleados" && <Employees />}
      </div>
    </div>
  );
}
