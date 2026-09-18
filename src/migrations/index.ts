import * as migration_20260918_151419_initial from './20260918_151419_initial';
import * as migration_20260918_230759_add_content_collections from './20260918_230759_add_content_collections';
import * as migration_20260918_232027_add_content_fields from './20260918_232027_add_content_fields';
import * as migration_20260918_232916_tags_collection from './20260918_232916_tags_collection';

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
    name: '20260918_232916_tags_collection'
  },
];
