import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import AdminSidebar from "../Sidebar/AdminSidebar/AdminSidebar";
import AdminHeader from "./AdminHeader";
import DialogComponent from "@/components/dialog/DialogComponent";
import PersonDetailView from "./PersonDetailView";
import { useSearchStore } from "@/stores/search.store";

export default function AdminLayout() {
    const { isDetailOpen, closeDetail } = useSearchStore();
    const location = useLocation();

    useEffect(() => {
        closeDetail();
    }, [location.pathname, closeDetail]);

    return (
        <div className="flex relative h-full min-h-screen w-full bg-gray-200 justify-end">
            {/* Sidebar Desktop */}
            <div className="hidden md:block">
                <AdminSidebar />
            </div>

            <div className="min-h-screen w-full md:pl-12 flex flex-col">
                {/* Header */}
                <AdminHeader />

                {/* Main Content */}
                <main className="flex-1 px-4 md:px-6 pt-4 md:pt-6 overflow-x-hidden md:mb-5">
                    <div className="px-6">
                        <Outlet />
                    </div>
                </main>

            </div>

            {/* Global search result detail modal */}
            <DialogComponent
                openDialog={isDetailOpen}
                onClose={() => closeDetail()}
                dialogTitle=""
                className="max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <PersonDetailView />
            </DialogComponent>
        </div>
    );
}