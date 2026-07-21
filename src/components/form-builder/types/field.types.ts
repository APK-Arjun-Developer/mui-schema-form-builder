import type React from 'react';
import type { z } from 'zod';
import type { SxProps } from '@mui/material';
import type { FieldValues, ValidationMode, Resolver } from 'react-hook-form';

export const FIELD_TYPE = {
  TEXT: 'text',
  NUMBER: 'number',
  SELECT: 'select',
  AUTOCOMPLETE: 'autocomplete',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  TEXTAREA: 'textarea',
  DATE: 'date',
  /** Password text input with a show/hide visibility toggle. */
  PASSWORD: 'password',
  /** Dynamic list of sub-form items managed by react-hook-form's useFieldArray. */
  ARRAY: 'array',
  /** MUI DatePicker — requires @mui/x-date-pickers peer dep + LocalizationProvider. */
  DATE_PICKER: 'datepicker',
  /** Fused Select + text/number/search input rendered as a single compound field. */
  COMBO_INPUT: 'combo_input',
  /** Text input with a magnifying-glass start adornment and type="search" — no extra config needed. */
  SEARCH: 'search',
} as const;

export type FieldType = (typeof FIELD_TYPE)[keyof typeof FIELD_TYPE];

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
  /**
   * Node rendered inside an InputAdornment at the start of the input (e.g. "$", an icon).
   * Supported by TEXT, TEXTAREA, NUMBER, and PASSWORD field types.
   */
  startAdornment?: React.ReactNode;
  /**
   * Node rendered inside an InputAdornment at the end of the input (e.g. "kg", a button).
   * Supported by TEXT, TEXTAREA, NUMBER, and PASSWORD field types.
   * Note: PASSWORD fields render their own visibility toggle as the trailing adornment;
   * setting endAdornment on a PASSWORD field has no effect.
   */
  endAdornment?: React.ReactNode;
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
  /** Options for the fused dropdown selector — COMBO_INPUT fields only. */
  selectOptions?: Option[];
  /** Which side the selector appears on — COMBO_INPUT fields only. Defaults to 'start'. */
  selectPosition?: 'start' | 'end';
  /** Placeholder shown in the selector when no option is chosen — COMBO_INPUT fields only. */
  selectPlaceholder?: string;
  /** HTML input type for the text portion — COMBO_INPUT fields only. Defaults to 'text'.
   *  Use 'search' to auto-render a lens icon inside the fused input.
   *  For a standalone search field use FIELD_TYPE.SEARCH instead. */
  inputType?: 'text' | 'number' | 'search';
  /** Width in pixels of the selector portion — COMBO_INPUT fields only. Defaults to 120. */
  selectWidth?: number;
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
  /** Optional heading displayed for the form. */
  title?: string;
  /** Horizontal alignment of the form title. Defaults to 'left'. */
  titleAlign?: 'left' | 'center' | 'right';
  /**
   * Where the title is placed relative to the form body.
   * - 'inside' (default): title renders inside the Paper, above the fields.
   * - 'above': title renders above the Paper container.
   */
  titlePosition?: 'above' | 'inside';
  /**
   * Replace the default Submit / Cancel / Reset buttons with your own rendering.
   * When provided, the built-in action buttons are not rendered.
   */
  renderActions?: (params: FormBuilderActionsParams) => React.ReactNode;
}

/** Parameters passed to the FormBuilder renderActions render-prop. */
export interface FormBuilderActionsParams {
  /** Whether the form is currently submitting. */
  isSubmitting: boolean;
  /** Programmatically trigger form submission (runs validation + onSubmit). */
  submit: () => void;
  /** Calls the onCancel callback if provided. Undefined when onCancel is not set. */
  cancel?: () => void;
  /** Calls the onReset callback and resets the form if provided. Undefined when onReset is not set. */
  reset?: () => void;
}

/** Parameters passed to the FormWizard renderActions render-prop. */
export interface FormWizardActionsParams {
  /** Whether the form is currently submitting. */
  isSubmitting: boolean;
  /** True while the current step is being validated (Next was clicked, async validation running). */
  isNavigating: boolean;
  /** True when the wizard is on the first step. */
  isFirstStep: boolean;
  /** True when the wizard is on the last step. */
  isLastStep: boolean;
  /** Zero-based index of the currently visible step. */
  activeStep: number;
  /** Validate the current step and advance to the next one. */
  next: () => void;
  /** Navigate to the previous step without validation. */
  back: () => void;
  /** Programmatically trigger full-form submission (runs validation + onSubmit). */
  submit: () => void;
  /** Calls the onCancel callback if provided. Undefined when onCancel is not set. */
  cancel?: () => void;
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
