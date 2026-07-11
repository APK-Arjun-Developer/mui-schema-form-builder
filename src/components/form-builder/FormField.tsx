import React from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { Grid } from '@mui/material';
import { type FieldConfig, FIELD_TYPE } from './types/field.types';
import { useFormBuilderContext } from './FormBuilderContext';
import { ReadOnlyField } from './inputs/ReadOnlyField';
import { TextInput } from './inputs/TextInput';
import { NumberInput } from './inputs/NumberInput';
import { SelectInput } from './inputs/SelectInput';
import { AutocompleteInput } from './inputs/AutocompleteInput';
import { RadioInput } from './inputs/RadioInput';
import { CheckboxInput } from './inputs/CheckboxInput';
import { ArrayInput } from './inputs/ArrayInput';
import { PasswordInput } from './inputs/PasswordInput';
import { ComboInput } from './inputs/ComboInput';
import { SearchInput } from './inputs/SearchInput';

interface FormFieldProps {
  fieldConfig: FieldConfig;
  control: Control;
}

/** Props shape every custom field component must accept. */
export interface CustomFieldProps {
  fieldConfig: FieldConfig;
  control: Control;
}

// Registry maps field type strings to their render components.
// Defined outside the component — a stable module-level constant.
const fieldRegistry: Record<string, React.ComponentType<CustomFieldProps>> = {
  [FIELD_TYPE.TEXT]: TextInput,
  [FIELD_TYPE.NUMBER]: NumberInput,
  [FIELD_TYPE.SELECT]: SelectInput,
  [FIELD_TYPE.AUTOCOMPLETE]: AutocompleteInput,
  [FIELD_TYPE.RADIO]: RadioInput,
  [FIELD_TYPE.CHECKBOX]: CheckboxInput,
  // TEXTAREA and DATE reuse TextInput — it handles multiline and date type internally.
  [FIELD_TYPE.TEXTAREA]: TextInput,
  [FIELD_TYPE.DATE]: TextInput,
  [FIELD_TYPE.PASSWORD]: PasswordInput,
  [FIELD_TYPE.ARRAY]: ArrayInput,
  [FIELD_TYPE.COMBO_INPUT]: ComboInput,
  [FIELD_TYPE.SEARCH]: SearchInput,
  // DATE_PICKER is not pre-registered — use registerFieldType(FIELD_TYPE.DATE_PICKER, createDatePickerInput(DatePicker))
};

/**
 * Register a custom field type that FormBuilder will render for the given type string.
 * Call this once at app startup before rendering any FormBuilder that uses the type.
 */
export function registerFieldType(
  type: string,
  Component: React.ComponentType<CustomFieldProps>,
): void {
  fieldRegistry[type] = Component;
}

export const FormField = React.memo(({ fieldConfig, control }: FormFieldProps) => {
  const { readOnly } = useFormBuilderContext();

  // CRITICAL: Only subscribe to form state when this field has a visibility condition.
  // Passing `disabled: true` tells react-hook-form NOT to run the subscription,
  // so sibling fields typing do NOT cause this component to re-render.
  // This makes React.memo actually effective for fields without visibleIf.
  const watchedValues = useWatch({
    control,
    disabled: !fieldConfig.visibleIf,
  });

  if (fieldConfig.visibleIf && !fieldConfig.visibleIf(watchedValues)) {
    return null;
  }

  if (readOnly) {
    return (
      <Grid size={fieldConfig.grid ?? { xs: 12 }}>
        <ReadOnlyField fieldConfig={fieldConfig} control={control} />
      </Grid>
    );
  }

  const InputComponent = fieldRegistry[fieldConfig.type] ?? TextInput;

  return (
    <Grid size={fieldConfig.grid ?? { xs: 12 }}>
      <InputComponent fieldConfig={fieldConfig} control={control} />
    </Grid>
  );
});

FormField.displayName = 'FormField';
