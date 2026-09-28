import type { CollectionConfig } from 'payload'

import { triggerDeployAfterChange, triggerDeployAfterDelete } from '../hooks/triggerDeploy'

import { slugField } from '../fields/slug'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    group: 'Organisation',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [triggerDeployAfterChange],
    afterDelete: [triggerDeployAfterDelete],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    slugField('name'),
  ],
}
