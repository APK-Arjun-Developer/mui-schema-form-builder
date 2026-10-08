import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { FormProvider, type SubmitHandler, type FieldValues } from 'react-hook-form';
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

// Group consecutive fields that share the same section label into segments.
// Fields without a section are collected under `undefined`.
function groupBySection(
  fields: FieldConfig[],
): { section: string | undefined; fields: FieldConfig[] }[] {
  const segments: { section: string | undefined; fields: FieldConfig[] }[] = [];
  for (const field of fields) {
    const last = segments.at(-1);
    if (last && last.section === field.section) {
      last.fields.push(field);
    } else {
      segments.push({ section: field.section, fields: [field] });
    }
  }
  return segments;
}

// forwardRef on a generic component requires a small cast workaround — the inner
// function preserves the full generic signature while forwardRef erases it.
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
    components,
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

  // zodResolver validates data against TSchema before calling onSubmit, so the
  // runtime type is z.infer<TSchema>. This adapter bridges the RHF FieldValues
  // boundary without using `as never`.
  const typedOnSubmit: SubmitHandler<FieldValues> = useCallback(
    (data) => onSubmit(data as import('zod').infer<TSchema>),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSubmit],
  );

  useImperativeHandle(ref, () => ({
    reset: handleFormReset,
    submit: () => void methods.handleSubmit(typedOnSubmit)(),
    setError: (name, error) => methods.setError(name, error),
    getValues: () => methods.getValues(),
  }));

  const {
    handleSubmit,
    control,
    unregister,
    formState: { isSubmitting },
  } = methods;

  // ---------------------------------------------------------------------------
  // react-window lazy import — it is an optional peer dependency.
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
    () => ({
      readOnly,
      labels: resolvedLabels,
      components: components ?? {},
      unregister,
    }),
    [readOnly, resolvedLabels, components, unregister],
  );

  const handleSubmitAction = useCallback(
    () => void methods.handleSubmit(typedOnSubmit)(),
    [methods, typedOnSubmit],
  );

  let sxList;
  if (Array.isArray(sx)) {
    sxList = sx;
  } else {
    sxList = sx ? [sx] : [];
  }

  const titleNode = title ? (
    <Typography variant="h6" sx={getTitleSx(titleAlign, titlePosition === 'inside')}>
      {title}
    </Typography>
  ) : null;

  return (
    <FormBuilderContext.Provider value={ctxValue}>
      {titlePosition === 'above' && titleNode}
      {/* FormProvider expects UseFormReturn<FieldValues>; methods is exactly that type internally. */}
      <FormProvider
        {...(methods as unknown as import('react-hook-form').UseFormReturn<FieldValues>)}
      >
        <form onSubmit={handleSubmit(typedOnSubmit)} noValidate>
          <Paper elevation={0} sx={[formBuilderSx.paper, ...sxList]}>
            {titlePosition === 'inside' && titleNode}
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
              <>
                {fieldSegments.map((segment, segIdx) => (
                  <Box key={segment.section ?? segment.fields[0]?.name ?? ''}>
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

export const FormBuilder = React.forwardRef(FormBuilderInner) as <
  TSchema extends import('zod').ZodType,
>(
  props: FormBuilderProps<TSchema> & { ref?: React.Ref<FormBuilderHandle> },
) => React.ReactElement | null;
