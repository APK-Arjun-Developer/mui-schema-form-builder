import React, { useMemo } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { useController } from 'react-hook-form';
import type { InputProps } from '../types/component.types';
import { FieldLabel } from './FieldLabel';

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
  // labelId points to the FieldLabel wrapper — MUI Select uses it for aria-labelledby.
  const labelId = `${fieldConfig.name}-label`;
  const errorId = error ? `${fieldConfig.name}-error` : undefined;

  const renderValue = useMemo(() => {
    if (fieldConfig.multiple) {
      return (selected: unknown) => {
        const values = selected as (string | number)[];
        if (!values || values.length === 0) return fieldConfig.placeholder ?? 'Select options';
        return values
          .map((val) => fieldConfig.options?.find((o) => o.value === val)?.label ?? val)
          .join(', ');
      };
    }
    return (selected: unknown) => {
      if (!selected) return fieldConfig.placeholder ?? 'Select an option';
      return fieldConfig.options?.find((o) => o.value === selected)?.label ?? String(selected);
    };
  }, [fieldConfig.multiple, fieldConfig.options, fieldConfig.placeholder]);

  return (
    <Box>
      <FieldLabel
        id={labelId}
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
          labelId={labelId}
          inputProps={{
            id: fieldConfig.name,
            'aria-required': fieldConfig.required,
            'aria-invalid': !!error,
            'aria-describedby': errorId,
          }}
          multiple={fieldConfig.multiple}
          displayEmpty
          renderValue={renderValue}
          {...fieldConfig.muiProps}
        >
          {fieldConfig.options?.map((option) => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {fieldConfig.multiple && (
                <Checkbox
                  checked={(field.value as (string | number)[]).indexOf(option.value) > -1}
                />
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
