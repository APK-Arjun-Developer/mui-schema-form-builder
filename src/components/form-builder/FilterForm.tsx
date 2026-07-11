import { useMemo } from 'react';
import { Box, Button, Grid } from '@mui/material';
import type { SxProps } from '@mui/material';
import type { FieldValues, Resolver } from 'react-hook-form';
import type { FieldConfig, FormBuilderLabels } from './types/field.types';
import { FormField } from './FormField';
import { FormBuilderContext, DEFAULT_LABELS, type ResolvedLabels } from './FormBuilderContext';
import { useFormBuilder } from '../../hooks/useFormBuilder';

export interface FilterFormProps {
  /** Fields to render as filter inputs. */
  fields: FieldConfig[];
  /** Called on every field change with the current filter values. */
  onChange: (values: FieldValues) => void;
  /**
   * Initial values keyed by field name. Merged with each field's own defaultValue —
   * this prop takes precedence. Changes after initial render do not reset the form;
   * use a key prop to remount if you need to swap the initial state.
   */
  defaultValues?: Record<string, unknown>;
  /** Show a Reset button that returns all fields to their default values. Defaults to false. */
  showReset?: boolean;
  /** Label for the reset button. Defaults to 'Reset'. */
  resetText?: string;
  spacing?: number;
  sx?: SxProps;
  readOnly?: boolean;
  labels?: FormBuilderLabels;
}

// Passthrough resolver: FilterForm has no validation — fields never show errors.
const passthroughResolver: Resolver = async (values) => ({ values, errors: {} });

export const FilterForm = ({
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
        <Grid container spacing={spacing} sx={{ alignItems: 'flex-end' }}>
          {fieldsWithDefaults.map((field) => (
            <FormField key={field.name} fieldConfig={field} control={control} />
          ))}
        </Grid>
        {showReset && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="text"
              size="small"
              onClick={handleFormReset}
              sx={{ textTransform: 'none' }}
            >
              {resetText}
            </Button>
          </Box>
        )}
      </Box>
    </FormBuilderContext.Provider>
  );
};
