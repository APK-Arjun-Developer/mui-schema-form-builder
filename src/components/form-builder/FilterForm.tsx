import React, { useMemo } from 'react';
import { Box, Button, Grid } from '@mui/material';
import type { Resolver } from 'react-hook-form';
import type { FilterFormProps } from './types/builder.types';
import { FormField } from './FormField';
import { FormBuilderContext, DEFAULT_LABELS, type ResolvedLabels } from './FormBuilderContext';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { filterFormSx } from './FilterForm.styles';

export type { FilterFormProps };

// Passthrough resolver: FilterForm has no validation — fields never show errors.
const passthroughResolver: Resolver = async (values) => ({ values, errors: {} });

export const FilterForm = React.memo(
  ({
    fields,
    onChange,
    defaultValues,
    showReset = false,
    resetText = 'Reset',
    spacing = 2,
    sx,
    readOnly = false,
    labels,
  }: FilterFormProps) => {
    const fieldsWithDefaults = useMemo(
      () =>
        defaultValues
          ? fields.map((f) => ({
              ...f,
              defaultValue:
                defaultValues[f.name] !== undefined ? defaultValues[f.name] : f.defaultValue,
            }))
          : fields,
      [fields, defaultValues],
    );

    const { methods, handleFormReset } = useFormBuilder({
      fields: fieldsWithDefaults,
      resolver: passthroughResolver,
      onChange,
    });

    const { control } = methods;

    const resolvedLabels = useMemo<ResolvedLabels>(
      () => ({
        arrayAddItem: labels?.arrayAddItem ?? DEFAULT_LABELS.arrayAddItem,
        arrayRemove: labels?.arrayRemove ?? DEFAULT_LABELS.arrayRemove,
        arrayItemLabel: labels?.arrayItemLabel ?? DEFAULT_LABELS.arrayItemLabel,
      }),
      [labels],
    );

    const ctxValue = useMemo(
      () => ({ readOnly, labels: resolvedLabels }),
      [readOnly, resolvedLabels],
    );

    return (
      <FormBuilderContext.Provider value={ctxValue}>
        <Box sx={sx}>
          <Grid container spacing={spacing} sx={filterFormSx.grid}>
            {fieldsWithDefaults.map((field) => (
              <FormField key={field.name} fieldConfig={field} control={control} />
            ))}
          </Grid>
          {showReset && (
            <Box sx={filterFormSx.resetBox}>
              <Button
                type="button"
                variant="text"
                size="small"
                onClick={handleFormReset}
                sx={filterFormSx.resetButton}
              >
                {resetText}
              </Button>
            </Box>
          )}
        </Box>
      </FormBuilderContext.Provider>
    );
  },
);

FilterForm.displayName = 'FilterForm';
