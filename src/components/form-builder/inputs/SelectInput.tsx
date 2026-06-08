import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  ListItemText,
  Box,
} from '@mui/material';
import { useController, type Control } from 'react-hook-form';
import type { FieldConfig } from '../types/field.types';
import { FieldLabel } from './FieldLabel';

interface InputProps {
  fieldConfig: FieldConfig;
  control: Control;
}

export const SelectInput = React.memo(({ fieldConfig, control }: InputProps) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name: fieldConfig.name,
    control,
    defaultValue: fieldConfig.multiple
      ? (fieldConfig.defaultValue ?? [])
      : (fieldConfig.defaultValue ?? ''),
  });

  const { ref: fieldRef, ...fieldProps } = field;
  const errorId = error ? `${fieldConfig.name}-error` : undefined;

  return (
    <Box>
      <FieldLabel
        htmlFor={fieldConfig.name}
        label={fieldConfig.label}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        error={!!error}
      />
      <FormControl
        fullWidth={fieldConfig.fullWidth ?? true}
        size={fieldConfig.size ?? 'medium'}
        error={!!error}
        disabled={fieldConfig.disabled}
      >
        <Select
          {...fieldProps}
          inputRef={fieldRef}
          inputProps={{
            id: fieldConfig.name,
            'aria-required': fieldConfig.required,
            'aria-invalid': !!error,
            'aria-describedby': errorId,
          }}
          multiple={fieldConfig.multiple}
          displayEmpty
          renderValue={
            fieldConfig.multiple
              ? (selected) => {
                  const values = selected as (string | number)[];
                  if (!values || values.length === 0)
                    return fieldConfig.placeholder ?? 'Select options';
                  return values
                    .map((val) => fieldConfig.options?.find((o) => o.value === val)?.label ?? val)
                    .join(', ');
                }
              : (selected) => {
                  if (!selected) return fieldConfig.placeholder ?? 'Select an option';
                  return (
                    fieldConfig.options?.find((o) => o.value === selected)?.label ?? selected
                  );
                }
          }
          {...fieldConfig.muiProps}
        >
          {fieldConfig.options?.map((option) => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {fieldConfig.multiple && (
                <Checkbox checked={(field.value as (string | number)[]).indexOf(option.value) > -1} />
              )}
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </Select>
        {error && (
          <FormHelperText id={errorId} role="alert">
            {error.message}
          </FormHelperText>
        )}
      </FormControl>
    </Box>
  );
});

SelectInput.displayName = 'SelectInput';
