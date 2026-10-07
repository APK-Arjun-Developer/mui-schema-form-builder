import type React from 'react';
import type { z } from 'zod';
import type { SxProps, TextFieldProps } from '@mui/material';
import type { FieldValues, ValidationMode, Resolver, Control } from 'react-hook-form';

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

export interface BaseFieldConfig {
  /** Must match a key in the Zod schema object. Dot-notation supported (e.g. "address.city"). */
  name: string;
  label: string;
  defaultValue?: unknown;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  /**
   * Display a required indicator (asterisk) and set `aria-required` on the input.
   * This does NOT add schema validation — validation is solely the responsibility
   * of your Zod schema or custom resolver.
   */
  required?: boolean;
  grid?: GridConfig;
  /**
   * Return false to hide this field. Receives the current form values.
   * Only fields that declare visibleIf subscribe to form-wide state changes —
   * all other fields are unaffected by sibling updates.
   *
   * Hidden fields retain their value in form state by default and are included
   * in submitted data. Set `unregisterWhenHidden: true` to remove the value
   * while hidden. When the field becomes visible again it re-initialises with
   * its `defaultValue`.
   */
  visibleIf?: (values: FieldValues) => boolean;
  /**
   * When true and the field is hidden by `visibleIf`, the field is unregistered
   * from the form state and its value is absent from submitted data while hidden.
   * Requires the field to be inside a FormBuilder or FormWizard (has no effect in
   * FilterForm). Default: false.
   */
  unregisterWhenHidden?: boolean;
  /**
   * Optional section label. Fields with the same consecutive section string are grouped
   * under a shared section header in FormBuilder. Sections are rendered in the order
   * they first appear in the fields array.
   */
  section?: string;
}

type TextMuiProps = TextFieldProps;

export interface TextFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.TEXT;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  muiProps?: TextMuiProps;
}

export interface TextAreaFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.TEXTAREA;
  rows?: number;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  muiProps?: TextMuiProps;
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.DATE;
  muiProps?: TextMuiProps;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.NUMBER;
  min?: number;
  max?: number;
  step?: number;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  muiProps?: TextMuiProps;
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.SELECT;
  options?: Option[];
  multiple?: boolean;
  muiProps?: Record<string, unknown>;
}

export interface AutocompleteFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.AUTOCOMPLETE;
  options?: Option[];
  multiple?: boolean;
  fetchOptions?: (input: string) => Promise<Option[]>;
  muiProps?: Record<string, unknown>;
}

export interface RadioFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.RADIO;
  options?: Option[];
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.CHECKBOX;
  /**
   * When options are provided, renders a checkbox group (value is (string | number)[]).
   * When omitted, renders a single boolean checkbox.
   */
  options?: Option[];
}

export interface PasswordFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.PASSWORD;
  startAdornment?: React.ReactNode;
  muiProps?: TextMuiProps;
}

export interface SearchFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.SEARCH;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  muiProps?: TextMuiProps;
}

export interface DatePickerFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.DATE_PICKER;
  muiProps?: Record<string, unknown>;
}

export interface ArrayFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.ARRAY;
  itemFields?: FieldConfig[];
  addLabel?: string;
  removeLabel?: string;
  minItems?: number;
  maxItems?: number;
}

export interface ComboFieldConfig extends BaseFieldConfig {
  type: typeof FIELD_TYPE.COMBO_INPUT;
  selectOptions?: Option[];
  selectPosition?: 'start' | 'end';
  selectPlaceholder?: string;
  inputType?: 'text' | 'number' | 'search';
  selectWidth?: number;
  min?: number;
  max?: number;
  step?: number;
}

export type FieldConfig =
  | TextFieldConfig
  | TextAreaFieldConfig
  | DateFieldConfig
  | NumberFieldConfig
  | SelectFieldConfig
  | AutocompleteFieldConfig
  | RadioFieldConfig
  | CheckboxFieldConfig
  | PasswordFieldConfig
  | SearchFieldConfig
  | DatePickerFieldConfig
  | ArrayFieldConfig
  | ComboFieldConfig;

export type CustomFieldComponent = React.ComponentType<{
  fieldConfig: FieldConfig;
  control: Control;
}>;

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
  components?: Record<string, CustomFieldComponent>;
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
