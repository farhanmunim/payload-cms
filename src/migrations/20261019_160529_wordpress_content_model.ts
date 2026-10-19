import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`projects_kpis\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`caption\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_kpis_order_idx\` ON \`projects_kpis\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_kpis_parent_id_idx\` ON \`projects_kpis\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_version_kpis\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`caption\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_version_kpis_order_idx\` ON \`_projects_v_version_kpis\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_kpis_parent_id_idx\` ON \`_projects_v_version_kpis\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`experience\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text,
  	\`order\` numeric DEFAULT 0,
  	\`logo_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`experience_slug_idx\` ON \`experience\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`experience_logo_idx\` ON \`experience\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`experience_updated_at_idx\` ON \`experience\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`experience_created_at_idx\` ON \`experience\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`thumbnail_fallback\` text;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_thumbnail_fallback\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`published_at\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`thumbnail_fallback\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`role\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`url_label\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`source_url\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`source_label\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`problem\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`approach\` text;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`outcome\` text;`)
  await db.run(sql`ALTER TABLE \`projects_rels\` ADD \`categories_id\` integer REFERENCES categories(id);`)
  await db.run(sql`CREATE INDEX \`projects_rels_categories_id_idx\` ON \`projects_rels\` (\`categories_id\`);`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_published_at\` text;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_thumbnail_fallback\` text;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_role\` text;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_url_label\` text;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_source_url\` text;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_source_label\` text;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_problem\` text;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_approach\` text;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_outcome\` text;`)
  await db.run(sql`ALTER TABLE \`_projects_v_rels\` ADD \`categories_id\` integer REFERENCES categories(id);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_categories_id_idx\` ON \`_projects_v_rels\` (\`categories_id\`);`)
  await db.run(sql`ALTER TABLE \`resources\` ADD \`referral\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`resources\` ADD \`thumbnail_fallback\` text;`)
  await db.run(sql`ALTER TABLE \`resources\` ADD \`url_label\` text;`)
  await db.run(sql`ALTER TABLE \`_resources_v\` ADD \`version_referral\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_resources_v\` ADD \`version_thumbnail_fallback\` text;`)
  await db.run(sql`ALTER TABLE \`_resources_v\` ADD \`version_url_label\` text;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`experience_id\` integer REFERENCES experience(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_experience_id_idx\` ON \`payload_locked_documents_rels\` (\`experience_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`projects_kpis\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_version_kpis\`;`)
  await db.run(sql`DROP TABLE \`experience\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_projects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_projects_rels\`("id", "order", "parent_id", "path", "tags_id") SELECT "id", "order", "parent_id", "path", "tags_id" FROM \`projects_rels\`;`)
  await db.run(sql`DROP TABLE \`projects_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_projects_rels\` RENAME TO \`projects_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`projects_rels_order_idx\` ON \`projects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_parent_idx\` ON \`projects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_path_idx\` ON \`projects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_tags_id_idx\` ON \`projects_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__projects_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__projects_v_rels\`("id", "order", "parent_id", "path", "tags_id") SELECT "id", "order", "parent_id", "path", "tags_id" FROM \`_projects_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__projects_v_rels\` RENAME TO \`_projects_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_order_idx\` ON \`_projects_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_parent_idx\` ON \`_projects_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_path_idx\` ON \`_projects_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_tags_id_idx\` ON \`_projects_v_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`services_id\` integer,
  	\`resources_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`services_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`resources_id\`) REFERENCES \`resources\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "pages_id", "posts_id", "projects_id", "services_id", "resources_id", "categories_id", "tags_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "pages_id", "posts_id", "projects_id", "services_id", "resources_id", "categories_id", "tags_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_services_id_idx\` ON \`payload_locked_documents_rels\` (\`services_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_resources_id_idx\` ON \`payload_locked_documents_rels\` (\`resources_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tags_id_idx\` ON \`payload_locked_documents_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`thumbnail_fallback\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_thumbnail_fallback\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`published_at\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`thumbnail_fallback\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`role\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`url_label\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`source_url\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`source_label\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`problem\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`approach\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`outcome\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_published_at\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_thumbnail_fallback\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_role\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_url_label\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_source_url\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_source_label\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_problem\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_approach\`;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` DROP COLUMN \`version_outcome\`;`)
  await db.run(sql`ALTER TABLE \`resources\` DROP COLUMN \`referral\`;`)
  await db.run(sql`ALTER TABLE \`resources\` DROP COLUMN \`thumbnail_fallback\`;`)
  await db.run(sql`ALTER TABLE \`resources\` DROP COLUMN \`url_label\`;`)
  await db.run(sql`ALTER TABLE \`_resources_v\` DROP COLUMN \`version_referral\`;`)
  await db.run(sql`ALTER TABLE \`_resources_v\` DROP COLUMN \`version_thumbnail_fallback\`;`)
  await db.run(sql`ALTER TABLE \`_resources_v\` DROP COLUMN \`version_url_label\`;`)
}
