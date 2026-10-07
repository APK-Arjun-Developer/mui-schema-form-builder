import React, { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { Grid } from '@mui/material';
import { FIELD_TYPE } from './types/field.types';
import { useFormBuilderContext } from './FormBuilderContext';
import type { FormFieldProps } from './types/component.types';
import type { CustomFieldProps } from './types/builder.types';
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

export type { CustomFieldProps };

const fieldRegistry: Record<string, React.ComponentType<CustomFieldProps>> = {};

/**
 * Register a custom (or override a built-in) field type globally.
 * @deprecated Prefer the `components` prop on FormBuilder/FormWizard/FilterForm
 *   to avoid global mutable state. `registerFieldType` is kept for backward
 *   compatibility and for the DatePicker optional integration pattern.
 */
export function registerFieldType(
  type: string,
  Component: React.ComponentType<CustomFieldProps>,
): void {
  fieldRegistry[type] = Component;
}

export const FormField = React.memo(({ fieldConfig, control }: FormFieldProps) => {
  const {
    readOnly,
    components: ctxComponents,
    unregister: ctxUnregister,
  } = useFormBuilderContext();

  // CRITICAL: Only subscribe to form state when this field has a visibility condition.
  // Passing `disabled: true` tells react-hook-form NOT to run the subscription,
  // so sibling fields typing do NOT cause this component to re-render.
  // This makes React.memo actually effective for fields without visibleIf.
  const watchedValues = useWatch({
    control,
    disabled: !fieldConfig.visibleIf,
  });

  const isVisible = !fieldConfig.visibleIf || fieldConfig.visibleIf(watchedValues);

  useEffect(() => {
    if (!isVisible && fieldConfig.unregisterWhenHidden && ctxUnregister) {
      ctxUnregister(fieldConfig.name);
    }
  }, [isVisible, fieldConfig.unregisterWhenHidden, fieldConfig.name, ctxUnregister]);

  if (!isVisible) return null;

  if (readOnly) {
    return (
      <Grid size={fieldConfig.grid ?? { xs: 12 }}>
        <ReadOnlyField fieldConfig={fieldConfig} control={control} />
      </Grid>
    );
  }

  const CustomComponent = ctxComponents[fieldConfig.type] ?? fieldRegistry[fieldConfig.type];
  if (CustomComponent) {
    return (
      <Grid size={fieldConfig.grid ?? { xs: 12 }}>
        <CustomComponent fieldConfig={fieldConfig} control={control} />
      </Grid>
    );
  }

  switch (fieldConfig.type) {
    case FIELD_TYPE.TEXT:
    case FIELD_TYPE.TEXTAREA:
    case FIELD_TYPE.DATE:
      return (
        <Grid size={fieldConfig.grid ?? { xs: 12 }}>
          <TextInput fieldConfig={fieldConfig} control={control} />
        </Grid>
      );
    case FIELD_TYPE.NUMBER:
      return (
        <Grid size={fieldConfig.grid ?? { xs: 12 }}>
          <NumberInput fieldConfig={fieldConfig} control={control} />
        </Grid>
      );
    case FIELD_TYPE.SELECT:
      return (
        <Grid size={fieldConfig.grid ?? { xs: 12 }}>
          <SelectInput fieldConfig={fieldConfig} control={control} />
        </Grid>
      );
    case FIELD_TYPE.AUTOCOMPLETE:
      return (
        <Grid size={fieldConfig.grid ?? { xs: 12 }}>
          <AutocompleteInput fieldConfig={fieldConfig} control={control} />
        </Grid>
      );
    case FIELD_TYPE.RADIO:
      return (
        <Grid size={fieldConfig.grid ?? { xs: 12 }}>
          <RadioInput fieldConfig={fieldConfig} control={control} />
        </Grid>
      );
    case FIELD_TYPE.CHECKBOX:
      return (
        <Grid size={fieldConfig.grid ?? { xs: 12 }}>
          <CheckboxInput fieldConfig={fieldConfig} control={control} />
        </Grid>
      );
    case FIELD_TYPE.PASSWORD:
      return (
        <Grid size={fieldConfig.grid ?? { xs: 12 }}>
          <PasswordInput fieldConfig={fieldConfig} control={control} />
        </Grid>
      );
    case FIELD_TYPE.ARRAY:
      return (
        <Grid size={fieldConfig.grid ?? { xs: 12 }}>
          <ArrayInput fieldConfig={fieldConfig} control={control} />
        </Grid>
      );
    case FIELD_TYPE.COMBO_INPUT:
      return (
        <Grid size={fieldConfig.grid ?? { xs: 12 }}>
          <ComboInput fieldConfig={fieldConfig} control={control} />
        </Grid>
      );
    case FIELD_TYPE.SEARCH:
      return (
        <Grid size={fieldConfig.grid ?? { xs: 12 }}>
          <SearchInput fieldConfig={fieldConfig} control={control} />
        </Grid>
      );
    default:
      return null;
  }
});

FormField.displayName = 'FormField';
