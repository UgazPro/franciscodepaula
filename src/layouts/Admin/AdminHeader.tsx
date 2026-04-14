import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
    Bell,
    Search,
    User,
    ChevronDown,
    Moon,
    Sun,
    Settings,
    LogOut,
    HelpCircle,
    Menu
} from "lucide-react";

export default function AdminHeader() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());

    const location = useLocation();

    const user = {
        name: "Ana Gómez",
        email: "hola@hola.com",
        role: "Directora",
    };

    // Notificaciones de ejemplo
    const notifications = [
        { id: 1, title: "Nuevo estudiante inscrito", time: "Hace 5 min", read: false, type: "success" },
        { id: 2, title: "Reunión de profesores hoy", time: "Hace 30 min", read: false, type: "warning" },
        { id: 3, title: "Actualización de sistema", time: "Hace 2 horas", read: true, type: "info" },
        { id: 4, title: "Pago pendiente de mensualidad", time: "Hace 1 día", read: true, type: "error" },
    ];

    // Reloj en tiempo real
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const getPageTitle = () => {
        const path = location.pathname;
        const titles: Record<string, string> = {
            '/admin': 'Dashboard',
            '/admin/control-estudio': 'Control de Estudio',
            '/admin/profesores': 'Gestión de Profesores',
            '/admin/administracion': 'Administración',
            '/admin/secretaria': 'Secretaría',
            '/admin/coordinacion': 'Coordinación',
            '/admin/estudiantes': 'Estudiantes',
            '/admin/calendario': 'Calendario Escolar',
            '/admin/perfil': 'Mi Perfil',
            '/admin/configuracion': 'Configuración'
        };
        return titles[path] || 'Panel Administrativo';
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 md:px-6 py-3">
                <div className="flex items-center justify-between gap-4">

                    {/* Left section - Título y búsqueda */}
                    <div className="flex items-center gap-4 flex-1">
                        {/* Mobile menu button (opcional, si quieres sidebar móvil) */}
                        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition">
                            <Menu size={20} className="text-gray-600" />
                        </button>

                        {/* Título de página */}
                        <div className="hidden sm:block">
                            <h1 className="text-xl md:text-2xl font-bold text-blue-900">
                                {getPageTitle()}
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formatDate(currentTime)}
                            </p>
                        </div>
                    </div>

                    {/* Center - Barra de búsqueda (solo desktop) */}
                    <div className="hidden md:flex items-center flex-1 max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar estudiantes, profesores, documentos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                            />
                        </div>
                    </div>

                    {/* Right section - Acciones */}
                    <div className="flex items-center gap-2 md:gap-3">

                        {/* Modo oscuro */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notificaciones */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition relative"
                            >
                                <Bell size={20} className="text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {/* Dropdown notificaciones */}
                            {showNotifications && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowNotifications(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-semibold text-gray-800">Notificaciones</h3>
                                            <button className="text-xs text-green-600 hover:text-green-700">
                                                Marcar todas como leídas
                                            </button>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.map((notif) => (
                                                <div key={notif.id} className={`p-3 hover:bg-gray-50 transition border-b border-gray-50 ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                                                    <p className="text-sm font-medium text-gray-800">{notif.title}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 border-t border-gray-100 text-center">
                                            <button className="text-sm text-green-600 hover:text-green-700">
                                                Ver todas las notificaciones
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Perfil de usuario */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {user?.name || 'Administrador'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {user?.role || 'Director'}
                                    </p>
                                </div>
                                <ChevronDown size={16} className="hidden lg:block text-gray-400" />
                            </button>

                            {/* Dropdown usuario */}
                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-100">
                                            <p className="font-semibold text-gray-800">{user?.name || 'Administrador'}</p>
                                            <p className="text-xs text-gray-500 mt-1">{user?.email || 'admin@colegio.edu.ve'}</p>
                                        </div>
                                        <div className="py-2">
                                            <Link
                                                to="/admin/perfil"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition text-gray-700"
                                            >
                                                <User size={16} />
                                                <span>Mi Perfil</span>
                                            </Link>
                                            <Link
                                                to="/admin/configuracion"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition text-gray-700"
                                            >
                                                <Settings size={16} />
                                                <span>Configuración</span>
                                            </Link>
                                            <Link
                                                to="/ayuda"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition text-gray-700"
                                            >
                                                <HelpCircle size={16} />
                                                <span>Ayuda</span>
                                            </Link>
                                        </div>
                                        <div className="border-t border-gray-100 py-2">
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                }}
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
                    </div>
                </div>

                {/* Barra de búsqueda móvil */}
                <div className="md:hidden mt-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}