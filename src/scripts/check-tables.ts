
import { createPool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function check() {
  const pool = createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_NAME || 'battleships',
    port: Number(process.env.DB_PORT) || 3306,
    password: process.env.DB_PASSWORD || ''
  });

  const [rows] = await pool.query("SHOW TABLES");
  console.log("Tables:", rows);
  await pool.end();
}

check();
