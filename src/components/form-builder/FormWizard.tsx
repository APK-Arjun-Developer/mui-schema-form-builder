import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
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
import type { z } from 'zod';
import type { FieldConfig, FormWizardActionsParams } from './types/field.types';
import type { FormBuilderHandle, WizardStep, FormWizardProps } from './types/builder.types';
import { FormField } from './FormField';
import { FormBuilderContext, DEFAULT_LABELS, type ResolvedLabels } from './FormBuilderContext';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { formWizardSx } from './FormWizard.styles';
import { getTitleSx } from './FormBuilder.styles';

export type { WizardStep, FormWizardProps };

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
    components,
  }: FormWizardProps<TSchema>,
  ref: React.Ref<FormBuilderHandle>,
) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const isNextingRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const isLastStep = activeStep === steps.length - 1;

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
    unregister,
    formState: { isSubmitting },
  } = methods;

  useImperativeHandle(ref, () => ({
    reset: handleFormReset,
    submit: () => void methods.handleSubmit(onSubmit as never)(),
    setError: (name, error) => methods.setError(name, error),
    getValues: () => methods.getValues(),
  }));

  const handleNext = useCallback(async () => {
    if (isNextingRef.current) return;
    isNextingRef.current = true;
    setIsNavigating(true);
    try {
      const stepFieldNames = steps[activeStep].fields.map((f) => f.name);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RHF trigger accepts string[]
      const valid = await trigger(stepFieldNames as any);
      if (valid) {
        clearErrors();
        setCompletedSteps((prev) => new Set(prev).add(activeStep));
        setActiveStep((prev) => prev + 1);
      }
    } finally {
      isNextingRef.current = false;
      setIsNavigating(false);
    }
  }, [steps, activeStep, trigger, clearErrors]);

  const handleBack = useCallback(() => {
    clearErrors();
    setActiveStep((prev) => prev - 1);
  }, [clearErrors]);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      if (stepIndex < activeStep || completedSteps.has(stepIndex)) {
        clearErrors();
        setActiveStep(stepIndex);
      }
    },
    [activeStep, completedSteps, clearErrors],
  );

  const handleSubmitError = useCallback(
    (errors: Record<string, unknown>) => {
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
    },
    [steps],
  );

  const handleSubmitAction = useCallback(
    () => void methods.handleSubmit(onSubmit as never, handleSubmitError as never)(),
    [methods, onSubmit, handleSubmitError],
  );

  const handleFormSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (!isLastStep) {
        event.preventDefault();
        void handleNext();
        return;
      }
      void handleSubmit(onSubmit as never, handleSubmitError as never)(event);
    },
    [isLastStep, handleNext, handleSubmit, onSubmit, handleSubmitError],
  );

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

  const currentFields = steps[activeStep]?.fields ?? [];

  const titleNode = title ? (
    <Typography variant="h6" sx={getTitleSx(titleAlign, titlePosition === 'inside')}>
      {title}
    </Typography>
  ) : null;

  return (
    <FormBuilderContext.Provider value={ctxValue}>
      {titlePosition === 'above' && titleNode}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <FormProvider {...(methods as any)}>
        <form onSubmit={handleFormSubmit} noValidate>
          <Paper
            elevation={0}
            sx={[formWizardSx.paper, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
          >
            {titlePosition === 'inside' && titleNode}
            <Stepper activeStep={activeStep} sx={formWizardSx.stepper}>
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

            <Divider sx={formWizardSx.divider} />

            <Grid container spacing={spacing}>
              {currentFields.map((field: FieldConfig) => (
                <FormField key={field.name} fieldConfig={field} control={control} />
              ))}
            </Grid>

            <Box sx={formWizardSx.actionsBox}>
              {renderActions ? (
                renderActions({
                  isSubmitting,
                  isNavigating,
                  isFirstStep: activeStep === 0,
                  isLastStep,
                  activeStep,
                  next: handleNext,
                  back: handleBack,
                  submit: handleSubmitAction,
                  cancel: onCancel,
                } satisfies FormWizardActionsParams)
              ) : (
                <>
                  {onCancel && activeStep === 0 && (
                    <Button
                      type="button"
                      variant="outlined"
                      color="inherit"
                      onClick={onCancel}
                      disabled={isSubmitting || isNavigating}
                      sx={formWizardSx.cancelButton}
                    >
                      {cancelText}
                    </Button>
                  )}
                  {activeStep > 0 && (
                    <Button
                      type="button"
                      variant="outlined"
                      color="inherit"
                      onClick={handleBack}
                      disabled={isSubmitting || isNavigating}
                      sx={formWizardSx.backButton}
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
                      sx={formWizardSx.submitButton}
                    >
                      {submitText}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      disabled={isSubmitting || isNavigating}
                      loading={isNavigating}
                      sx={formWizardSx.nextButton}
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
