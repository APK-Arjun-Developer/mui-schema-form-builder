import React, { useImperativeHandle, useMemo, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import type { SxProps } from '@mui/material';
import type { z } from 'zod';
import type { Resolver, ValidationMode } from 'react-hook-form';
import type { FieldConfig, FormBuilderLabels, FormWizardActionsParams } from './types/field.types';
import { FormField } from './FormField';
import { FormBuilderContext, DEFAULT_LABELS, type ResolvedLabels } from './FormBuilderContext';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import type { FormBuilderHandle } from './FormBuilder';

/** A single step in the wizard. */
export interface WizardStep {
  /** Label shown in the Stepper. */
  label: string;
  /** Optional sub-label shown beneath the step label. */
  description?: string;
  /** Fields rendered for this step. */
  fields: FieldConfig[];
}

export interface FormWizardProps<TSchema extends z.ZodType = z.ZodType> {
  steps: WizardStep[];
  /** Zod schema covering all steps. Required unless `resolver` is provided. */
  schema?: TSchema;
  resolver?: Resolver;
  onSubmit: (data: z.infer<TSchema>) => void | Promise<void>;
  onCancel?: () => void;
  nextText?: string;
  backText?: string;
  submitText?: string;
  cancelText?: string;
  spacing?: number;
  validationMode?: keyof ValidationMode;
  sx?: SxProps;
  readOnly?: boolean;
  labels?: FormBuilderLabels;
  /** Optional heading displayed for the wizard. */
  title?: string;
  /** Horizontal alignment of the title. Defaults to 'left'. */
  titleAlign?: 'left' | 'center' | 'right';
  /**
   * Where the title is placed.
   * - 'inside' (default): title renders inside the Paper, above the Stepper.
   * - 'above': title renders above the Paper container.
   */
  titlePosition?: 'above' | 'inside';
  /**
   * Replace the default Next / Back / Submit / Cancel buttons with your own rendering.
   * When provided, the built-in action buttons are not rendered.
   */
  renderActions?: (params: FormWizardActionsParams) => React.ReactNode;
}

const FormWizardInner = <TSchema extends z.ZodType>(
  {
    steps,
    schema,
    resolver,
    onSubmit,
    onCancel,
    nextText = 'Next',
    backText = 'Back',
    submitText = 'Submit',
    cancelText = 'Cancel',
    spacing = 2,
    validationMode,
    sx,
    readOnly = false,
    labels,
    title,
    titleAlign = 'left',
    titlePosition = 'inside',
    renderActions,
  }: FormWizardProps<TSchema>,
  ref: React.Ref<FormBuilderHandle>,
) => {
  const [activeStep, setActiveStep] = useState(0);
  // completedSteps tracks which step indices have passed per-step validation
  // (i.e. the user has clicked Next on them). Only completed steps can be
  // navigated to directly by clicking their label in the Stepper.
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const isLastStep = activeStep === steps.length - 1;

  // Flatten all fields to register them up-front — RHF needs all fields
  // registered from the start for consistent validation state.
  const allFields = useMemo(() => steps.flatMap((s) => s.fields), [steps]);

  const { methods, handleFormReset } = useFormBuilder({
    fields: allFields,
    schema,
    resolver,
    validationMode,
  });

  const {
    handleSubmit,
    trigger,
    clearErrors,
    control,
    formState: { isSubmitting },
  } = methods;

  useImperativeHandle(ref, () => ({
    reset: handleFormReset,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    submit: () => void methods.handleSubmit(onSubmit as any)(),
    setError: (name, error) => methods.setError(name, error),
    getValues: () => methods.getValues(),
  }));

  const handleNext = async () => {
    const stepFieldNames = steps[activeStep].fields.map((f) => f.name);
    // Only validate the current step's fields — other steps' errors must not block navigation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valid = await trigger(stepFieldNames as any);
    if (valid) {
      setCompletedSteps((prev) => new Set(prev).add(activeStep));
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    // Clear errors when navigating back so the previous step starts clean.
    clearErrors();
    setActiveStep((prev) => prev - 1);
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow jumping to any previously completed step or to any step that has
    // already been visited (index < activeStep). Forward jumps are blocked to
    // prevent skipping required validation.
    if (stepIndex < activeStep || completedSteps.has(stepIndex)) {
      clearErrors();
      setActiveStep(stepIndex);
    }
  };

  const handleSubmitError = (errors: Record<string, unknown>) => {
    // Navigate to the first step that contains a field with an error so the
    // user can see and fix the problem instead of staring at a blank step.
    // Supports dot-notation field names (e.g. "address.city") by traversing
    // the nested errors object rather than checking a flat key.
    const hasNestedError = (path: string): boolean => {
      const parts = path.split('.');
      let node: unknown = errors;
      for (const part of parts) {
        if (node == null || typeof node !== 'object') return false;
        node = (node as Record<string, unknown>)[part];
      }
      return node != null;
    };
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].fields.some((f) => hasNestedError(f.name))) {
        setActiveStep(i);
        break;
      }
    }
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

  const currentFields = steps[activeStep]?.fields ?? [];

  const titleNode = title ? (
    <Typography
      variant="h6"
      sx={{ fontWeight: 700, textAlign: titleAlign, mb: titlePosition === 'inside' ? 2 : 1 }}
    >
      {title}
    </Typography>
  ) : null;

  return (
    <FormBuilderContext.Provider value={ctxValue}>
      {titlePosition === 'above' && titleNode}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <FormProvider {...(methods as any)}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any, handleSubmitError as any)} noValidate>
          <Paper
            elevation={0}
            sx={[
              { p: 0, bgcolor: 'transparent', boxShadow: 'none' },
              ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
          >
            {titlePosition === 'inside' && titleNode}
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((step, idx) => {
                const isClickable = idx < activeStep || completedSteps.has(idx);
                return (
                  <Step key={idx} completed={completedSteps.has(idx) && idx !== activeStep}>
                    {isClickable ? (
                      <StepButton onClick={() => handleStepClick(idx)} optional={step.description}>
                        {step.label}
                      </StepButton>
                    ) : (
                      <StepLabel optional={step.description}>{step.label}</StepLabel>
                    )}
                  </Step>
                );
              })}
            </Stepper>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={spacing}>
              {currentFields.map((field) => (
                <FormField key={field.name} fieldConfig={field} control={control} />
              ))}
            </Grid>

            <Box
              sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}
            >
              {renderActions ? (
                renderActions({
                  isSubmitting,
                  isFirstStep: activeStep === 0,
                  isLastStep,
                  activeStep,
                  next: handleNext,
                  back: handleBack,
                  submit: () => void methods.handleSubmit(onSubmit as never)(),
                  cancel: onCancel,
                } satisfies FormWizardActionsParams)
              ) : (
                <>
                  {onCancel && activeStep === 0 && (
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
                  {activeStep > 0 && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      sx={{ textTransform: 'none', fontWeight: 500 }}
                    >
                      {backText}
                    </Button>
                  )}
                  {isLastStep ? (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      loading={isSubmitting}
                      sx={{ px: 4, py: 1, fontWeight: 600 }}
                    >
                      {submitText}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      sx={{ px: 4, py: 1, fontWeight: 600, textTransform: 'none' }}
                    >
                      {nextText}
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </form>
      </FormProvider>
    </FormBuilderContext.Provider>
  );
};

export const FormWizard = React.forwardRef(FormWizardInner) as <TSchema extends z.ZodType>(
  props: FormWizardProps<TSchema> & { ref?: React.Ref<FormBuilderHandle> },
) => React.ReactElement | null;
