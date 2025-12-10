CREATE TABLE `ghost_species` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`rarity` text NOT NULL,
	`base_hp` integer NOT NULL,
	`base_attack` integer NOT NULL,
	`base_defense` integer NOT NULL,
	`base_speed` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text,
	`effect_value` integer NOT NULL,
	`price` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learnable_moves` (
	`species_id` text NOT NULL,
	`move_id` text NOT NULL,
	`level` integer NOT NULL,
	PRIMARY KEY(`species_id`, `move_id`),
	FOREIGN KEY (`species_id`) REFERENCES `ghost_species`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `moves` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`power` integer NOT NULL,
	`accuracy` integer NOT NULL,
	`pp` integer NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `player_ghost_moves` (
	`player_ghost_id` text NOT NULL,
	`move_id` text NOT NULL,
	`slot` integer NOT NULL,
	`current_pp` integer NOT NULL,
	`max_pp` integer NOT NULL,
	PRIMARY KEY(`player_ghost_id`, `slot`),
	FOREIGN KEY (`player_ghost_id`) REFERENCES `player_ghosts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`move_id`) REFERENCES `moves`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player_ghosts` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`species_id` text NOT NULL,
	`nickname` text,
	`level` integer DEFAULT 1 NOT NULL,
	`experience` integer DEFAULT 0 NOT NULL,
	`current_hp` integer NOT NULL,
	`max_hp` integer NOT NULL,
	`stat_hp` integer NOT NULL,
	`stat_attack` integer NOT NULL,
	`stat_defense` integer NOT NULL,
	`stat_speed` integer NOT NULL,
	`party_order` integer,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`species_id`) REFERENCES `ghost_species`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `player_items` (
	`player_id` text NOT NULL,
	`item_id` text NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`player_id`, `item_id`),
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`clerk_user_id` text NOT NULL,
	`name` text NOT NULL,
	`map_id` text DEFAULT 'map-001' NOT NULL,
	`x` integer DEFAULT 5 NOT NULL,
	`y` integer DEFAULT 5 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_clerk_user_id_unique` ON `players` (`clerk_user_id`);