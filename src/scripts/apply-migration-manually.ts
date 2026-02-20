import { config } from 'dotenv';
config();
import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log("Starting manual migration...");
    
    try {
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);

        // Create Webhooks
        await db.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS \`webhooks\` (
                \`id\` varchar(36) NOT NULL,
                \`segment_id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`url\` text NOT NULL,
                \`created_at\` timestamp NOT NULL DEFAULT (now()),
                \`updated_at\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT \`webhooks_id\` PRIMARY KEY(\`id\`),
                CONSTRAINT \`webhooks_segment_id_segments_id_fk\` FOREIGN KEY (\`segment_id\`) REFERENCES \`segments\`(\`id\`) ON DELETE cascade
            );
        `));
        console.log("Created webhooks table");

        // Create Bombing Phases
        await db.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS \`bombing_phases\` (
                \`id\` varchar(36) NOT NULL,
                \`segment_id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`placement_start_time\` datetime NOT NULL,
                \`placement_end_time\` datetime NOT NULL,
                \`release_time\` datetime,
                \`is_bombs_released\` boolean NOT NULL DEFAULT false,
                \`webhook_id\` varchar(36),
                \`webhook_message\` text,
                \`webhook_time\` datetime,
                \`created_at\` timestamp NOT NULL DEFAULT (now()),
                \`updated_at\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT \`bombing_phases_id\` PRIMARY KEY(\`id\`),
                CONSTRAINT \`bombing_phases_segment_id_segments_id_fk\` FOREIGN KEY (\`segment_id\`) REFERENCES \`segments\`(\`id\`) ON DELETE cascade,
                CONSTRAINT \`bombing_phases_webhook_id_webhooks_id_fk\` FOREIGN KEY (\`webhook_id\`) REFERENCES \`webhooks\`(\`id\`) ON DELETE set null
            );
        `));
        console.log("Created bombing_phases table");

        // Create Phase Team Configs
        await db.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS \`phase_team_configs\` (
                \`id\` varchar(36) NOT NULL,
                \`phase_id\` varchar(36) NOT NULL,
                \`team_id\` varchar(36) NOT NULL,
                \`bomb_limit\` int,
                \`created_at\` timestamp NOT NULL DEFAULT (now()),
                CONSTRAINT \`phase_team_configs_id\` PRIMARY KEY(\`id\`),
                CONSTRAINT \`phase_team_configs_phase_id_bombing_phases_id_fk\` FOREIGN KEY (\`phase_id\`) REFERENCES \`bombing_phases\`(\`id\`) ON DELETE cascade,
                CONSTRAINT \`phase_team_configs_team_id_teams_id_fk\` FOREIGN KEY (\`team_id\`) REFERENCES \`teams\`(\`id\`) ON DELETE cascade
            );
        `));
        console.log("Created phase_team_configs table");

        // Create Admin Chat Messages
        await db.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS \`admin_chat_messages\` (
                \`id\` varchar(36) NOT NULL,
                \`segment_id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`webhook_id\` varchar(36),
                \`content\` text NOT NULL,
                \`sent_at\` timestamp NOT NULL DEFAULT (now()),
                CONSTRAINT \`admin_chat_messages_id\` PRIMARY KEY(\`id\`),
                CONSTRAINT \`admin_chat_messages_segment_id_segments_id_fk\` FOREIGN KEY (\`segment_id\`) REFERENCES \`segments\`(\`id\`) ON DELETE cascade,
                CONSTRAINT \`admin_chat_messages_webhook_id_webhooks_id_fk\` FOREIGN KEY (\`webhook_id\`) REFERENCES \`webhooks\`(\`id\`) ON DELETE set null
            );
        `));
        console.log("Created admin_chat_messages table");

        // Create Bombs
        await db.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS \`bombs\` (
                \`id\` varchar(36) NOT NULL,
                \`segment_id\` varchar(36) NOT NULL,
                \`phase_id\` varchar(36),
                \`source_team_id\` varchar(36),
                \`target_team_id\` varchar(36) NOT NULL,
                \`x\` int NOT NULL,
                \`y\` int NOT NULL,
                \`status\` enum('hit','miss','pending') NOT NULL DEFAULT 'pending',
                \`placed_at\` timestamp NOT NULL DEFAULT (now()),
                \`placed_by_user_id\` varchar(36),
                CONSTRAINT \`bombs_id\` PRIMARY KEY(\`id\`),
                CONSTRAINT \`bombs_segment_id_segments_id_fk\` FOREIGN KEY (\`segment_id\`) REFERENCES \`segments\`(\`id\`) ON DELETE cascade,
                CONSTRAINT \`bombs_phase_id_bombing_phases_id_fk\` FOREIGN KEY (\`phase_id\`) REFERENCES \`bombing_phases\`(\`id\`) ON DELETE set null,
                CONSTRAINT \`bombs_source_team_id_teams_id_fk\` FOREIGN KEY (\`source_team_id\`) REFERENCES \`teams\`(\`id\`),
                CONSTRAINT \`bombs_target_team_id_teams_id_fk\` FOREIGN KEY (\`target_team_id\`) REFERENCES \`teams\`(\`id\`) ON DELETE cascade
            );
        `));
        console.log("Created bombs table");

        // Create Team Immunity
        await db.execute(sql.raw(`
            CREATE TABLE IF NOT EXISTS \`team_immunity\` (
                \`id\` varchar(36) NOT NULL,
                \`team_id\` varchar(36) NOT NULL,
                \`start_time\` datetime NOT NULL,
                \`end_time\` datetime NOT NULL,
                \`message\` text,
                \`created_at\` timestamp NOT NULL DEFAULT (now()),
                CONSTRAINT \`team_immunity_id\` PRIMARY KEY(\`id\`),
                CONSTRAINT \`team_immunity_team_id_teams_id_fk\` FOREIGN KEY (\`team_id\`) REFERENCES \`teams\`(\`id\`) ON DELETE cascade
            );
        `));
        console.log("Created team_immunity table");

        // Alter Segments
        try {
             await db.execute(sql.raw(`ALTER TABLE \`segments\` ADD COLUMN \`bomb_release_time\` datetime;`));
             console.log("Altered segments table");
        } catch (e: any) {
             console.log("Segments table alter skipped (might already exist):", e.message);
        }

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);
        process.exit(0);
    }
}

main();
