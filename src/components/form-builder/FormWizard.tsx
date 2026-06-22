import React, { useImperativeHandle, useMemo, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import type { SxProps, TypographyProps } from '@mui/material';
import type { z } from 'zod';
import type { Resolver, ValidationMode } from 'react-hook-form';
import type {
  FieldConfig,
  FormBuilderActionsContext,
  FormBuilderLabels,
} from './types/field.types';
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
  title?: React.ReactNode;
  titleProps?: TypographyProps;
  nextText?: string;
  backText?: string;
  submitText?: string;
  cancelText?: string;
  spacing?: number;
  validationMode?: keyof ValidationMode;
  sx?: SxProps;
  readOnly?: boolean;
  labels?: FormBuilderLabels;
  renderActions?: (context: FormBuilderActionsContext) => React.ReactNode;
}

const FormWizardInner = <TSchema extends z.ZodType>(
  {
    steps,
    schema,
    resolver,
    onSubmit,
    onCancel,
    title,
    titleProps,
    nextText = 'Next',
    backText = 'Back',
    submitText = 'Submit',
    cancelText = 'Cancel',
    spacing = 2,
    validationMode,
    sx,
    readOnly = false,
    labels,
    renderActions,
  }: FormWizardProps<TSchema>,
  ref: React.Ref<FormBuilderHandle>,
) => {
  const [activeStep, setActiveStep] = useState(0);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valid = await trigger(stepFieldNames as any);
    if (valid) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

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

  return (
    <FormBuilderContext.Provider value={ctxValue}>
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

            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((step, idx) => (
                <Step key={idx}>
                  <StepLabel optional={step.description}>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={spacing}>
              {currentFields.map((field) => (
                <FormField key={field.name} fieldConfig={field} control={control} />
              ))}
            </Grid>

            {renderActions ? (
              renderActions({
                submit: () => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  void handleSubmit(onSubmit as any)();
                },
                reset: handleFormReset,
                cancel: onCancel,
                loading: isSubmitting,
                currentStep: activeStep,
                totalSteps: steps.length,
                previousStep: activeStep > 0 ? handleBack : undefined,
                nextStep: !isLastStep ? handleNext : undefined,
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
              </Box>
            )}
          </Paper>
        </form>
      </FormProvider>
    </FormBuilderContext.Provider>
  );
};

export const FormWizard = React.forwardRef(FormWizardInner) as <TSchema extends z.ZodType>(
  props: FormWizardProps<TSchema> & { ref?: React.Ref<FormBuilderHandle> },
) => React.ReactElement | null;
