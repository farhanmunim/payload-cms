import * as migration_20260918_151419_initial from './20260918_151419_initial';
import * as migration_20260918_230759_add_content_collections from './20260918_230759_add_content_collections';
import * as migration_20260918_232027_add_content_fields from './20260918_232027_add_content_fields';
import * as migration_20260918_232916_tags_collection from './20260918_232916_tags_collection';
import * as migration_20260918_234012_tidy_field_layout from './20260918_234012_tidy_field_layout';
import * as migration_20260918_234424_site_settings from './20260918_234424_site_settings';
import * as migration_20260918_234903_pages from './20260918_234903_pages';
import * as migration_20260918_235133_social_links_to_settings from './20260918_235133_social_links_to_settings';
import * as migration_20260921_083340_optional_media_alt from './20260921_083340_optional_media_alt';
import * as migration_20260921_085929_url_structure from './20260921_085929_url_structure';
import * as migration_20260921_090953_url_structure_tags from './20260921_090953_url_structure_tags';
import * as migration_20260921_092330_rename_permalinks from './20260921_092330_rename_permalinks';
import * as migration_20260921_093307_user_names_post_author from './20260921_093307_user_names_post_author';
import * as migration_20260921_094232_user_profile_fields from './20260921_094232_user_profile_fields';

export const migrations = [
  {
    up: migration_20260918_151419_initial.up,
    down: migration_20260918_151419_initial.down,
    name: '20260918_151419_initial',
  },
  {
    up: migration_20260918_230759_add_content_collections.up,
    down: migration_20260918_230759_add_content_collections.down,
    name: '20260918_230759_add_content_collections',
  },
  {
    up: migration_20260918_232027_add_content_fields.up,
    down: migration_20260918_232027_add_content_fields.down,
    name: '20260918_232027_add_content_fields',
  },
  {
    up: migration_20260918_232916_tags_collection.up,
    down: migration_20260918_232916_tags_collection.down,
    name: '20260918_232916_tags_collection',
  },
  {
    up: migration_20260918_234012_tidy_field_layout.up,
    down: migration_20260918_234012_tidy_field_layout.down,
    name: '20260918_234012_tidy_field_layout',
  },
  {
    up: migration_20260918_234424_site_settings.up,
    down: migration_20260918_234424_site_settings.down,
    name: '20260918_234424_site_settings',
  },
  {
    up: migration_20260918_234903_pages.up,
    down: migration_20260918_234903_pages.down,
    name: '20260918_234903_pages',
  },
  {
    up: migration_20260918_235133_social_links_to_settings.up,
    down: migration_20260918_235133_social_links_to_settings.down,
    name: '20260918_235133_social_links_to_settings',
  },
  {
    up: migration_20260921_083340_optional_media_alt.up,
    down: migration_20260921_083340_optional_media_alt.down,
    name: '20260921_083340_optional_media_alt',
  },
  {
    up: migration_20260921_085929_url_structure.up,
    down: migration_20260921_085929_url_structure.down,
    name: '20260921_085929_url_structure',
  },
  {
    up: migration_20260921_090953_url_structure_tags.up,
    down: migration_20260921_090953_url_structure_tags.down,
    name: '20260921_090953_url_structure_tags',
  },
  {
    up: migration_20260921_092330_rename_permalinks.up,
    down: migration_20260921_092330_rename_permalinks.down,
    name: '20260921_092330_rename_permalinks',
  },
  {
    up: migration_20260921_093307_user_names_post_author.up,
    down: migration_20260921_093307_user_names_post_author.down,
    name: '20260921_093307_user_names_post_author',
  },
  {
    up: migration_20260921_094232_user_profile_fields.up,
    down: migration_20260921_094232_user_profile_fields.down,
    name: '20260921_094232_user_profile_fields'
  },
];
