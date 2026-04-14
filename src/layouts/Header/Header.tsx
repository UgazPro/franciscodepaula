import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, LogIn, School } from "lucide-react";
import NavBar from "../../components/navbars/NavBar";

export default function Header() {
    const location = useLocation();

    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isAdminPage = location.pathname.includes("/admin");
    const isLoginPage = location.pathname.includes("/login");
    const isPublicPage = !isAdminPage && !isLoginPage;

    // 📜 Control de visibilidad del header al hacer scroll
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

    // 🔄 Scroll al inicio y cierre del menú móvil al cambiar de ruta
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
            {/* Barra superior decorativa */}
            <div className="h-1 bg-gradient-to-r from-blue-900 via-green-500 to-blue-900"></div>

            <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-7">
                {/* Logo y título */}
                <Link
                    to={isAdminPage ? "/admin" : "/"}
                    className="flex items-center space-x-2 md:space-x-3 group"
                >
                    {/* Logo */}
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-900 to-green-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                        <School className="text-white" size={24} />
                    </div>

                    {/* Título */}
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm md:text-base lg:text-lg font-bold text-blue-900">
                            UEP Francisco de Paula
                        </span>
                        <span className="text-xs md:text-sm text-green-600 font-medium">
                            Salazar Acosta
                        </span>
                    </div>
                </Link>

                {/* Navegación Desktop */}
                {isPublicPage && <NavBar />}

                {/* Acciones del lado derecho */}
                <div className="flex items-center space-x-3">
                    {/* Botón de inicio de sesión */}
                    <Link
                        to="/login"
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm font-semibold"
                    >
                        <LogIn size={16} />
                        Iniciar Sesión
                    </Link>

                    {/* Botón de menú móvil */}
                    {isPublicPage && (
                        <button
                            onClick={() =>
                                setMobileMenuOpen(!mobileMenuOpen)
                            }
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition text-blue-900"
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Navegación móvil
            {isPublicPage && mobileMenuOpen && (
                <div className="md:hidden bg-background border-t border-gray-100 shadow-lg">
                    <div className="px-4 py-3">
                        <NavBar mobile />
                    </div>
                </div>
            )} */}
        </header>
    );
}