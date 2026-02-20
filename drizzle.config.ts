
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'battleships',
    port: Number(process.env.DB_PORT) || 3306,
    password: process.env.DB_PASSWORD || undefined
  },
  tablesFilter: ["segments", "segment_members", "teams", "team_members", "ships", "bombs", "bombing_phases", "team_immunity"],
});
