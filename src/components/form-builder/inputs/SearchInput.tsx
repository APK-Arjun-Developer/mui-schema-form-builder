import React from 'react';
import { Box, InputAdornment, TextField } from '@mui/material';
import { useController, type Control } from 'react-hook-form';
import type { FieldConfig } from '../types/field.types';
import { FieldLabel } from './FieldLabel';
import { SearchIcon } from './icons';

interface InputProps {
  fieldConfig: FieldConfig;
  control: Control;
}

export const SearchInput = React.memo(({ fieldConfig, control }: InputProps) => {
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

  const startAdornment = (
    <InputAdornment position="start">{fieldConfig.startAdornment ?? <SearchIcon />}</InputAdornment>
  );
  const endAdornment = fieldConfig.endAdornment ? (
    <InputAdornment position="end">{fieldConfig.endAdornment}</InputAdornment>
  ) : undefined;

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
        type="search"
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
          input: { startAdornment, endAdornment },
        }}
        {...fieldConfig.muiProps}
      />
    </Box>
  );
});

SearchInput.displayName = 'SearchInput';
