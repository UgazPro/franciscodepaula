import { useState, useEffect, useMemo } from "react";
import { Home, Briefcase, CreditCard, Award, Users, Landmark } from "lucide-react";
import { useAdministrationStore } from "@/stores/administration.store";
import { usePaymentsStore } from "@/stores/payments.store";
import { useStudentsStore } from "@/stores/students.store";
import { useActiveSchoolYear } from "@/hooks/useSchoolYears";
import { useScholarships } from "@/hooks/useScholarships";
import TabsComponent, { type TabItem } from "@/components/tabs/TabsComponent";
import type { AdminTab } from "@/services/administration/administration.types";

import DashboardView from "./views/DashboardView";
import PayrollView from "./views/payroll/PayrollView";
import PaymentsView from "./views/PaymentsView";
import PaymentForm from "./views/payments/PaymentForm";
import StudentsView from "./views/StudentsView";
import StudentPaymentHistory from "./views/students/StudentPaymentHistory";
import ScholarshipsView from "./views/scholarships/ScholarshipsView";
import AccountsView from "./views/accounts/Accounts";
import PageTransitionComponent from "@/components/pageTransition/PageTransitionComponent";

export default function Administracion() {
    const { activeTab, setActiveTab } = useAdministrationStore();
    const [searchTerm] = useState("");

    const { data: activeSchoolYear } = useActiveSchoolYear();
    const { data: scholarshipsData } = useScholarships(activeSchoolYear?.id);
    const becasCount = Array.isArray(scholarshipsData?.data) ? scholarshipsData.data.length : 0;

    const { screen: paymentsScreen } = usePaymentsStore();
    const isPaymentsFormOpen = paymentsScreen === "form";
    const studentDetailOpen = useStudentsStore((s) => s.screen === "detail");
    const selectedStudent = useStudentsStore((s) => s.selectedStudent);
    const clearSelectedStudent = useStudentsStore((s) => s.clearSelectedStudent);

    useEffect(() => {
        usePaymentsStore.getState().setScreen("list");
        usePaymentsStore.getState().setStep(1);
        useAdministrationStore.getState().setActiveTab("dashboard");
        useStudentsStore.getState().clearSelectedStudent();
    }, []);

    const tabItems: TabItem<AdminTab>[] = [
        { value: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
        { value: "nominas", label: "Nóminas", icon: <Briefcase size={18} /> },
        { value: "pagos", label: "Pagos", icon: <CreditCard size={18} /> },
        { value: "becas", label: "Becas", icon: <Award size={18} /> },
        { value: "estudiantes", label: "Estudiantes", icon: <Users size={18} /> },
        { value: "cuentas", label: "Cuentas", icon: <Landmark size={18} /> },
    ];

    return (
        <div className="space-y-6">
            {activeTab === "pagos" ? (
                <PageTransitionComponent
                    primaryChildren={
                        <>
                            <div className="mb-4">
                                <TabsComponent<AdminTab> tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
                            </div>
                            <PaymentsView />
                        </>
                    }
                    secondaryChildren={<PaymentForm />}
                    toggle={isPaymentsFormOpen}
                />
            ) : activeTab === "estudiantes" ? (
                <PageTransitionComponent
                    primaryChildren={
                        <>
                            <div className="mb-4">
                                <TabsComponent<AdminTab> tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
                            </div>
                            <StudentsView />
                        </>
                    }
                    secondaryChildren={
                        selectedStudent ? (
                            <StudentPaymentHistory student={selectedStudent} onBack={clearSelectedStudent} />
                        ) : null
                    }
                    toggle={studentDetailOpen}
                />
            ) : (
                <>
                    <div className="mb-5">
                        <TabsComponent<AdminTab> tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
                    </div>

                    {activeTab === "dashboard" && (
                        <DashboardView
                            becasCount={becasCount}
                        />
                    )}

                    {activeTab === "nominas" && <PayrollView />}

                    {activeTab === "becas" && <ScholarshipsView />}

                    {activeTab === "cuentas" && <AccountsView />}
                </>
            )}
        </div>
    );
}
