import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Box,
} from '@mui/material';
import { useController, type Control } from 'react-hook-form';
import type { FieldConfig } from '../types/field.types';

interface InputProps {
  fieldConfig: FieldConfig;
  control: Control;
}

export const RadioInput = React.memo(({ fieldConfig, control }: InputProps) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name: fieldConfig.name,
    control,
    defaultValue: fieldConfig.defaultValue ?? '',
  });

  const { ref: fieldRef, ...fieldProps } = field;
  const errorId = `${fieldConfig.name}-error`;

  return (
    <Box>
      {/*
        Per HTML spec, <legend> MUST be a direct child of <fieldset>.
        We place FormLabel component="legend" inside FormControl component="fieldset"
        so that screen readers correctly associate the group label with the group.
        WCAG 1.3.1 — Info and Relationships.
      */}
      <FormControl
        component="fieldset"
        error={!!error}
        disabled={fieldConfig.disabled}
        aria-required={fieldConfig.required}
        aria-describedby={error ? errorId : undefined}
        sx={{ width: '100%' }}
      >
        <FormLabel
          component="legend"
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            mb: 1,
            color: error
              ? 'error.main'
              : fieldConfig.disabled
                ? 'text.disabled'
                : 'text.primary',
            '&.Mui-focused': { color: 'inherit' },
          }}
        >
          {fieldConfig.label}
          {fieldConfig.required && (
            <Box component="span" aria-hidden="true" sx={{ color: 'error.main', ml: 0.5 }}>
              *
            </Box>
          )}
        </FormLabel>

        <RadioGroup {...fieldProps} row>
          {fieldConfig.options?.map((option, index) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              control={
                <Radio
                  size={fieldConfig.size ?? 'medium'}
                  slotProps={{
                    input: {
                      ...(index === 0 ? { ref: fieldRef } : {}),
                      'aria-required': fieldConfig.required,
                      'aria-invalid': !!error,
                    } as React.InputHTMLAttributes<HTMLInputElement>,
                  }}
                />
              }
              label={option.label}
            />
          ))}
        </RadioGroup>

        {error && (
          <FormHelperText id={errorId} role="alert">
            {error.message}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );
});

RadioInput.displayName = 'RadioInput';
