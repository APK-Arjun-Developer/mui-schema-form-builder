import React from 'react';
import { TextField, Box } from '@mui/material';
import { useController, type Control } from 'react-hook-form';
import { FIELD_TYPE, type FieldConfig } from '../types/field.types';
import { FieldLabel } from './FieldLabel';

interface InputProps {
  fieldConfig: FieldConfig;
  control: Control;
}

export const TextInput = React.memo(({ fieldConfig, control }: InputProps) => {
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
  const isDate = fieldConfig.type === FIELD_TYPE.DATE;
  const isTextarea = fieldConfig.type === FIELD_TYPE.TEXTAREA;

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
          },
        }}
        type={isDate ? 'date' : 'text'}
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
        multiline={isTextarea}
        // Only pass rows when multiline is active — MUI ignores it otherwise and
        // passing rows={1} on a single-line input is misleading noise.
        rows={isTextarea ? (fieldConfig.rows ?? 4) : undefined}
        {...fieldConfig.muiProps}
      />
    </Box>
  );
});

TextInput.displayName = 'TextInput';
