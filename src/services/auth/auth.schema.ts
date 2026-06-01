import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().min(1, "El correo es obligatorio").email("Correo electrónico inválido"),
    password: z.string().min(1, "La contraseña es obligatoria").min(5, "La contraseña debe tener al menos 5 caracteres"),
});

export type LoginFormValues = z.input<typeof LoginSchema>;


