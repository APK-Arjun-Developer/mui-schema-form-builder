import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Autocomplete, TextField, Checkbox, Box } from '@mui/material';
import { useController } from 'react-hook-form';
import type { AutocompleteFieldConfig, Option } from '../types/field.types';
import type { Control } from 'react-hook-form';
import { debounce } from '../utils/debounce';
import { FieldLabel } from './FieldLabel';

export interface AutocompleteInputProps {
  fieldConfig: AutocompleteFieldConfig;
  control: Control;
}

export const AutocompleteInput = React.memo(({ fieldConfig, control }: AutocompleteInputProps) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name: fieldConfig.name,
    control,
    defaultValue: fieldConfig.multiple
      ? (fieldConfig.defaultValue ?? [])
      : (fieldConfig.defaultValue ?? null),
  });

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>(fieldConfig.options ?? []);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Register containerRef with RHF once on mount so shouldFocusError can scroll
  // to and focus this field when Zod validation fails.
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldRef = field.ref;
  useEffect(() => {
    fieldRef(containerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { fetchOptions } = fieldConfig;

  const debouncedFetch = useMemo(
    () =>
      debounce(
        async (searchValue: string, onResults: (results: Option[]) => void, onDone: () => void) => {
          if (!fetchOptions) return;
          try {
            const results = await fetchOptions(searchValue);
            onResults(results);
          } catch {
            // fetchOptions should handle its own error reporting.
          } finally {
            onDone();
          }
        },
        300,
      ),
    [fetchOptions],
  );

  useEffect(() => {
    if (!open && fetchOptions) setOptions([]);
  }, [open, fetchOptions]);

  useEffect(() => {
    if (!open || !fetchOptions) return;
    let cancelled = false;
    setLoading(true);
    debouncedFetch(
      inputValue,
      (results) => {
        if (!cancelled) setOptions(results);
      },
      () => {
        if (!cancelled) setLoading(false);
      },
    );
    return () => {
      cancelled = true;
      debouncedFetch.cancel();
    };
  }, [open, inputValue, debouncedFetch, fetchOptions]);

  const errorId = error ? `${fieldConfig.name}-error` : undefined;

  const { ref: _unused, ...fieldProps } = field;

  return (
    <Box ref={containerRef} tabIndex={-1} sx={{ outline: 'none' }}>
      <FieldLabel
        htmlFor={fieldConfig.name}
        label={fieldConfig.label}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
        error={!!error}
      />
      <Autocomplete
        {...fieldProps}
        multiple={fieldConfig.multiple}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={options}
        loading={loading}
        disabled={fieldConfig.disabled}
        getOptionLabel={(option: Option | string) =>
          typeof option === 'string' ? option : (option.label ?? '')
        }
        isOptionEqualToValue={(option: Option, value: Option) => option.value === value.value}
        onChange={(_event, newValue) => field.onChange(newValue)}
        onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
        renderOption={(props, option: Option, { selected }) => {
          const { key, ...otherProps } = props;
          return (
            <li key={key} {...otherProps}>
              {fieldConfig.multiple && (
                <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
              )}
              {option.label}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            id={fieldConfig.name}
            placeholder={fieldConfig.placeholder}
            size={fieldConfig.size ?? 'medium'}
            error={!!error}
            slotProps={{
              ...params.slotProps,
              htmlInput: {
                ...(params.slotProps?.htmlInput as object),
                'aria-describedby': errorId,
              },
            }}
            helperText={
              error ? (
                <span id={errorId} role="alert">
                  {error.message}
                </span>
              ) : null
            }
          />
        )}
        {...fieldConfig.muiProps}
      />
    </Box>
  );
});

AutocompleteInput.displayName = 'AutocompleteInput';
