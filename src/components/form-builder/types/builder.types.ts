import type React from 'react';
import type { FieldValues, Resolver, ValidationMode, Control } from 'react-hook-form';
import type { z } from 'zod';
import type { SxProps } from '@mui/material';
import type {
  FieldConfig,
  FormBuilderLabels,
  FormWizardActionsParams,
  CustomFieldComponent,
} from './field.types';

export interface FormBuilderHandle {
  reset: () => void;
  submit: () => void;
  setError: (name: string, error: { type: string; message: string }) => void;
  getValues: () => FieldValues;
}

export interface WizardStep {
  label: string;
  description?: string;
  fields: FieldConfig[];
}

export interface FormWizardProps<TSchema extends z.ZodType = z.ZodType> {
  steps: WizardStep[];
  schema?: TSchema;
  resolver?: Resolver;
  onSubmit: (data: z.infer<TSchema>) => void | Promise<void>;
  onCancel?: () => void;
  nextText?: string;
  backText?: string;
  submitText?: string;
  cancelText?: string;
  spacing?: number;
  validationMode?: keyof ValidationMode;
  sx?: SxProps;
  readOnly?: boolean;
  labels?: FormBuilderLabels;
  title?: string;
  titleAlign?: 'left' | 'center' | 'right';
  titlePosition?: 'above' | 'inside';
  renderActions?: (params: FormWizardActionsParams) => React.ReactNode;
  /** Instance-scoped custom field component registry. Prefer this over `registerFieldType()`. */
  components?: Record<string, CustomFieldComponent>;
}

export interface FilterFormProps {
  fields: FieldConfig[];
  onChange: (values: FieldValues) => void;
  defaultValues?: Record<string, unknown>;
  showReset?: boolean;
  resetText?: string;
  spacing?: number;
  sx?: SxProps;
  readOnly?: boolean;
  labels?: FormBuilderLabels;
  /** Instance-scoped custom field component registry. Prefer this over `registerFieldType()`. */
  components?: Record<string, CustomFieldComponent>;
}

export interface CustomFieldProps {
  fieldConfig: FieldConfig;
  control: Control;
}
