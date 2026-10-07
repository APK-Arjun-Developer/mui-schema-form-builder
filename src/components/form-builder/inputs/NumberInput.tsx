import React, { useCallback } from 'react';
import { Box, InputAdornment, TextField } from '@mui/material';
import { useController } from 'react-hook-form';
import type { NumberFieldConfig } from '../types/field.types';
import type { Control } from 'react-hook-form';
import { FieldLabel } from './FieldLabel';

export interface NumberInputProps {
  fieldConfig: NumberFieldConfig;
  control: Control;
}

export const NumberInput = React.memo(({ fieldConfig, control }: NumberInputProps) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name: fieldConfig.name,
    control,
    defaultValue: fieldConfig.defaultValue ?? '',
  });

  const { ref: fieldRef, ...fieldProps } = field;
  const errorId = error ? `${fieldConfig.name}-error` : undefined;

  const startAdornment = fieldConfig.startAdornment ? (
    <InputAdornment position="start">{fieldConfig.startAdornment}</InputAdornment>
  ) : undefined;
  const endAdornment = fieldConfig.endAdornment ? (
    <InputAdornment position="end">{fieldConfig.endAdornment}</InputAdornment>
  ) : undefined;

  // Coerce to number immediately so RHF stores a number, not a string.
  // Zod number validation then works correctly without coerce().
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value === '' ? '' : Number(e.target.value);
      field.onChange(val);
    },
    [field],
  );

  return (
    <Box>
      <FieldLabel
        htmlFor={fieldConfig.name}
        label={fieldConfig.label}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        error={!!error}
      />
      <TextField
        {...fieldProps}
        id={fieldConfig.name}
        slotProps={{
          htmlInput: {
            ref: fieldRef,
            'aria-required': fieldConfig.required,
            'aria-invalid': !!error,
            'aria-describedby': errorId,
            min: fieldConfig.min,
            max: fieldConfig.max,
            step: fieldConfig.step,
          },
          input: { startAdornment, endAdornment },
        }}
        type="number"
        placeholder={fieldConfig.placeholder}
        disabled={fieldConfig.disabled}
        fullWidth={fieldConfig.fullWidth ?? true}
        size={fieldConfig.size ?? 'medium'}
        error={!!error}
        helperText={
          error ? (
            <span id={errorId} role="alert">
              {error.message}
            </span>
          ) : null
        }
        onChange={handleChange}
        {...fieldConfig.muiProps}
      />
    </Box>
  );
});

NumberInput.displayName = 'NumberInput';
