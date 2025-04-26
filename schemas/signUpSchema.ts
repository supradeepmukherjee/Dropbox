import { z } from "zod";

export const signUpSchema = z
    .object({
        email: z
            .string()
            .min(1, { message: 'Email required' })
            .email({ message: 'Please enter a valid email' }),
        password: z
            .string()
            .min(1, { message: 'Password required' })
            .min(8, { message: 'Password should be of minimum 8 characters' }),
        passwordConfirmation: z
            .string()
            .min(1, { message: 'Please confirm your password' })
    })
    .refine(d => d.password === d.passwordConfirmation, {
        message: 'Passwords don\'t match',
        path: ['passwordConfirmation']
    })