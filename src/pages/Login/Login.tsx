import { useLoginMutation } from "@/queries/useAuthMutations";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AuthLoginData } from "@/services/auth/auth.interface";
import { LoginSchema } from "@/services/auth/auth.schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import ErrorMessage from "@/components/form/renderFormComponents/ErrorMessage";

export default function Login() {

    const [loginErrorMessage, setLoginErrorMessage] = useState("");

    const loginMutation = useLoginMutation();

    const { register, handleSubmit, formState: { errors } } = useForm<AuthLoginData>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit = async (data: AuthLoginData) => {
        try {
            console.log(data)
            await loginMutation.mutateAsync(data);
        } catch (error: any) {
            setLoginErrorMessage(error.message || "Error al iniciar sesión");
            setTimeout(() => setLoginErrorMessage(""), 2500);
        }
    };

    return (

        <div className="min-h-screen">

            <div className="h-2 bg-linear-to-r from-blue-900 via-green-500 to-blue-900"></div>

            <div className="bg-linear-to-br from-blue-900/95 to-blue-800/95 min-h-screen w-full flex items-center py-12">
                <div className="flex flex-col justify-center w-full max-w-md mx-auto px-4 sm:px-6">
                    <form onSubmit={handleSubmit(onSubmit)}>
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
                                    type="email"
                                    className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                    placeholder="usuario@colegio.edu.ve"
                                    {...register("email")}
                                />
                                {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-white font-medium text-sm block">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                                    placeholder="••••••••"
                                    {...register("password")}
                                />
                                {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Iniciar Sesión
                            </button>

                            <div className="flex justify-center items-center gap-4 pt-2">
                                <Link
                                    to="#"
                                    className="text-green-400 hover:text-green-300 text-sm transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
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