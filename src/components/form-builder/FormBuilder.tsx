import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material';
import type { FieldConfig, FormBuilderActionsParams, FormBuilderProps } from './types/field.types';
import type { FormBuilderHandle } from './types/builder.types';
import type { VirtualRowData, FixedSizeListType } from './types/component.types';
import { FormField } from './FormField';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { FormBuilderContext, DEFAULT_LABELS, type ResolvedLabels } from './FormBuilderContext';
import { formBuilderSx, getTitleSx, getSectionHeaderSx } from './FormBuilder.styles';

export type { FormBuilderHandle };

// ---------------------------------------------------------------------------
// VirtualRow — defined OUTSIDE FormBuilder so its component identity is stable
// across parent re-renders. Defining it inside causes react-window to unmount
// and remount every row on every render, defeating virtualization entirely.
// ---------------------------------------------------------------------------
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
    title,
    titleAlign = 'left',
    titlePosition = 'inside',
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

  const handleSubmitAction = useCallback(
    () => void methods.handleSubmit(onSubmit as never)(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [methods, onSubmit],
  );

  const titleNode = title ? (
    <Typography variant="h6" sx={getTitleSx(titleAlign, titlePosition === 'inside')}>
      {title}
    </Typography>
  ) : null;

  return (
    <FormBuilderContext.Provider value={ctxValue}>
      {titlePosition === 'above' && titleNode}
      {/* methods is typed as UseFormReturn<any> internally; the public onSubmit on
        FormBuilderProps<TSchema> carries the correct typed signature for consumers. */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <FormProvider {...(methods as any)}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
          <Paper
            elevation={0}
            sx={[formBuilderSx.paper, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
          >
            {titlePosition === 'inside' && titleNode}
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
                      <Box sx={getSectionHeaderSx(segIdx === 0)}>
                        <Typography
                          variant="subtitle1"
                          sx={formBuilderSx.sectionTitle}
                          gutterBottom
                        >
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

            <Box sx={formBuilderSx.actionsBox}>
              {renderActions ? (
                renderActions({
                  isSubmitting,
                  submit: handleSubmitAction,
                  cancel: onCancel,
                  reset: onReset ? handleFormReset : undefined,
                } satisfies FormBuilderActionsParams)
              ) : (
                <>
                  {onReset && (
                    <Button
                      variant="text"
                      color="secondary"
                      onClick={handleFormReset}
                      disabled={isSubmitting}
                      sx={formBuilderSx.resetButton}
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
                      sx={formBuilderSx.cancelButton}
                    >
                      {cancelText}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    loading={isSubmitting}
                    sx={formBuilderSx.submitButton}
                  >
                    {submitText}
                  </Button>
                </>
              )}
            </Box>
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
