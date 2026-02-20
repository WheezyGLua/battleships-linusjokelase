
import { mysqlTable, varchar, text, boolean, timestamp } from "drizzle-orm/mysql-core";

// Define existing user table for relation (BetterAuth managed)
// This file is used for application queries but NOT for drizzle-kit migrations
export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});
