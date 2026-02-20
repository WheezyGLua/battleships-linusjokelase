import { 
  mysqlTable, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  int,
  mysqlEnum,
  datetime
} from "drizzle-orm/mysql-core";

// Note: Foreign keys to 'user' table are logical only (varchar) to avoid Drizzle managing the user table.
// We handle referential integrity via application logic or manual FK constraints if needed.

export const segments = mysqlTable("segments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Settings
  shipPlacementOpen: boolean("ship_placement_open").default(false).notNull(),
  bombingOpen: boolean("bombing_open").default(false).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  
  bombReleaseTime: datetime("bomb_release_time"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const segmentMembers = mysqlTable("segment_members", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  segmentId: varchar("segment_id", { length: 36 }).notNull().references(() => segments.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull(), // References user.id logically
  role: mysqlEnum("role", ["manager", "member"]).default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const teams = mysqlTable("teams", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  segmentId: varchar("segment_id", { length: 36 }).notNull().references(() => segments.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 50 }).default("blue"),
  
  bombsAvailable: int("bombs_available").default(0).notNull(),
  type: mysqlEnum("type", ["player", "admin"]).default("player").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const teamMembers = mysqlTable("team_members", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: varchar("team_id", { length: 36 }).notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull(), // References user.id logically
  role: mysqlEnum("role", ["captain", "member", "bomber"]).default("member").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ships = mysqlTable("ships", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: varchar("team_id", { length: 36 }).notNull().references(() => teams.id, { onDelete: "cascade" }),
  
  type: varchar("type", { length: 50 }).notNull(),
  size: int("size").notNull(),
  
  startX: int("start_x").notNull(),
  startY: int("start_y").notNull(),
  orientation: mysqlEnum("orientation", ["horizontal", "vertical"]).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const webhooks = mysqlTable("webhooks", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  segmentId: varchar("segment_id", { length: 36 }).notNull().references(() => segments.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const bombingPhases = mysqlTable("bombing_phases", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  segmentId: varchar("segment_id", { length: 36 }).notNull().references(() => segments.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 255 }).notNull(),
  
  placementStartTime: datetime("placement_start_time").notNull(),
  placementEndTime: datetime("placement_end_time").notNull(),
  
  releaseTime: datetime("release_time"), // When result is released
  isBombsReleased: boolean("is_bombs_released").default(false).notNull(),
  
  webhookId: varchar("webhook_id", { length: 36 }).references(() => webhooks.id, { onDelete: "set null" }),
  webhookMessage: text("webhook_message"),
  webhookTime: datetime("webhook_time"), // When to send webhook
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const phaseTeamConfigs = mysqlTable("phase_team_configs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  phaseId: varchar("phase_id", { length: 36 }).notNull().references(() => bombingPhases.id, { onDelete: "cascade" }),
  teamId: varchar("team_id", { length: 36 }).notNull().references(() => teams.id, { onDelete: "cascade" }),
  
  bombLimit: int("bomb_limit"), // Null means unlimited? Or 0? Let's treat null as "no specific limit set" or "default"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminChatMessages = mysqlTable("admin_chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  segmentId: varchar("segment_id", { length: 36 }).notNull().references(() => segments.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull(), // The admin who sent it
  
  webhookId: varchar("webhook_id", { length: 36 }).references(() => webhooks.id, { onDelete: "set null" }), // Optional, if sent via a specific webhook
  content: text("content").notNull(),
  
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const bombs = mysqlTable("bombs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  segmentId: varchar("segment_id", { length: 36 }).notNull().references(() => segments.id, { onDelete: "cascade" }),
  
  phaseId: varchar("phase_id", { length: 36 }).references(() => bombingPhases.id, { onDelete: "set null" }), 
  
  sourceTeamId: varchar("source_team_id", { length: 36 }).references(() => teams.id),
  targetTeamId: varchar("target_team_id", { length: 36 }).notNull().references(() => teams.id, { onDelete: "cascade" }),
  
  x: int("x").notNull(),
  y: int("y").notNull(),
  
  status: mysqlEnum("status", ["hit", "miss", "pending"]).default("pending").notNull(),
  
  placedAt: timestamp("placed_at").defaultNow().notNull(),
  placedByUserId: varchar("placed_by_user_id", { length: 36 }), // References user.id logically
});

export const teamImmunity = mysqlTable("team_immunity", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  teamId: varchar("team_id", { length: 36 }).notNull().references(() => teams.id, { onDelete: "cascade" }),
  
  startTime: datetime("start_time").notNull(),
  endTime: datetime("end_time").notNull(),
  message: text("message"), // Message to show when immune
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

import { relations } from "drizzle-orm";

export const bombingPhasesRelations = relations(bombingPhases, ({ one }) => ({
	webhook: one(webhooks, {
		fields: [bombingPhases.webhookId],
		references: [webhooks.id],
	}),
    segment: one(segments, {
        fields: [bombingPhases.segmentId],
        references: [segments.id],
    }),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
    segment: one(segments, {
        fields: [webhooks.segmentId],
        references: [segments.id],
    }),
    phases: many(bombingPhases),
}));

export const teamImmunityRelations = relations(teamImmunity, ({ one }) => ({
    team: one(teams, {
        fields: [teamImmunity.teamId],
        references: [teams.id],
    }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
    segment: one(segments, {
        fields: [teams.segmentId],
        references: [segments.id],
    }),
    immunity: many(teamImmunity),
}));
