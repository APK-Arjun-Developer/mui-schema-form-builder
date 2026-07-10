import React, { useState } from 'react';
import { Box, IconButton, InputAdornment, SvgIcon, TextField } from '@mui/material';
import { useController, type Control } from 'react-hook-form';
import type { FieldConfig } from '../types/field.types';
import { FieldLabel } from './FieldLabel';

interface InputProps {
  fieldConfig: FieldConfig;
  control: Control;
}

function VisibilityIcon() {
  return (
    <SvgIcon>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </SvgIcon>
  );
}

function VisibilityOffIcon() {
  return (
    <SvgIcon>
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
    </SvgIcon>
  );
}

export const PasswordInput = React.memo(({ fieldConfig, control }: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

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

  const toggleVisibility = () => setShowPassword((prev) => !prev);

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
        type={showPassword ? 'text' : 'password'}
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
        slotProps={{
          htmlInput: {
            ref: fieldRef,
            'aria-required': fieldConfig.required,
            'aria-invalid': !!error,
            'aria-describedby': errorId,
          },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={toggleVisibility}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  disabled={fieldConfig.disabled}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        {...fieldConfig.muiProps}
      />
    </Box>
  );
});

PasswordInput.displayName = 'PasswordInput';
