import { Outlet } from "react-router";
import Header from "../Header/Header";
import { Footer } from "../Footer/Footer";

export default function AppLayout() {

    return (
        <>
            <Header />

            <div className="flex min-h-screen flex-col w-full">
                <Outlet />
            </div>

            {/* <FloatingButtons /> */}

            <Footer />
        </>
    );
}
