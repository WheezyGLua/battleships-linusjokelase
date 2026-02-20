
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_DATABASE || 'battleships',
  port: Number(process.env.DB_PORT) || 3306,
  password: process.env.DB_PASSWORD || ''
});

// Merge application schema with auth schema for runtime usage
export const db = drizzle(pool, { 
  schema: { ...schema, ...authSchema }, 
  mode: "default" 
});
