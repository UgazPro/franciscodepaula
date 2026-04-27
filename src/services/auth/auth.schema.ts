import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().refine(text => text !== '',{message: 'El correo es obligatorio'}),
    password: z.string().refine(text => text !== '',{message: 'La contraseña es obligatoria'})
});


