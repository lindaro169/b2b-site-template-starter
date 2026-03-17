CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_url` text,
	`path` text,
	`level` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT '2025-11-21T20:06:14.478Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`phone` text,
	`status` text DEFAULT 'unread',
	`created_at` text DEFAULT '2025-11-21T20:06:14.480Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` text,
	`order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT '2025-11-21T20:06:14.480Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `global_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`description` text,
	`updated_at` text DEFAULT '2025-11-21T20:06:14.480Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `global_config_key_unique` ON `global_config` (`key`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`company` text,
	`message` text NOT NULL,
	`product_id` integer,
	`status` text DEFAULT 'new',
	`created_at` text DEFAULT '2025-11-21T20:06:14.480Z' NOT NULL,
	`replied_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`excerpt` text,
	`featured_image` text,
	`published` integer DEFAULT false,
	`published_at` text,
	`created_at` text DEFAULT '2025-11-21T20:06:14.480Z' NOT NULL,
	`updated_at` text DEFAULT '2025-11-21T20:06:14.480Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`price` real,
	`category_id` integer,
	`image_url` text,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT '2025-11-21T20:06:14.479Z' NOT NULL,
	`updated_at` text DEFAULT '2025-11-21T20:06:14.479Z' NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`featured_image` text,
	`order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT '2025-11-21T20:06:14.480Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_name` text NOT NULL,
	`author_company` text,
	`author_image` text,
	`content` text NOT NULL,
	`rating` integer,
	`order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT '2025-11-21T20:06:14.480Z' NOT NULL
);
