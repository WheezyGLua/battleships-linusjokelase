import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise"

export const auth = betterAuth({
    database: createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT),
        password: process.env.DB_PASSWORD
    }),
    emailAndPassword: {
        enabled: true
    }
})