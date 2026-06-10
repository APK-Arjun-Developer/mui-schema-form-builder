import type { z } from 'zod';
import type { FieldValues, ValidationMode, Resolver } from 'react-hook-form';

/**
 * Use FIELD_TYPE (const object) instead of an enum for tree-shaking compatibility
 * and correct behaviour with isolatedModules.
 *
 * Migration from enum:  FieldType.TEXT  →  FIELD_TYPE.TEXT
 * The value-level alias `FieldType = FIELD_TYPE` keeps existing code working.
 */
export const FIELD_TYPE = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  AUTOCOMPLETE: 'autocomplete',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  TEXTAREA: 'textarea',
  DATE: 'date',
} as const;

export type FieldType = (typeof FIELD_TYPE)[keyof typeof FIELD_TYPE];

/** @deprecated Import FIELD_TYPE instead. Kept for backward compatibility. */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const FieldType = FIELD_TYPE;

export interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface GridConfig {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface FieldConfig {
  /** Must match a key in the Zod schema object. Dot-notation supported (e.g. "address.city"). */
  name: string;
  label: string;
  type: FieldType;
  defaultValue?: unknown;
  placeholder?: string;
  options?: Option[];
  multiple?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  required?: boolean;
  grid?: GridConfig;
  /** Minimum value — NUMBER fields only. Also sets the HTML min attribute. */
  min?: number;
  /** Maximum value — NUMBER fields only. Also sets the HTML max attribute. */
  max?: number;
  /** Step increment — NUMBER fields only. Also sets the HTML step attribute. */
  step?: number;
  /** Number of visible text rows — TEXTAREA fields only. Defaults to 4. */
  rows?: number;
  /** Async option fetching for AUTOCOMPLETE fields. Return empty array on error. */
  fetchOptions?: (input: string) => Promise<Option[]>;
  /**
   * Return false to hide this field. Receives current form values.
   * Only fields that declare visibleIf subscribe to form-wide state changes —
   * all other fields are unaffected by sibling updates.
   */
  visibleIf?: (values: FieldValues) => boolean;
  /**
   * Escape hatch: extra props forwarded directly to the underlying MUI component.
   * Values are typed loosely because MUI component prop shapes vary per field type.
   * Prefer explicit FieldConfig properties where possible.
   */
  muiProps?: Record<string, unknown>;
}

export interface FormBuilderProps<TSchema extends z.ZodType = z.ZodType> {
  fields: FieldConfig[];
  /** Zod schema for validation and type inference. Required unless `resolver` is provided. */
  schema?: TSchema;
  /**
   * A react-hook-form `Resolver` (e.g. yupResolver, valibotResolver) used instead of `schema`.
   * When provided, `onSubmit` receives plain `FieldValues` — wrap with your own types as needed.
   * Exactly one of `schema` or `resolver` must be supplied.
   */
  resolver?: Resolver;
  /** Receives the fully validated, Zod-inferred data. Type is inferred from schema. */
  onSubmit: (data: z.infer<TSchema>) => void | Promise<void>;
  onCancel?: () => void;
  /** Called after the form is reset to its default values. */
  onReset?: () => void;
  /** Called on every form value change with the current form values. */
  onChange?: (values: FieldValues) => void;
  /** Called when a single field changes, with its name and new value. */
  onFieldChange?: (name: string, value: unknown) => void;
  submitText?: string;
  cancelText?: string;
  resetText?: string;
  spacing?: number;
  /** Enable react-window virtualization when field count exceeds ~50. Requires react-window peer dep. */
  virtualize?: boolean;
  /** Height in px of the virtualized list container. Default: 500. Only used when virtualize=true. */
  virtualizeHeight?: number;
  /** Height in px of each row in the virtualized list. Default: 80. Only used when virtualize=true. */
  virtualizeItemSize?: number;
  /** When validation runs. Defaults to 'onTouched'. */
  validationMode?: keyof ValidationMode;
}
