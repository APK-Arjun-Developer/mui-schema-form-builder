import { FIELD_TYPE, type FieldConfig } from '../types/field.types';

/** Reads the value at a dot-notation path from a nested object. */
export function getPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let cursor: unknown = obj;
  for (const part of parts) {
    if (cursor == null || typeof cursor !== 'object') return undefined;
    cursor = (cursor as Record<string, unknown>)[part];
  }
  return cursor;
}

/** Sets a value at a dot-notation path inside a nested object, creating intermediate objects. */
export function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let cursor = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (cursor[key] === undefined || typeof cursor[key] !== 'object' || cursor[key] === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

/** Returns the appropriate empty/default value for a field based on its type. */
function defaultForField(field: FieldConfig): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  switch (field.type) {
    case FIELD_TYPE.ARRAY:
      return [];
    case FIELD_TYPE.CHECKBOX:
      return field.options ? [] : false;
    case FIELD_TYPE.SELECT:
      return field.multiple ? [] : '';
    case FIELD_TYPE.AUTOCOMPLETE:
      return field.multiple ? [] : null;
    case FIELD_TYPE.COMBO_INPUT:
      return { select: '', input: '' };
    default:
      return '';
  }
}

/**
 * Builds a nested default-value object from a flat FieldConfig array.
 * Dot-notation field names (e.g. "address.city") produce nested structure
 * ({ address: { city: '' } }) rather than flat keys.
 */
export function buildDefaultValues(fields: FieldConfig[]): Record<string, unknown> {
  const acc: Record<string, unknown> = {};
  for (const field of fields) {
    setPath(acc, field.name, defaultForField(field));
  }
  return acc;
}

/**
 * Builds the default value object for a single array item's sub-fields.
 * Uses the same type-aware logic as buildDefaultValues so appending a new array
 * item produces identical defaults to the initial form render.
 *
 * Sub-field names with dot-notation (e.g. "address.city") produce nested
 * structure inside the item object rather than flat keys.
 */
export function buildArrayItemDefaults(itemFields: FieldConfig[]): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const sub of itemFields) {
    setPath(item, sub.name, defaultForField(sub));
  }
  return item;
}
