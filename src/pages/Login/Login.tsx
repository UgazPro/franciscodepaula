import { Link } from "react-router";

export default function Login() {

    return (
        <div className="min-h-screen">

            <div className="h-2 bg-linear-to-r from-blue-900 via-green-500 to-blue-900"></div>

            <div className="bg-linear-to-br from-blue-900/95 to-blue-800/95 min-h-screen w-full flex items-center py-12">
                <div className="flex flex-col justify-center w-full max-w-md mx-auto px-4 sm:px-6">
                    <form>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 border border-white/20">

                            <div className="flex justify-center mb-4">
                                <div className="h-20 w-20 flex items-center justify-center shrink-0">
                                    <img src="logoF.png" alt="Logo" className="text-white" />
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <h1 className="font-bold text-2xl text-white">Bienvenido</h1>
                                <p className="text-blue-100 text-sm">
                                    U.E.P. Francisco de Paula Salazar Acosta
                                </p>
                                <div className="w-16 h-0.5 bg-green-500 mx-auto mt-2"></div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-white font-medium text-sm block">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                    placeholder="usuario@colegio.edu.ve"
                                />
                            </div>

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

                            <button
                                type="submit"
                                className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Iniciar Sesión
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/20"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-transparent px-2 text-white/60">O continúa con</span>
                                </div>
                            </div>

                            <div className="flex justify-center">

                            </div>

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

                    <p className="text-center text-white/60 text-xs mt-6">
                        © {new Date().getFullYear()} U.E.P. Francisco de Paula Salazar Acosta<br />
                        Formando líderes con excelencia y valores
                    </p>
                </div>
            </div>
        </div>
    );
}