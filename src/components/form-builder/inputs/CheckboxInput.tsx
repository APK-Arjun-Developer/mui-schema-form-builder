import React, { useCallback } from 'react';
import {
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  FormGroup,
  Box,
} from '@mui/material';
import { useController, type Control } from 'react-hook-form';
import type { FieldConfig } from '../types/field.types';
import { FieldLabel } from './FieldLabel';

interface InputProps {
  fieldConfig: FieldConfig;
  control: Control;
}

export const CheckboxInput = React.memo(({ fieldConfig, control }: InputProps) => {
  const isGroup = !!fieldConfig.options;

  const {
    field,
    fieldState: { error },
  } = useController({
    name: fieldConfig.name,
    control,
    defaultValue: isGroup ? (fieldConfig.defaultValue ?? []) : (fieldConfig.defaultValue ?? false),
  });

  const errorId = `${fieldConfig.name}-error`;

  // Stable handler — useCallback prevents new function reference on every render,
  // which would otherwise break memoization of individual Checkbox children.
  const handleGroupChange = useCallback(
    (value: string | number) => {
      const currentValues = (field.value as (string | number)[]) ?? [];
      field.onChange(
        currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      );
    },
    [field],
  );

  if (isGroup) {
    return (
      <Box>
        {/*
          Per HTML spec, <legend> MUST be a direct child of <fieldset>.
          FormLabel component="legend" is placed inside FormControl component="fieldset"
          so screen readers associate the group label with the group correctly.
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
              color: error ? 'error.main' : fieldConfig.disabled ? 'text.disabled' : 'text.primary',
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

          <FormGroup row>
            {fieldConfig.options?.map((option) => {
              const checked = (field.value as (string | number)[]).includes(option.value);
              return (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      size={fieldConfig.size ?? 'medium'}
                      checked={checked}
                      onChange={() => handleGroupChange(option.value)}
                      disabled={option.disabled}
                    />
                  }
                  label={option.label}
                />
              );
            })}
          </FormGroup>

          {error && (
            <FormHelperText id={errorId} role="alert">
              {error.message}
            </FormHelperText>
          )}
        </FormControl>
      </Box>
    );
  }

  // Single boolean checkbox
  const { ref: fieldRef, ...fieldProps } = field;

  return (
    <Box>
      <FieldLabel
        htmlFor={fieldConfig.name}
        label={fieldConfig.label}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        error={!!error}
      />
      <FormControl error={!!error} disabled={fieldConfig.disabled}>
        <FormControlLabel
          control={
            <Checkbox
              {...fieldProps}
              id={fieldConfig.name}
              size={fieldConfig.size ?? 'medium'}
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              slotProps={{
                input: {
                  ref: fieldRef,
                  'aria-required': fieldConfig.required,
                  'aria-invalid': !!error,
                  'aria-describedby': error ? errorId : undefined,
                } as React.InputHTMLAttributes<HTMLInputElement>,
              }}
            />
          }
          label={fieldConfig.label}
        />
        {error && (
          <FormHelperText id={errorId} role="alert">
            {error.message}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );
});

CheckboxInput.displayName = 'CheckboxInput';
