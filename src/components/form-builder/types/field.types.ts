import type { ReactNode } from 'react';
import type { z } from 'zod';
import type { SxProps, TypographyProps } from '@mui/material';
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
  PASSWORD: 'password',
  /** Dynamic list of sub-form items managed by react-hook-form's useFieldArray. */
  ARRAY: 'array',
  /** MUI DatePicker — requires @mui/x-date-pickers peer dep + LocalizationProvider. */
  DATE_PICKER: 'datepicker',
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
  /** Use FIELD_TYPE constants or any custom type string registered via registerFieldType(). */
  type: FieldType | string;
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
  /** Leading adornment for TextField-based fields. Rendered via MUI InputAdornment. */
  startAdornment?: ReactNode;
  /** Trailing adornment for TextField-based fields. Rendered via MUI InputAdornment. */
  endAdornment?: ReactNode;
  /** Show the visibility toggle for PASSWORD fields. Defaults to true. */
  showPasswordToggle?: boolean;
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
  /**
   * Optional section label. Fields with the same consecutive section string are grouped
   * under a shared section header in FormBuilder. Sections are rendered in the order
   * they first appear in the fields array.
   */
  section?: string;
  /** Sub-fields for each array item — ARRAY fields only. */
  itemFields?: FieldConfig[];
  /** Label for the "add item" button — ARRAY fields only. Default: "Add item". */
  addLabel?: string;
  /** Label for the per-item "remove" button — ARRAY fields only. Default: "Remove". */
  removeLabel?: string;
  /** Minimum number of array items — ARRAY fields only. */
  minItems?: number;
  /** Maximum number of array items — ARRAY fields only. */
  maxItems?: number;
}

export interface FormBuilderActionsContext {
  /** Submit the form using react-hook-form validation. Safe to pass to custom submit buttons. */
  submit: () => void;
  /** Reset the form to its default values. */
  reset: () => void;
  /** Cancel handler, when provided. */
  cancel?: () => void;
  /** Whether the form is currently submitting. */
  loading: boolean;
  /** Current zero-based wizard step. Always 0 for FormBuilder. */
  currentStep: number;
  /** Total wizard steps. Always 1 for FormBuilder. */
  totalSteps: number;
  /** Move to the previous wizard step, when available. */
  previousStep?: () => void;
  /** Move to the next wizard step after validating current step fields, when available. */
  nextStep?: () => void | Promise<void>;
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
  /** Optional title rendered above the fields. For complex headers, compose externally. */
  title?: ReactNode;
  /** Props forwarded to the MUI Typography used for title. */
  titleProps?: TypographyProps;
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
  /** MUI sx prop forwarded to the outermost Paper container of the form. */
  sx?: SxProps;
  /**
   * Render all fields as read-only display text instead of interactive inputs.
   * Useful for review/preview screens that reuse the same field configuration.
   */
  readOnly?: boolean;
  /**
   * Override the default built-in UI strings. Useful for i18n and custom copy.
   * Button label props (submitText, cancelText, resetText) take precedence over
   * the equivalent keys in this object.
   */
  labels?: FormBuilderLabels;
  /** Optional render prop to replace built-in action buttons. */
  renderActions?: (context: FormBuilderActionsContext) => ReactNode;
}

/** Overridable built-in UI strings for i18n or custom copy. */
export interface FormBuilderLabels {
  /** Default text for array field "add" button. Default: "Add item". */
  arrayAddItem?: string;
  /** Default text for array item "remove" button. Default: "Remove". */
  arrayRemove?: string;
  /** Label shown above each array item. Receives the 1-based index. Default: "Item {n}". */
  arrayItemLabel?: (index: number) => string;
}
