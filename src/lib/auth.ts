import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise"

export const auth = betterAuth({
    database: createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        database: process.env.DB_DATABASE || 'battleships',
        port: Number(process.env.DB_PORT) || 3306,
        password: process.env.DB_PASSWORD || ''
    }),
    emailAndPassword: {
        enabled: true
    }
})