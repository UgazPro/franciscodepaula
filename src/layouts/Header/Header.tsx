import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router";
import { LogIn } from "lucide-react";
import NavBar from "../../components/navbars/NavBar";

export default function Header() {
    const location = useLocation();

    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isAdminPage = location.pathname.includes("/admin");
    const isLoginPage = location.pathname.includes("/login");
    const isPublicPage = !isAdminPage && !isLoginPage;

    const handleScroll = useCallback(() => {
        const currentScrollPos = window.scrollY;

        if (isPublicPage) {
            setVisible(
                currentScrollPos <= prevScrollPos || currentScrollPos < 50
            );
        }

        setPrevScrollPos(currentScrollPos);
    }, [prevScrollPos, isPublicPage]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <header
            className={
                isAdminPage || isLoginPage
                    ? "z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm transition-all"
                    : `sticky ${visible ? "top-0" : "-top-24"
                    } z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm transition-all duration-300`
            }
        >

            <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-7">

                <Link
                    to={isAdminPage ? "/admin" : "/"}
                    className="flex items-center space-x-2 md:space-x-3 group"
                >
                    <div className="h-11 w-11 flex items-center justify-center shrink-0">
                        <img src="logoF.png" alt="Logo" className="text-white" />
                    </div>

                    {/* Title */}
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm md:text-base lg:text-lg font-bold text-blue-900">
                            U.E.P. Francisco de Paula <span className="text-(--greenColor)">Salazar Acosta</span>
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                {isPublicPage && <div className="hidden md:block w-full"><NavBar /></div>}

                {isPublicPage && (
                    <div className="flex items-center">
                        {/* Login Button */}
                        <Link
                            to="/login"
                            className="flex items-center gap-3 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-xs md:text-sm font-semibold"
                        >
                            <LogIn size={18} />
                            Iniciar Sesión
                        </Link>
                    </div>
                )}

            </div>

            {isPublicPage && <div className="md:hidden bg-(--greenColor)"><NavBar /></div>}

        </header>
    );
}