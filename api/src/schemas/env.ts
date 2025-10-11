import { z } from "zod";
import { en } from "zod/v4/locales";

export const envSchema = z.object({
    JWT_SECRECT: z.string().min(1),
    ENV: z.enum(['dev', 'prod', 'test']),
    ROUNDS_SALT: z.string().min(1).transform(n => parseInt(n, 10)),
    DB_HOST: z.string().min(1),
    DB_PORT: z.string().min(1).transform(n => parseInt(n, 10)),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
})

const { success, data, error } = envSchema.safeParse(process.env)

if (!success) {
   console.log(error.message)
   process.exit(1)
}

export const {
    ENV,
    DB_HOST, 
    DB_NAME, 
    DB_PASSWORD, 
    DB_PORT, 
    DB_USER, 
    JWT_SECRECT, 
    ROUNDS_SALT
} = data

    