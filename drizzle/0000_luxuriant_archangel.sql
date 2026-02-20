CREATE TABLE `admin_chat_messages` (
	`id` varchar(36) NOT NULL,
	`segment_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`webhook_id` varchar(36),
	`content` text NOT NULL,
	`sent_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bombing_phases` (
	`id` varchar(36) NOT NULL,
	`segment_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`placement_start_time` datetime NOT NULL,
	`placement_end_time` datetime NOT NULL,
	`release_time` datetime,
	`is_bombs_released` boolean NOT NULL DEFAULT false,
	`webhook_id` varchar(36),
	`webhook_message` text,
	`webhook_time` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bombing_phases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bombs` (
	`id` varchar(36) NOT NULL,
	`segment_id` varchar(36) NOT NULL,
	`phase_id` varchar(36),
	`source_team_id` varchar(36),
	`target_team_id` varchar(36) NOT NULL,
	`x` int NOT NULL,
	`y` int NOT NULL,
	`status` enum('hit','miss','pending') NOT NULL DEFAULT 'pending',
	`placed_at` timestamp NOT NULL DEFAULT (now()),
	`placed_by_user_id` varchar(36),
	CONSTRAINT `bombs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phase_team_configs` (
	`id` varchar(36) NOT NULL,
	`phase_id` varchar(36) NOT NULL,
	`team_id` varchar(36) NOT NULL,
	`bomb_limit` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `phase_team_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `segment_members` (
	`id` varchar(36) NOT NULL,
	`segment_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` enum('manager','member') NOT NULL DEFAULT 'member',
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `segment_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `segments` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ship_placement_open` boolean NOT NULL DEFAULT false,
	`bombing_open` boolean NOT NULL DEFAULT false,
	`is_public` boolean NOT NULL DEFAULT false,
	`bomb_release_time` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `segments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ships` (
	`id` varchar(36) NOT NULL,
	`team_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`size` int NOT NULL,
	`start_x` int NOT NULL,
	`start_y` int NOT NULL,
	`orientation` enum('horizontal','vertical') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_immunity` (
	`id` varchar(36) NOT NULL,
	`team_id` varchar(36) NOT NULL,
	`start_time` datetime NOT NULL,
	`end_time` datetime NOT NULL,
	`message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_immunity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` varchar(36) NOT NULL,
	`team_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` enum('captain','member','bomber') NOT NULL DEFAULT 'member',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` varchar(36) NOT NULL,
	`segment_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`color` varchar(50) DEFAULT 'blue',
	`bombs_available` int NOT NULL DEFAULT 0,
	`type` enum('player','admin') NOT NULL DEFAULT 'player',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` varchar(36) NOT NULL,
	`segment_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin_chat_messages` ADD CONSTRAINT `admin_chat_messages_segment_id_segments_id_fk` FOREIGN KEY (`segment_id`) REFERENCES `segments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_chat_messages` ADD CONSTRAINT `admin_chat_messages_webhook_id_webhooks_id_fk` FOREIGN KEY (`webhook_id`) REFERENCES `webhooks`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bombing_phases` ADD CONSTRAINT `bombing_phases_segment_id_segments_id_fk` FOREIGN KEY (`segment_id`) REFERENCES `segments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bombing_phases` ADD CONSTRAINT `bombing_phases_webhook_id_webhooks_id_fk` FOREIGN KEY (`webhook_id`) REFERENCES `webhooks`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bombs` ADD CONSTRAINT `bombs_segment_id_segments_id_fk` FOREIGN KEY (`segment_id`) REFERENCES `segments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bombs` ADD CONSTRAINT `bombs_phase_id_bombing_phases_id_fk` FOREIGN KEY (`phase_id`) REFERENCES `bombing_phases`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bombs` ADD CONSTRAINT `bombs_source_team_id_teams_id_fk` FOREIGN KEY (`source_team_id`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bombs` ADD CONSTRAINT `bombs_target_team_id_teams_id_fk` FOREIGN KEY (`target_team_id`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `phase_team_configs` ADD CONSTRAINT `phase_team_configs_phase_id_bombing_phases_id_fk` FOREIGN KEY (`phase_id`) REFERENCES `bombing_phases`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `phase_team_configs` ADD CONSTRAINT `phase_team_configs_team_id_teams_id_fk` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `segment_members` ADD CONSTRAINT `segment_members_segment_id_segments_id_fk` FOREIGN KEY (`segment_id`) REFERENCES `segments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ships` ADD CONSTRAINT `ships_team_id_teams_id_fk` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_immunity` ADD CONSTRAINT `team_immunity_team_id_teams_id_fk` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_team_id_teams_id_fk` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_segment_id_segments_id_fk` FOREIGN KEY (`segment_id`) REFERENCES `segments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhooks` ADD CONSTRAINT `webhooks_segment_id_segments_id_fk` FOREIGN KEY (`segment_id`) REFERENCES `segments`(`id`) ON DELETE cascade ON UPDATE no action;