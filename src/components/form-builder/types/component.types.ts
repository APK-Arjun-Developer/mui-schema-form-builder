import type React from 'react';
import type { Control } from 'react-hook-form';
import type { FieldConfig, ArrayFieldConfig } from './field.types';

/** Base input props used by all built-in field components. */
export interface InputProps {
  fieldConfig: FieldConfig;
  control: Control;
}

export interface FieldLabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  id?: string;
  component?: 'label' | 'legend';
}

export interface ReadOnlyFieldProps {
  fieldConfig: FieldConfig;
  control: Control;
}

export interface ArrayInputProps {
  fieldConfig: ArrayFieldConfig;
  control: Control;
}

export interface FormFieldProps {
  fieldConfig: FieldConfig;
  control: Control;
}

export type ComboValue = { select: string | number; input: string | number };

export interface VirtualRowData {
  fields: FieldConfig[];
  control: Control;
}

export type FixedSizeListType = React.ComponentType<{
  height: number;
  itemCount: number;
  itemSize: number;
  width: string | number;
  itemData: VirtualRowData;
  children: React.ComponentType<{
    index: number;
    style: React.CSSProperties;
    data: VirtualRowData;
  }>;
}>;
