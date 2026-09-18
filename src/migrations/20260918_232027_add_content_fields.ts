import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`posts_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_tags_order_idx\` ON \`posts_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_tags_parent_id_idx\` ON \`posts_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_version_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_version_tags_order_idx\` ON \`_posts_v_version_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_tags_parent_id_idx\` ON \`_posts_v_version_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_tags_order_idx\` ON \`projects_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_tags_parent_id_idx\` ON \`projects_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_version_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_version_tags_order_idx\` ON \`_projects_v_version_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_tags_parent_id_idx\` ON \`_projects_v_version_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`resources_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`resources\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`resources_tags_order_idx\` ON \`resources_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`resources_tags_parent_id_idx\` ON \`resources_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_resources_v_version_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_resources_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_resources_v_version_tags_order_idx\` ON \`_resources_v_version_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_resources_v_version_tags_parent_id_idx\` ON \`_resources_v_version_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`services_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`services\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`services_tags_order_idx\` ON \`services_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`services_tags_parent_id_idx\` ON \`services_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_services_v_version_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tag\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_services_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_services_v_version_tags_order_idx\` ON \`_services_v_version_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_services_v_version_tags_parent_id_idx\` ON \`_services_v_version_tags\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`featured\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_featured\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`featured\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`projects\` ADD \`attachment_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`projects_attachment_idx\` ON \`projects\` (\`attachment_id\`);`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_featured\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_projects_v\` ADD \`version_attachment_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_attachment_idx\` ON \`_projects_v\` (\`version_attachment_id\`);`)
  await db.run(sql`ALTER TABLE \`resources\` ADD \`featured\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`resources\` ADD \`attachment_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`resources_attachment_idx\` ON \`resources\` (\`attachment_id\`);`)
  await db.run(sql`ALTER TABLE \`_resources_v\` ADD \`version_featured\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_resources_v\` ADD \`version_attachment_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_resources_v_version_version_attachment_idx\` ON \`_resources_v\` (\`version_attachment_id\`);`)
  await db.run(sql`ALTER TABLE \`services\` ADD \`featured\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_services_v\` ADD \`version_featured\` integer DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`posts_tags\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_version_tags\`;`)
  await db.run(sql`DROP TABLE \`projects_tags\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_version_tags\`;`)
  await db.run(sql`DROP TABLE \`resources_tags\`;`)
  await db.run(sql`DROP TABLE \`_resources_v_version_tags\`;`)
  await db.run(sql`DROP TABLE \`services_tags\`;`)
  await db.run(sql`DROP TABLE \`_services_v_version_tags\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`url\` text,
  	\`cover_image_id\` integer,
  	\`summary\` text,
  	\`content\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_projects\`("id", "title", "slug", "url", "cover_image_id", "summary", "content", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "url", "cover_image_id", "summary", "content", "updated_at", "created_at", "_status" FROM \`projects\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`ALTER TABLE \`__new_projects\` RENAME TO \`projects\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`projects_cover_image_idx\` ON \`projects\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`projects__status_idx\` ON \`projects\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__projects_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_url\` text,
  	\`version_cover_image_id\` integer,
  	\`version_summary\` text,
  	\`version_content\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__projects_v\`("id", "parent_id", "version_title", "version_slug", "version_url", "version_cover_image_id", "version_summary", "version_content", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest") SELECT "id", "parent_id", "version_title", "version_slug", "version_url", "version_cover_image_id", "version_summary", "version_content", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest" FROM \`_projects_v\`;`)
  await db.run(sql`DROP TABLE \`_projects_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__projects_v\` RENAME TO \`_projects_v\`;`)
  await db.run(sql`CREATE INDEX \`_projects_v_parent_idx\` ON \`_projects_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_slug_idx\` ON \`_projects_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_cover_image_idx\` ON \`_projects_v\` (\`version_cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_updated_at_idx\` ON \`_projects_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_created_at_idx\` ON \`_projects_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version__status_idx\` ON \`_projects_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_created_at_idx\` ON \`_projects_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_updated_at_idx\` ON \`_projects_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_latest_idx\` ON \`_projects_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`__new_resources\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`url\` text,
  	\`cover_image_id\` integer,
  	\`description\` text,
  	\`content\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_resources\`("id", "title", "slug", "url", "cover_image_id", "description", "content", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "url", "cover_image_id", "description", "content", "updated_at", "created_at", "_status" FROM \`resources\`;`)
  await db.run(sql`DROP TABLE \`resources\`;`)
  await db.run(sql`ALTER TABLE \`__new_resources\` RENAME TO \`resources\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`resources_slug_idx\` ON \`resources\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`resources_cover_image_idx\` ON \`resources\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`resources_updated_at_idx\` ON \`resources\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`resources_created_at_idx\` ON \`resources\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`resources__status_idx\` ON \`resources\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__resources_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_url\` text,
  	\`version_cover_image_id\` integer,
  	\`version_description\` text,
  	\`version_content\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`resources\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__resources_v\`("id", "parent_id", "version_title", "version_slug", "version_url", "version_cover_image_id", "version_description", "version_content", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest") SELECT "id", "parent_id", "version_title", "version_slug", "version_url", "version_cover_image_id", "version_description", "version_content", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest" FROM \`_resources_v\`;`)
  await db.run(sql`DROP TABLE \`_resources_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__resources_v\` RENAME TO \`_resources_v\`;`)
  await db.run(sql`CREATE INDEX \`_resources_v_parent_idx\` ON \`_resources_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_resources_v_version_version_slug_idx\` ON \`_resources_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_resources_v_version_version_cover_image_idx\` ON \`_resources_v\` (\`version_cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_resources_v_version_version_updated_at_idx\` ON \`_resources_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_resources_v_version_version_created_at_idx\` ON \`_resources_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_resources_v_version_version__status_idx\` ON \`_resources_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_resources_v_created_at_idx\` ON \`_resources_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_resources_v_updated_at_idx\` ON \`_resources_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_resources_v_latest_idx\` ON \`_resources_v\` (\`latest\`);`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`featured\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_featured\`;`)
  await db.run(sql`ALTER TABLE \`services\` DROP COLUMN \`featured\`;`)
  await db.run(sql`ALTER TABLE \`_services_v\` DROP COLUMN \`version_featured\`;`)
}
