import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`url_structure\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`pages\` text DEFAULT '',
  	\`posts\` text DEFAULT 'blog',
  	\`projects\` text DEFAULT 'projects',
  	\`services\` text DEFAULT 'services',
  	\`resources\` text DEFAULT 'resources',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`url_structure\`;`)
}
