CREATE TABLE `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`password_hash` text NOT NULL,
	`email_verified` integer DEFAULT false,
	`reset_token` text,
	`reset_token_expiry` integer,
	`created_at` text DEFAULT '2025-11-22T08:44:50.884Z' NOT NULL,
	`updated_at` text DEFAULT '2025-11-22T08:44:50.884Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`image_url` text,
	`path` text,
	`level` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT '2025-11-22T08:44:50.882Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "slug", "description", "image_url", "path", "level", "is_active", "created_at") SELECT "id", "name", "slug", "description", "image_url", "path", "level", "is_active", "created_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`phone` text,
	`status` text DEFAULT 'unread',
	`created_at` text DEFAULT '2025-11-22T08:44:50.884Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_contacts`("id", "name", "email", "subject", "message", "phone", "status", "created_at") SELECT "id", "name", "email", "subject", "message", "phone", "status", "created_at" FROM `contacts`;--> statement-breakpoint
DROP TABLE `contacts`;--> statement-breakpoint
ALTER TABLE `__new_contacts` RENAME TO `contacts`;--> statement-breakpoint
CREATE TABLE `__new_faqs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` text,
	`order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT '2025-11-22T08:44:50.884Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_faqs`("id", "question", "answer", "category", "order", "is_active", "created_at") SELECT "id", "question", "answer", "category", "order", "is_active", "created_at" FROM `faqs`;--> statement-breakpoint
DROP TABLE `faqs`;--> statement-breakpoint
ALTER TABLE `__new_faqs` RENAME TO `faqs`;--> statement-breakpoint
CREATE TABLE `__new_global_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`description` text,
	`updated_at` text DEFAULT '2025-11-22T08:44:50.884Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_global_config`("id", "key", "value", "description", "updated_at") SELECT "id", "key", "value", "description", "updated_at" FROM `global_config`;--> statement-breakpoint
DROP TABLE `global_config`;--> statement-breakpoint
ALTER TABLE `__new_global_config` RENAME TO `global_config`;--> statement-breakpoint
CREATE UNIQUE INDEX `global_config_key_unique` ON `global_config` (`key`);--> statement-breakpoint
CREATE TABLE `__new_inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`company` text,
	`message` text NOT NULL,
	`product_id` integer,
	`status` text DEFAULT 'new',
	`created_at` text DEFAULT '2025-11-22T08:44:50.884Z' NOT NULL,
	`replied_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_inquiries`("id", "name", "email", "phone", "company", "message", "product_id", "status", "created_at", "replied_at") SELECT "id", "name", "email", "phone", "company", "message", "product_id", "status", "created_at", "replied_at" FROM `inquiries`;--> statement-breakpoint
DROP TABLE `inquiries`;--> statement-breakpoint
ALTER TABLE `__new_inquiries` RENAME TO `inquiries`;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`excerpt` text,
	`featured_image` text,
	`published` integer DEFAULT false,
	`published_at` text,
	`created_at` text DEFAULT '2025-11-22T08:44:50.883Z' NOT NULL,
	`updated_at` text DEFAULT '2025-11-22T08:44:50.883Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "title", "slug", "content", "excerpt", "featured_image", "published", "published_at", "created_at", "updated_at") SELECT "id", "title", "slug", "content", "excerpt", "featured_image", "published", "published_at", "created_at", "updated_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`price` real,
	`category_id` integer,
	`image_url` text,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT '2025-11-22T08:44:50.883Z' NOT NULL,
	`updated_at` text DEFAULT '2025-11-22T08:44:50.883Z' NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "name", "slug", "description", "price", "category_id", "image_url", "is_active", "created_at", "updated_at") SELECT "id", "name", "slug", "description", "price", "category_id", "image_url", "is_active", "created_at", "updated_at" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`featured_image` text,
	`order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT '2025-11-22T08:44:50.884Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "title", "slug", "description", "featured_image", "order", "is_active", "created_at") SELECT "id", "title", "slug", "description", "featured_image", "order", "is_active", "created_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_unique` ON `projects` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`author_name` text NOT NULL,
	`author_company` text,
	`author_image` text,
	`content` text NOT NULL,
	`rating` integer,
	`order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT '2025-11-22T08:44:50.884Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_testimonials`("id", "author_name", "author_company", "author_image", "content", "rating", "order", "is_active", "created_at") SELECT "id", "author_name", "author_company", "author_image", "content", "rating", "order", "is_active", "created_at" FROM `testimonials`;--> statement-breakpoint
DROP TABLE `testimonials`;--> statement-breakpoint
ALTER TABLE `__new_testimonials` RENAME TO `testimonials`;