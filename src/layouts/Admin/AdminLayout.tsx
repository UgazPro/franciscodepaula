import { Outlet } from "react-router";
import AdminSidebar from "../Sidebar/AdminSidebar/AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

export default function AdminLayout() {
    return (
        <div className="flex relative h-full min-h-screen w-full bg-gray-50">
            {/* Sidebar Desktop */}
            <div className="hidden md:block">
                <AdminSidebar />
            </div>

            <div className="h-full w-full md:ml-16 flex flex-col">
                {/* Header */}
                <AdminHeader />

                {/* Main Content */}
                <main className="flex-1 px-4 md:px-6 py-4 md:py-6 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <AdminFooter />
            </div>
        </div>
    );
}