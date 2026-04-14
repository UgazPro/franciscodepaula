/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router";

export default function Login() {

    return (
        <div className="min-h-screen">

            {/* Barra decorativa superior con gradiente azul-verde */}
            <div className="h-2 bg-gradient-to-r from-blue-900 via-green-500 to-blue-900"></div>

            {/* Fondo con overlay suave */}
            <div className="bg-gradient-to-br from-blue-900/95 to-blue-800/95 min-h-screen w-full flex items-center py-12">
                <div className="flex flex-col justify-center w-full max-w-md mx-auto px-4 sm:px-6">
                    <form>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">
                            
                            {/* Logo o icono institucional */}
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-3xl">UEP</span>
                                </div>
                            </div>

                            {/* Título */}
                            <div className="text-center space-y-2">
                                <h1 className="font-bold text-2xl text-white">Bienvenido</h1>
                                <p className="text-blue-100 text-sm">
                                    UEP Francisco de Paula Salazar Acosta
                                </p>
                                <div className="w-16 h-0.5 bg-green-500 mx-auto mt-2"></div>
                            </div>

                            {/* Nombre de Usuario */}
                            <div className="space-y-2">
                                <label className="text-white font-medium text-sm block">
                                    Nombre de Usuario
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                    placeholder="usuario@colegio.edu.ve"
                                />
                            </div>

                            {/* Contraseña */}
                            <div className="space-y-2">
                                <label className="text-white font-medium text-sm block">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Botón de inicio de sesión */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Iniciar Sesión
                            </button>

                            {/* Separador */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/20"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-transparent px-2 text-white/60">O continúa con</span>
                                </div>
                            </div>

                            {/* Google Login */}
                            <div className="flex justify-center">

                            </div>

                            {/* Enlaces adicionales */}
                            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 pt-2">
                                <Link
                                    to="#"
                                    className="text-green-400 hover:text-green-300 text-sm transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>

                                <Link
                                    to="/registro"
                                    className="text-white/80 hover:text-white text-sm transition-colors"
                                >
                                    ¿No tienes cuenta? <span className="text-green-400 font-medium">Regístrate</span>
                                </Link>
                            </div>
                        </div>
                    </form>

                    {/* Texto institucional */}
                    <p className="text-center text-white/60 text-xs mt-6">
                        © {new Date().getFullYear()} UEP Francisco de Paula Salazar Acosta<br />
                        Formando líderes con excelencia y valores
                    </p>
                </div>
            </div>
        </div>
    );
}