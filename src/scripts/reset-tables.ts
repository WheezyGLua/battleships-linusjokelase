import { config } from 'dotenv';
config();
import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Resetting bombing tables...');
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);
  await db.execute(sql`DROP TABLE IF EXISTS bombs;`);
  await db.execute(sql`DROP TABLE IF EXISTS bombing_phases;`);
  await db.execute(sql`DROP TABLE IF EXISTS phase_team_configs;`);
  await db.execute(sql`DROP TABLE IF EXISTS webhooks;`);
  await db.execute(sql`DROP TABLE IF EXISTS admin_chat_messages;`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);
  console.log('Done.');
  process.exit(0);
}

main();
