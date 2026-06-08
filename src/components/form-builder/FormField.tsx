import React from 'react';
import { type Control, useWatch } from 'react-hook-form';
import { Grid } from '@mui/material';
import { type FieldConfig, FIELD_TYPE } from './types/field.types';
import { TextInput } from './inputs/TextInput';
import { NumberInput } from './inputs/NumberInput';
import { SelectInput } from './inputs/SelectInput';
import { AutocompleteInput } from './inputs/AutocompleteInput';
import { RadioInput } from './inputs/RadioInput';
import { CheckboxInput } from './inputs/CheckboxInput';

interface FormFieldProps {
  fieldConfig: FieldConfig;
  control: Control;
}

// Registry maps field type strings to their render components.
// Defined outside the component — a stable module-level constant.
const fieldRegistry: Record<string, React.ComponentType<{ fieldConfig: FieldConfig; control: Control }>> = {
  [FIELD_TYPE.TEXT]: TextInput,
  [FIELD_TYPE.NUMBER]: NumberInput,
  [FIELD_TYPE.SELECT]: SelectInput,
  [FIELD_TYPE.AUTOCOMPLETE]: AutocompleteInput,
  [FIELD_TYPE.RADIO]: RadioInput,
  [FIELD_TYPE.CHECKBOX]: CheckboxInput,
  // TEXTAREA and DATE reuse TextInput — it handles multiline and date type internally.
  [FIELD_TYPE.TEXTAREA]: TextInput,
  [FIELD_TYPE.DATE]: TextInput,
};

export const FormField = React.memo(({ fieldConfig, control }: FormFieldProps) => {
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

  const InputComponent = fieldRegistry[fieldConfig.type] ?? TextInput;

  return (
    <Grid size={fieldConfig.grid ?? { xs: 12 }}>
      <InputComponent fieldConfig={fieldConfig} control={control} />
    </Grid>
  );
});

FormField.displayName = 'FormField';
