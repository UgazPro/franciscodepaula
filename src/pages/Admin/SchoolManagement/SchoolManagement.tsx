import { useState } from "react";
import TabsComponent from "@/components/tabs/TabsComponent";
import Rates from "./Rates";
import Employees from "./Employees";
import SchoolYearPanel from "./views/SchoolYearPanel";
import SubjectsView from "./views/SubjectsView";

type ActiveTab = "tarifas" | "empleados" | "school-year" | "materias";

const tabs = [
  { value: "tarifas" as const, label: "Tarifas" },
  { value: "empleados" as const, label: "Empleados" },
  { value: "school-year" as const, label: "Año Escolar" },
  { value: "materias" as const, label: "Materias" },
];

export default function SchoolManagement() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tarifas");

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <TabsComponent tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex-1 min-h-0">
        {activeTab === "tarifas" && <Rates />}
        {activeTab === "empleados" && <Employees />}
        {activeTab === "school-year" && <SchoolYearPanel />}
        {activeTab === "materias" && <SubjectsView />}
      </div>
    </div>
  );
}
