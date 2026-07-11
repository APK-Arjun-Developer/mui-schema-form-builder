import React, { useRef, useCallback } from 'react';
import {
  Box,
  FormControl,
  InputAdornment,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
  type SelectChangeEvent,
} from '@mui/material';
import { useController, type Control } from 'react-hook-form';
import type { FieldConfig } from '../types/field.types';
import { FieldLabel } from './FieldLabel';
import { SearchIcon } from './icons';

interface InputProps {
  fieldConfig: FieldConfig;
  control: Control;
}

type ComboValue = { select: string | number; input: string | number };

const EMPTY_VALUE: ComboValue = { select: '', input: '' };

export const ComboInput = React.memo(({ fieldConfig, control }: InputProps) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name: fieldConfig.name,
    control,
    defaultValue: fieldConfig.defaultValue ?? EMPTY_VALUE,
  });

  const value: ComboValue = field.value ?? EMPTY_VALUE;
  const errorId = error ? `${fieldConfig.name}-error` : undefined;
  const labelId = `${fieldConfig.name}-label`;

  const selectPosition = fieldConfig.selectPosition ?? 'start';
  const inputType = fieldConfig.inputType ?? 'text';
  const selectWidth = fieldConfig.selectWidth ?? 120;

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectChange = useCallback(
    (e: SelectChangeEvent<string | number>) => {
      field.onChange({ ...value, select: e.target.value });
    },
    [field, value],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const inputVal = inputType === 'number' ? (raw === '' ? '' : Number(raw)) : raw;
      field.onChange({ ...value, input: inputVal });
    },
    [field, value, inputType],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      if (!(e.relatedTarget instanceof Node) || !containerRef.current?.contains(e.relatedTarget)) {
        field.onBlur();
      }
    },
    [field],
  );

  const selectEl = (
    <FormControl
      sx={{
        minWidth: selectWidth,
        flexShrink: 0,
        '& .MuiOutlinedInput-root': {
          borderRadius: selectPosition === 'start' ? '4px 0 0 4px' : '0 4px 4px 0',
        },
      }}
      size={fieldConfig.size ?? 'medium'}
      disabled={fieldConfig.disabled}
      error={!!error}
    >
      <Select
        value={value.select ?? ''}
        onChange={handleSelectChange}
        onBlur={handleBlur}
        labelId={labelId}
        displayEmpty
        inputProps={{
          'aria-required': fieldConfig.required,
          'aria-invalid': !!error,
          'aria-describedby': errorId,
          'aria-labelledby': labelId,
        }}
        renderValue={(v) =>
          v
            ? (fieldConfig.selectOptions?.find((o) => o.value === v)?.label ?? String(v))
            : (fieldConfig.selectPlaceholder ?? '')
        }
      >
        {fieldConfig.selectOptions?.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const searchAdornment =
    inputType === 'search' ? (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ) : undefined;

  const inputEl = (
    <TextField
      value={value.input ?? ''}
      onChange={handleInputChange}
      onBlur={handleBlur}
      type={inputType}
      placeholder={fieldConfig.placeholder}
      disabled={fieldConfig.disabled}
      size={fieldConfig.size ?? 'medium'}
      error={!!error}
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: selectPosition === 'start' ? '0 4px 4px 0' : '4px 0 0 4px',
        },
      }}
      slotProps={{
        htmlInput: {
          'aria-required': fieldConfig.required,
          'aria-invalid': !!error,
          'aria-describedby': errorId,
          'aria-labelledby': labelId,
          ...(inputType === 'number'
            ? { min: fieldConfig.min, max: fieldConfig.max, step: fieldConfig.step }
            : {}),
        },
        input: { startAdornment: searchAdornment },
      }}
    />
  );

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
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          '& > :not(:first-of-type)': { marginLeft: '-1px' },
          '& > :focus-within': { position: 'relative', zIndex: 1 },
        }}
      >
        {selectPosition === 'start' ? (
          <>
            {selectEl}
            {inputEl}
          </>
        ) : (
          <>
            {inputEl}
            {selectEl}
          </>
        )}
      </Box>
      {error && (
        <FormHelperText error id={errorId} role="alert">
          {error.message}
        </FormHelperText>
      )}
    </Box>
  );
});

ComboInput.displayName = 'ComboInput';
