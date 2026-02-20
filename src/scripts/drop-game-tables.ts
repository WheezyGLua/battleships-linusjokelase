
import { createPool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function reset() {
  const pool = createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_DATABASE || 'battleships',
    port: Number(process.env.DB_PORT) || 3306,
    password: process.env.DB_PASSWORD || ''
  });

  const [rows] = await pool.query("SHOW TABLES");
  const tables = (rows as any[]).map(row => Object.values(row)[0]);

  // Disable FK checks
  await pool.query("SET FOREIGN_KEY_CHECKS = 0");

  for (const table of tables) {
    // Skip verification, user, account, session if they are auth tables?
    // BetterAuth uses: user, session, account, verification.
    // If I drop them, I lose users.
    // The user didn't complain about "deleted users", only "game logic".
    // I should try to preserve auth tables.
    if (["user", "session", "account", "verification"].includes(table as string)) {
        continue;
    }
    
    try {
      await pool.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped ${table}`);
    } catch (e) {
      console.error(`Error dropping ${table}:`, e);
    }
  }
  
  await pool.query("SET FOREIGN_KEY_CHECKS = 1");

  await pool.end();
}

reset();
