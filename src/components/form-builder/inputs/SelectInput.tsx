import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { useController, type Control } from 'react-hook-form';
import type { FieldConfig } from '../types/field.types';

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
  const labelId = `${fieldConfig.name}-label`;
  const errorId = error ? `${fieldConfig.name}-error` : undefined;

  return (
    <FormControl
      fullWidth={fieldConfig.fullWidth ?? true}
      size={fieldConfig.size ?? 'medium'}
      error={!!error}
      disabled={fieldConfig.disabled}
    >
      <InputLabel
        id={labelId}
        htmlFor={fieldConfig.name}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        error={!!error}
      >
        {fieldConfig.label}
      </InputLabel>
      <Select
        {...fieldProps}
        inputRef={fieldRef}
        labelId={labelId}
        label={fieldConfig.label}
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
                return fieldConfig.options?.find((o) => o.value === selected)?.label ?? selected;
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
  );
});

SelectInput.displayName = 'SelectInput';
