import React, { useEffect, useMemo, useState } from 'react';
import type { Control } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { Box, Button, Grid, Paper } from '@mui/material';
import type { FieldConfig, FormBuilderProps } from './types/field.types';
import { FormField } from './FormField';
import { useFormBuilder } from '../../hooks/useFormBuilder';

// ---------------------------------------------------------------------------
// FixedSizeListType — module-level type alias for the lazily-imported
// react-window FixedSizeList component. Defined at module scope (not inside
// the component function) to keep the type away from render cycles.
// ---------------------------------------------------------------------------
type FixedSizeListType = React.ComponentType<{
  height: number;
  itemCount: number;
  itemSize: number;
  width: string | number;
  itemData: VirtualRowData;
  children: React.ComponentType<{
    index: number;
    style: React.CSSProperties;
    data: VirtualRowData;
  }>;
}>;

// ---------------------------------------------------------------------------
// VirtualRow — defined OUTSIDE FormBuilder so its component identity is stable
// across parent re-renders. Defining it inside causes react-window to unmount
// and remount every row on every render, defeating virtualization entirely.
// ---------------------------------------------------------------------------
interface VirtualRowData {
  fields: FieldConfig[];
  control: Control;
}

const VirtualRow = React.memo(
  ({
    index,
    style,
    data,
  }: {
    index: number;
    style: React.CSSProperties;
    data: VirtualRowData;
  }) => (
    <div style={style}>
      <FormField fieldConfig={data.fields[index]} control={data.control} />
    </div>
  ),
);
VirtualRow.displayName = 'VirtualRow';

// ---------------------------------------------------------------------------
// FormBuilder
// ---------------------------------------------------------------------------
export const FormBuilder = <TSchema extends import('zod').ZodType>({
  fields,
  schema,
  onSubmit,
  onCancel,
  onReset,
  submitText = 'Submit',
  cancelText = 'Cancel',
  resetText = 'Reset',
  spacing = 2,
  virtualize = false,
  virtualizeHeight = 500,
  virtualizeItemSize = 80,
  validationMode,
}: FormBuilderProps<TSchema>) => {
  const { methods, handleFormReset } = useFormBuilder({
    fields,
    schema,
    onReset,
    validationMode,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  // ---------------------------------------------------------------------------
  // react-window lazy import — it is an optional peer dependency. The library
  // must load correctly even when react-window is not installed.
  // We only attempt the import when virtualize=true, preventing import failures
  // from blocking non-virtualizing consumers.
  // ---------------------------------------------------------------------------
  const [FixedSizeList, setFixedSizeList] = useState<FixedSizeListType | null>(null);

  useEffect(() => {
    if (!virtualize) return;
    import('react-window')
      .then((mod) => {
        setFixedSizeList(() => mod.FixedSizeList as unknown as FixedSizeListType);
      })
      .catch(() => {
        console.warn(
          '[mui-schema-form-builder] react-window is not installed. ' +
            'Install it as a peer dependency to enable the virtualize prop.',
        );
      });
  }, [virtualize]);

  // Stable data object for react-window — only recreates when fields or control changes.
  const rowData = useMemo<VirtualRowData>(() => ({ fields, control }), [fields, control]);

  return (
    // methods is typed as UseFormReturn<any> internally; the public onSubmit on
    // FormBuilderProps<TSchema> carries the correct typed signature for consumers.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <FormProvider {...(methods as any)}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
        <Paper elevation={0} sx={{ p: 0, bgcolor: 'transparent' }}>
          {virtualize && FixedSizeList ? (
            <FixedSizeList
              height={virtualizeHeight}
              itemCount={fields.length}
              itemSize={virtualizeItemSize}
              width="100%"
              itemData={rowData}
            >
              {VirtualRow}
            </FixedSizeList>
          ) : (
            <Grid container spacing={spacing}>
              {fields.map((field) => (
                <FormField key={field.name} fieldConfig={field} control={control} />
              ))}
            </Grid>
          )}

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {onCancel && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={onCancel}
                disabled={isSubmitting}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                {cancelText}
              </Button>
            )}

            {onReset && (
              <Button
                variant="text"
                color="secondary"
                onClick={handleFormReset}
                disabled={isSubmitting}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                {resetText}
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              sx={{
                px: 4,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {submitText}
            </Button>
          </Box>
        </Paper>
      </form>
    </FormProvider>
  );
};
