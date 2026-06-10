import React from 'react';
import { useController } from 'react-hook-form';
import { Box } from '@mui/material';
import type { FieldConfig } from '../types/field.types';
import type { CustomFieldProps } from '../FormField';

/**
 * Factory that produces a FormBuilder-compatible DatePicker input component.
 *
 * Usage (call once at app startup, before rendering any form that uses it):
 * ```tsx
 * import { DatePicker } from '@mui/x-date-pickers/DatePicker';
 * import { createDatePickerInput, registerFieldType, FIELD_TYPE } from 'mui-schema-form-builder';
 *
 * registerFieldType(FIELD_TYPE.DATE_PICKER, createDatePickerInput(DatePicker));
 * ```
 *
 * Requirements:
 * - `@mui/x-date-pickers` must be installed as a dependency.
 * - Your app must be wrapped with `<LocalizationProvider>`.
 * - Values are stored as ISO strings; use `z.string().datetime()` in your Zod schema.
 */
export function createDatePickerInput(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DatePickerComponent: React.ComponentType<any>,
): React.ComponentType<CustomFieldProps> {
  const DatePickerInput = React.memo(({ fieldConfig, control }: CustomFieldProps) => {
    const {
      field,
      fieldState: { error },
    } = useController({
      name: fieldConfig.name,
      control,
      defaultValue: (fieldConfig as FieldConfig).defaultValue ?? null,
    });

    const errorId = error ? `${fieldConfig.name}-error` : undefined;

    return (
      <Box>
        <DatePickerComponent
          label={fieldConfig.label}
          value={field.value ?? null}
          onChange={(val: unknown) => {
            if (val === null || val === undefined) {
              field.onChange(null);
              return;
            }
            // Accept both Dayjs (.toISOString()) and native Date objects.
            if (typeof (val as { toISOString?: () => string }).toISOString === 'function') {
              field.onChange((val as { toISOString: () => string }).toISOString());
            } else {
              field.onChange(val);
            }
          }}
          disabled={fieldConfig.disabled}
          slotProps={{
            textField: {
              id: fieldConfig.name,
              size: (fieldConfig as FieldConfig).size ?? 'medium',
              fullWidth: (fieldConfig as FieldConfig).fullWidth ?? true,
              required: fieldConfig.required,
              error: !!error,
              helperText: error ? (
                <span id={errorId} role="alert">
                  {error.message}
                </span>
              ) : undefined,
              inputProps: { 'aria-describedby': errorId },
            },
          }}
          {...(fieldConfig as FieldConfig).muiProps}
        />
      </Box>
    );
  });

  DatePickerInput.displayName = 'DatePickerInput';
  return DatePickerInput;
}
