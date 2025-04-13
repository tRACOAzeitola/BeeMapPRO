import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'apiaries',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' },
        { name: 'altitude', type: 'number', isOptional: true },
        { name: 'good_hives', type: 'number' },
        { name: 'strong_hives', type: 'number' },
        { name: 'weak_hives', type: 'number' },
        { name: 'dead_hives', type: 'number' },
        { name: 'last_sync', type: 'string' },
        { name: 'pending_changes', type: 'boolean' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'offline_changes',
      columns: [
        { name: 'apiary_id', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'data', type: 'string' }, // JSON stringified
        { name: 'timestamp', type: 'string' },
        { name: 'retry_count', type: 'number' },
        { name: 'created_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'sync_status',
      columns: [
        { name: 'last_sync', type: 'string' },
        { name: 'is_pending', type: 'boolean' },
        { name: 'error', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number' },
      ]
    })
  ]
}); 