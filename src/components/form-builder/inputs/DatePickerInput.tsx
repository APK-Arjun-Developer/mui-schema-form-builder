import React from 'react';
import { useController } from 'react-hook-form';
import { Box } from '@mui/material';
import type { DatePickerFieldConfig } from '../types/field.types';
import type { CustomFieldProps } from '../FormField';

/**
 * Factory that produces a FormBuilder-compatible DatePicker input component.
 *
 * Preferred usage — pass via the `components` prop (no global mutation):
 * ```tsx
 * import { DatePicker } from '@mui/x-date-pickers/DatePicker';
 * import { createDatePickerInput, FIELD_TYPE } from 'mui-schema-form-builder';
 *
 * const DatePickerInput = createDatePickerInput(DatePicker);
 *
 * <FormBuilder
 *   fields={fields}
 *   components={{ [FIELD_TYPE.DATE_PICKER]: DatePickerInput }}
 * />
 * ```
 *
 * Legacy usage — global registration (kept for backward compatibility):
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- DatePicker component type varies by library version
  DatePickerComponent: React.ComponentType<any>,
): React.ComponentType<CustomFieldProps> {
  const DatePickerInput = React.memo(({ fieldConfig, control }: CustomFieldProps) => {
    const config = fieldConfig as DatePickerFieldConfig;

    const {
      field,
      fieldState: { error },
    } = useController({
      name: config.name,
      control,
      defaultValue: config.defaultValue ?? null,
    });

    const errorId = error ? `${config.name}-error` : undefined;

    return (
      <Box>
        <DatePickerComponent
          label={config.label}
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
          disabled={config.disabled}
          slotProps={{
            textField: {
              id: config.name,
              size: config.size ?? 'medium',
              fullWidth: config.fullWidth ?? true,
              required: config.required,
              error: !!error,
              helperText: error ? (
                <span id={errorId} role="alert">
                  {error.message}
                </span>
              ) : undefined,
              inputProps: { 'aria-describedby': errorId },
            },
          }}
          {...config.muiProps}
        />
      </Box>
    );
  });

  DatePickerInput.displayName = 'DatePickerInput';
  return DatePickerInput;
}
