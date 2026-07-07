import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router";
import { LogIn, ArrowLeft, LogOut, Home, ChevronDown } from "lucide-react";
import NavBar from "../../components/navbars/NavBar";
import LogoComponent from "@/components/logo/LogoComponent";
import { useAuthStore } from "@/stores/auth.store";
import { queryClient } from "@/lib/query-client";
import { useUserData } from "@/helpers/token";

export default function Header() {
    const location = useLocation();

    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isAdminPage = location.pathname.includes("/admin");
    const isLoginPage = location.pathname.includes("/login");
    const isPublicPage = !isAdminPage && !isLoginPage;

    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const logout = useAuthStore((s) => s.logout);
    const userDB = useUserData();
    const [showUserMenu, setShowUserMenu] = useState(false);

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
                    <LogoComponent className="h-11 w-11" />

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
                        {isAuthenticated && userDB ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
                                >
                                    <div className="w-8 h-8 bg-linear-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {userDB.person.firstNames?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <ChevronDown size={16} className="text-gray-400" />
                                </button>

                                {showUserMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowUserMenu(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                            <div className="py-2">
                                                <Link
                                                    to={location.pathname === "/" ? "/admin" : "/"}
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition text-gray-700"
                                                >
                                                    <Home size={16} />
                                                    <span>{location.pathname === "/" ? "Panel Administrativo" : "Home"}</span>
                                                </Link>
                                            </div>
                                            <div className="border-t border-gray-100 py-2">
                                                <button
                                                    onClick={() => { queryClient.clear(); localStorage.removeItem("token"); logout(); setShowUserMenu(false); }}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition text-red-600 w-full"
                                                >
                                                    <LogOut size={16} />
                                                    <span>Cerrar Sesión</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-3 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-xs md:text-sm font-semibold md:w-38"
                            >
                                <LogIn size={18} />
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                )}

                {isLoginPage && (
                    <Link
                        to="/"
                        className="flex items-center gap-1.5 text-gray-500 hover:text-blue-900 transition-colors text-sm"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </Link>
                )}

            </div>

            {isPublicPage && <div className="md:hidden bg-(--greenColor)"><NavBar /></div>}

        </header>
    );
}