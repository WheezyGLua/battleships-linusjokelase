import { betterAuth } from "better-auth";
import { createPool } from "mysql2/promise"

export const auth = betterAuth({
    database: createPool({
        host: 'localhost',
        user: 'root',
        database: 'battleships',
        port: 3306,
        password: ''
    }),
    emailAndPassword: {
        enabled: true
    }
})