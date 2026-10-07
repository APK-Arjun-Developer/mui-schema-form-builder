import React from 'react';
import { Box, InputAdornment, TextField } from '@mui/material';
import { useController } from 'react-hook-form';
import { FIELD_TYPE } from '../types/field.types';
import type { TextFieldConfig, TextAreaFieldConfig, DateFieldConfig } from '../types/field.types';
import type { Control } from 'react-hook-form';
import { FieldLabel } from './FieldLabel';

export interface TextInputProps {
  fieldConfig: TextFieldConfig | TextAreaFieldConfig | DateFieldConfig;
  control: Control;
}

export const TextInput = React.memo(({ fieldConfig, control }: TextInputProps) => {
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

  const startAdornmentNode =
    fieldConfig.type !== FIELD_TYPE.DATE && fieldConfig.startAdornment ? (
      <InputAdornment position="start">{fieldConfig.startAdornment}</InputAdornment>
    ) : undefined;
  const endAdornmentNode =
    fieldConfig.type !== FIELD_TYPE.DATE && fieldConfig.endAdornment ? (
      <InputAdornment position="end">{fieldConfig.endAdornment}</InputAdornment>
    ) : undefined;

  const rows = isTextarea ? (fieldConfig.rows ?? 4) : undefined;

  // muiProps is present on text/textarea/date config types.
  const muiProps = 'muiProps' in fieldConfig ? fieldConfig.muiProps : undefined;

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
          input: { startAdornment: startAdornmentNode, endAdornment: endAdornmentNode },
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
        rows={rows}
        {...muiProps}
      />
    </Box>
  );
});

TextInput.displayName = 'TextInput';
