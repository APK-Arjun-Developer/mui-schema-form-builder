import React, { useState } from 'react';
import { TextField, Box, IconButton, InputAdornment } from '@mui/material';
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
  const isPassword = fieldConfig.type === FIELD_TYPE.PASSWORD;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const showPasswordToggle = isPassword && fieldConfig.showPasswordToggle !== false;

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
        type={isDate ? 'date' : isPassword && !passwordVisible ? 'password' : 'text'}
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
        slotProps={{
          input: {
            startAdornment: fieldConfig.startAdornment ? (
              <InputAdornment position="start">{fieldConfig.startAdornment}</InputAdornment>
            ) : undefined,
            endAdornment:
              showPasswordToggle || fieldConfig.endAdornment ? (
                <InputAdornment position="end">
                  {fieldConfig.endAdornment}
                  {showPasswordToggle && (
                    <IconButton
                      aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                      edge="end"
                      onClick={() => setPasswordVisible((visible) => !visible)}
                      onMouseDown={(event) => event.preventDefault()}
                      type="button"
                    >
                      <span aria-hidden="true">{passwordVisible ? '🙈' : '👁️'}</span>
                    </IconButton>
                  )}
                </InputAdornment>
              ) : undefined,
          },
          htmlInput: {
            ref: fieldRef,
            'aria-required': fieldConfig.required,
            'aria-invalid': !!error,
            'aria-describedby': errorId,
          },
        }}
        {...fieldConfig.muiProps}
      />
    </Box>
  );
});

TextInput.displayName = 'TextInput';
