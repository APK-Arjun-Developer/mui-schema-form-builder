import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react';
import type { Control, FieldValues } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material';
import type { FieldConfig, FormBuilderProps } from './types/field.types';
import { FormField } from './FormField';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { FormBuilderContext, DEFAULT_LABELS, type ResolvedLabels } from './FormBuilderContext';

/** Imperative handle exposed via a ref on FormBuilder. */
export interface FormBuilderHandle {
  /** Reset the form to its default values. */
  reset: () => void;
  /** Programmatically submit the form, triggering validation and onSubmit. */
  submit: () => void;
  /** Manually set a field error. */
  setError: (name: string, error: { type: string; message: string }) => void;
  /** Return current form values without triggering validation. */
  getValues: () => FieldValues;
}

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
  ({ index, style, data }: { index: number; style: React.CSSProperties; data: VirtualRowData }) => (
    <div style={style}>
      <FormField fieldConfig={data.fields[index]} control={data.control} />
    </div>
  ),
);
VirtualRow.displayName = 'VirtualRow';

// ---------------------------------------------------------------------------
// FormBuilder
// ---------------------------------------------------------------------------
// forwardRef on a generic component requires a small cast workaround — the inner
// function preserves the full generic signature while forwardRef erases it.
// Group consecutive fields that share the same section label into segments.
// Fields without a section are collected under `undefined`.
function groupBySection(
  fields: FieldConfig[],
): { section: string | undefined; fields: FieldConfig[] }[] {
  const segments: { section: string | undefined; fields: FieldConfig[] }[] = [];
  for (const field of fields) {
    const last = segments[segments.length - 1];
    if (last && last.section === field.section) {
      last.fields.push(field);
    } else {
      segments.push({ section: field.section, fields: [field] });
    }
  }
  return segments;
}

const FormBuilderInner = <TSchema extends import('zod').ZodType>(
  {
    fields,
    schema,
    resolver,
    onSubmit,
    onCancel,
    onReset,
    onChange,
    onFieldChange,
    title,
    titleProps,
    submitText = 'Submit',
    cancelText = 'Cancel',
    resetText = 'Reset',
    spacing = 2,
    virtualize = false,
    virtualizeHeight = 500,
    virtualizeItemSize = 80,
    validationMode,
    sx,
    readOnly = false,
    labels,
    renderActions,
  }: FormBuilderProps<TSchema>,
  ref: React.Ref<FormBuilderHandle>,
) => {
  const { methods, handleFormReset } = useFormBuilder({
    fields,
    schema,
    resolver,
    onReset,
    validationMode,
    onChange,
    onFieldChange,
  });

  useImperativeHandle(ref, () => ({
    reset: handleFormReset,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submit: () => void methods.handleSubmit(onSubmit as any)(),
    setError: (name, error) => methods.setError(name, error),
    getValues: () => methods.getValues(),
  }));

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

  const fieldSegments = useMemo(() => groupBySection(fields), [fields]);

  const submit = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void handleSubmit(onSubmit as any)();
  };

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
      {/* methods is typed as UseFormReturn<any> internally; the public onSubmit on
        FormBuilderProps<TSchema> carries the correct typed signature for consumers. */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <FormProvider {...(methods as any)}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
          <Paper
            elevation={0}
            sx={[
              { p: 0, bgcolor: 'transparent', boxShadow: 'none' },
              ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
          >
            {title && (
              <Typography variant="h5" gutterBottom {...titleProps}>
                {title}
              </Typography>
            )}

            {virtualize && FixedSizeList ? (
              // Sections are not supported in virtual mode — all fields render flat.
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
              <>
                {fieldSegments.map((segment, segIdx) => (
                  <Box key={segIdx}>
                    {segment.section && (
                      <Box sx={{ mt: segIdx === 0 ? 0 : 3, mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
                          {segment.section}
                        </Typography>
                        <Divider />
                      </Box>
                    )}
                    <Grid container spacing={spacing}>
                      {segment.fields.map((field) => (
                        <FormField key={field.name} fieldConfig={field} control={control} />
                      ))}
                    </Grid>
                  </Box>
                ))}
              </>
            )}

            {renderActions ? (
              renderActions({
                submit,
                reset: handleFormReset,
                cancel: onCancel,
                loading: isSubmitting,
                currentStep: 0,
                totalSteps: 1,
              })
            ) : (
              <Box
                sx={{
                  mt: 4,
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap',
                }}
              >
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

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  loading={isSubmitting}
                  sx={{
                    px: 4,
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  {submitText}
                </Button>
              </Box>
            )}
          </Paper>
        </form>
      </FormProvider>
    </FormBuilderContext.Provider>
  );
};

// Cast preserves the generic type parameter through forwardRef.
export const FormBuilder = React.forwardRef(FormBuilderInner) as <
  TSchema extends import('zod').ZodType,
>(
  props: FormBuilderProps<TSchema> & { ref?: React.Ref<FormBuilderHandle> },
) => React.ReactElement | null;
