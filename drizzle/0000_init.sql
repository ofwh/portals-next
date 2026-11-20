CREATE TABLE `preferences` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`username` text,
	`display_username` text,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `caches` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`pathname` text NOT NULL,
	`url` text NOT NULL,
	`ttl` integer DEFAULT 0 NOT NULL,
	`status` integer DEFAULT true NOT NULL,
	`method` text DEFAULT 'GET' NOT NULL,
	`body` text,
	`format` text DEFAULT 'JSON' NOT NULL,
	`headers` text,
	`proxy` text,
	`cors` integer DEFAULT 0 NOT NULL,
	`token` text,
	`expired_at` integer,
	`cached_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT "caches_method_check" CHECK("caches"."method" in ('GET', 'POST')),
	CONSTRAINT "caches_format_check" CHECK("caches"."format" in ('JSON', 'TEXT', 'FORM')),
	CONSTRAINT "caches_cors_check" CHECK("caches"."cors" in (-1, 0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `caches_pathname_unique` ON `caches` (`pathname`);--> statement-breakpoint
CREATE TABLE `originals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` integer DEFAULT true NOT NULL,
	`pathname` text NOT NULL,
	`content` text NOT NULL,
	`content_type` text DEFAULT 'application/json' NOT NULL,
	`language` text DEFAULT 'plaintext' NOT NULL,
	`token` text,
	`expired_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `originals_pathname_unique` ON `originals` (`pathname`);--> statement-breakpoint
CREATE TABLE `proxies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` integer DEFAULT true NOT NULL,
	`pathname` text NOT NULL,
	`url` text NOT NULL,
	`method` text DEFAULT 'GET' NOT NULL,
	`body` text,
	`format` text DEFAULT 'JSON' NOT NULL,
	`headers` text,
	`proxy` text,
	`cors` integer DEFAULT 0 NOT NULL,
	`token` text,
	`expired_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT "proxies_method_check" CHECK("proxies"."method" in ('GET', 'POST')),
	CONSTRAINT "proxies_format_check" CHECK("proxies"."format" in ('JSON', 'TEXT', 'FORM')),
	CONSTRAINT "proxies_cors_check" CHECK("proxies"."cors" in (-1, 0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `proxies_pathname_unique` ON `proxies` (`pathname`);--> statement-breakpoint
CREATE TABLE `redirects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` integer DEFAULT true NOT NULL,
	`pathname` text NOT NULL,
	`url` text NOT NULL,
	`status_code` integer DEFAULT 302 NOT NULL,
	`token` text,
	`expired_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT "redirects_status_code_check" CHECK("redirects"."status_code" in (301, 302, 307, 308))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `redirects_pathname_unique` ON `redirects` (`pathname`);--> statement-breakpoint
CREATE TABLE `shortcuts` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`pathname` text NOT NULL,
	`status` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT "shortcuts_type_check" CHECK("shortcuts"."type" in ('proxy', 'redirect', 'cache', 'original', 'subscription'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shortcuts_type_unique` ON `shortcuts` (`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `shortcuts_pathname_unique` ON `shortcuts` (`pathname`);--> statement-breakpoint
CREATE TABLE `tag_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`tag_id` text NOT NULL,
	`target_id` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tag_configs_tag_type_target_unique` ON `tag_configs` (`tag_id`,`type`,`target_id`);--> statement-breakpoint
CREATE INDEX `tag_configs_type_target_idx` ON `tag_configs` (`type`,`target_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`group` text NOT NULL,
	`label` text NOT NULL,
	`color` text DEFAULT '' NOT NULL,
	`bg_color` text DEFAULT '' NOT NULL,
	`border` integer DEFAULT 1 NOT NULL,
	`rounded` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tags_group_idx` ON `tags` (`group`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` integer DEFAULT true NOT NULL,
	`pathname` text NOT NULL,
	`flow` text,
	`flow_draft` text,
	`token` text,
	`expired_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscriptions_pathname_unique` ON `subscriptions` (`pathname`);--> statement-breakpoint
CREATE TABLE `analytics` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`route_type` text NOT NULL,
	`url` text NOT NULL,
	`pathname` text NOT NULL,
	`ua` text,
	`os` text,
	`device` text,
	`browser` text,
	`ip` text,
	`duration` integer NOT NULL,
	`status_code` integer,
	`error_code` integer,
	`visit_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	CONSTRAINT "analytics_route_type_check" CHECK("analytics"."route_type" in ('proxies', 'redirects', 'caches', 'originals', 'subscriptions')),
	CONSTRAINT "analytics_duration_check" CHECK(typeof("analytics"."duration") = 'integer' and "analytics"."duration" >= 0),
	CONSTRAINT "analytics_status_code_check" CHECK("analytics"."status_code" is null or (typeof("analytics"."status_code") = 'integer' and "analytics"."status_code" between 200 and 599)),
	CONSTRAINT "analytics_error_code_check" CHECK("analytics"."error_code" is null or (typeof("analytics"."error_code") = 'integer' and "analytics"."error_code" > 0))
);
--> statement-breakpoint
CREATE INDEX `analytics_visit_at_idx` ON `analytics` (`visit_at`);--> statement-breakpoint
CREATE INDEX `analytics_route_type_visit_at_idx` ON `analytics` (`route_type`,`visit_at`);