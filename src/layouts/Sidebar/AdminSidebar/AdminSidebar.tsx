import { useState } from "react";
import { Link, useLocation } from "react-router";
import { sidebarData } from "./AdminSidebar.data";
import { LogOut, Menu, X } from "lucide-react";

export default function AdminSidebar() {
  const [showSpinner, setShowSpinner] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();

  return (
    <>

      {/* Desktop Sidebar - Colapsable */}
      <div
        className="hidden group md:flex w-16 hover:w-64 transition-all duration-300 ease-in-out bg-gradient-to-b from-blue-900 to-blue-800 text-white flex-col justify-between fixed top-0 left-0 h-full z-50 shadow-2xl"
      >
        <div className="w-full px-3 pt-4">
          {/* Logo/Header */}
          <div className="flex items-center mb-8 rounded-lg group-hover:bg-blue-800/50 mt-3 transition-colors duration-300">
            <div className="h-10 w-10 flex items-center justify-center shrink-0">
              <img src="logoF.png" alt="Logo" className="text-white" />
            </div>
            <div className="ml-3 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
              <span className="text-sm font-bold">Francisco de Paula</span>
              <span className="text-xs block text-green-300">Salazar Acosta</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {sidebarData.map((item, index) => {
              const isActive = item.redirectTo === location.pathname;

              return (
                <Link
                  key={index}
                  to={item.redirectTo}
                  className={`flex items-center rounded-lg transition-all duration-300 hover:bg-blue-700 relative group/item ${isActive ? 'bg-blue-700 shadow-md' : ''
                    }`}
                >
                  <div className={`p-2.5 rounded-lg transition-all ${isActive ? 'bg-green-500' : ''}`}>
                    <item.icon className="h-5 w-5 shrink-0" />
                  </div>
                  <span className="ml-3 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 font-medium">
                    {item.name}
                  </span>

                  {/* Tooltip para cuando está colapsado */}
                  <div className="absolute left-full ml-4 px-3 py-2 bg-blue-900 text-white text-sm rounded-lg opacity-0 group-hover/item:opacity-0 group-hover:opacity-0 pointer-events-none transition-opacity duration-300 z-50 whitespace-nowrap shadow-xl border border-blue-700">
                    {item.name}
                    <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 border-4 border-transparent border-r-blue-900"></div>
                  </div>

                  {isActive && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 h-2 w-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="w-full px-3 pb-6">
          <button
            className="flex items-center p-3 rounded-lg hover:bg-red-600/20 transition-all duration-300 group/item w-full border-t border-blue-700 pt-4"
            onClick={() => console.log("Saliendo...")}
            disabled={isLoggingOut}
          >
            <LogOut className="h-5 w-5 shrink-0 text-red-300" />
            <span className="ml-3 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 hover:cursor-pointer text-red-200">
              Cerrar Sesión
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UEP</span>
            </div>
            <span className="text-sm font-semibold">Francisco de Paula</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-blue-700 transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-blue-900 shadow-xl py-4 px-3 space-y-2 border-t border-blue-700">
            {sidebarData.map((item, index) => (
              <Link
                key={index}
                to={item.redirectTo}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${location.pathname === item.redirectTo
                  ? 'bg-green-500 text-white'
                  : 'hover:bg-blue-800'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
            <button
              onClick={() => console.log("Saliendo...")}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-600/20 w-full text-red-200 border-t border-blue-700 pt-4 mt-2"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>

      <div className="md:hidden h-16"></div>
    </>
  );
}