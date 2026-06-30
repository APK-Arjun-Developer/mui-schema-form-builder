import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';
import { Box, Button, Stack } from '@mui/material';
import { FormWizard } from '../components/form-builder/FormWizard';
import { FIELD_TYPE } from '../components/form-builder/types/field.types';
import type { FormWizardActionsParams } from '../components/form-builder/types/field.types';

const meta: Meta<typeof FormWizard> = {
  title: 'FormWizard',
  component: FormWizard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Multi-step form wizard with MUI Stepper. Each step validates independently before advancing. All steps share a single form state — the final Submit validates the entire schema.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormWizard>;

// ---------------------------------------------------------------------------
// Basic two-step wizard
// ---------------------------------------------------------------------------
export const TwoSteps: Story = {
  name: 'Two-step wizard',
  args: {
    schema: z.object({
      firstName: z.string().min(1, 'Required'),
      lastName: z.string().min(1, 'Required'),
      email: z.string().email('Invalid email'),
      message: z.string().min(10, 'At least 10 characters'),
    }),
    steps: [
      {
        label: 'Your Details',
        description: 'Name and email',
        fields: [
          {
            name: 'firstName',
            label: 'First Name',
            type: FIELD_TYPE.TEXT,
            required: true,
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'lastName',
            label: 'Last Name',
            type: FIELD_TYPE.TEXT,
            required: true,
            grid: { xs: 12, sm: 6 },
          },
          { name: 'email', label: 'Email', type: FIELD_TYPE.TEXT, required: true },
        ],
      },
      {
        label: 'Your Message',
        description: 'What can we help with?',
        fields: [
          {
            name: 'message',
            label: 'Message',
            type: FIELD_TYPE.TEXTAREA,
            required: true,
            rows: 5,
          },
        ],
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
    onCancel: () => alert('Cancelled'),
    submitText: 'Send Message',
  },
};

// ---------------------------------------------------------------------------
// Multi-step registration (uses PASSWORD field type)
// ---------------------------------------------------------------------------
export const RegistrationWizard: Story = {
  name: 'Registration (3 steps)',
  parameters: {
    docs: {
      description: {
        story:
          'Three-step registration flow. Step 1 uses the PASSWORD field type with a show/hide visibility toggle.',
      },
    },
  },
  args: {
    schema: z.object({
      username: z.string().min(3, 'At least 3 characters'),
      email: z.string().email(),
      password: z.string().min(8, 'At least 8 characters'),
      country: z.string().min(1, 'Required'),
      role: z.string().min(1, 'Pick a role'),
      bio: z.string().optional(),
      agree: z.boolean().refine((v) => v, 'Must accept'),
    }),
    steps: [
      {
        label: 'Account',
        fields: [
          { name: 'username', label: 'Username', type: FIELD_TYPE.TEXT, required: true },
          { name: 'email', label: 'Email', type: FIELD_TYPE.TEXT, required: true },
          {
            name: 'password',
            label: 'Password',
            type: FIELD_TYPE.PASSWORD,
            required: true,
          },
        ],
      },
      {
        label: 'Profile',
        fields: [
          {
            name: 'country',
            label: 'Country',
            type: FIELD_TYPE.SELECT,
            required: true,
            options: [
              { label: 'United States', value: 'us' },
              { label: 'Canada', value: 'ca' },
              { label: 'United Kingdom', value: 'uk' },
              { label: 'India', value: 'in' },
            ],
          },
          {
            name: 'role',
            label: 'Role',
            type: FIELD_TYPE.RADIO,
            required: true,
            options: [
              { label: 'Developer', value: 'dev' },
              { label: 'Designer', value: 'design' },
              { label: 'Manager', value: 'mgr' },
            ],
          },
          { name: 'bio', label: 'Short Bio', type: FIELD_TYPE.TEXTAREA, rows: 3 },
        ],
      },
      {
        label: 'Review',
        fields: [
          {
            name: 'agree',
            label: 'I agree to the terms and conditions',
            type: FIELD_TYPE.CHECKBOX,
            required: true,
          },
        ],
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
    submitText: 'Create Account',
  },
};

// ---------------------------------------------------------------------------
// Wizard with title
// ---------------------------------------------------------------------------
export const WithTitle: Story = {
  name: 'With title',
  parameters: {
    docs: {
      description: {
        story:
          'Use `title`, `titleAlign`, and `titlePosition` to add a heading. `titlePosition="above"` places it outside the Paper; `"inside"` (default) places it above the Stepper.',
      },
    },
  },
  args: {
    title: 'Complete Your Profile',
    titleAlign: 'center',
    titlePosition: 'inside',
    schema: z.object({
      name: z.string().min(1, 'Required'),
      bio: z.string().optional(),
    }),
    steps: [
      {
        label: 'Identity',
        fields: [{ name: 'name', label: 'Full Name', type: FIELD_TYPE.TEXT, required: true }],
      },
      {
        label: 'About',
        fields: [{ name: 'bio', label: 'Short Bio', type: FIELD_TYPE.TEXTAREA, rows: 3 }],
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};

// ---------------------------------------------------------------------------
// Wizard with custom action buttons (renderActions)
// ---------------------------------------------------------------------------
export const CustomActions: Story = {
  name: 'Custom action buttons (renderActions)',
  parameters: {
    docs: {
      description: {
        story:
          'The `renderActions` render-prop replaces the default Next / Back / Submit / Cancel buttons. It receives `{ isSubmitting, isFirstStep, isLastStep, activeStep, next, back, submit, cancel }` so you can build any layout.',
      },
    },
  },
  render: () => {
    const schema = z.object({
      name: z.string().min(1, 'Required'),
      email: z.string().email('Invalid email'),
    });
    const steps = [
      {
        label: 'Name',
        fields: [{ name: 'name', label: 'Full Name', type: FIELD_TYPE.TEXT, required: true }],
      },
      {
        label: 'Email',
        fields: [{ name: 'email', label: 'Email Address', type: FIELD_TYPE.TEXT, required: true }],
      },
    ];

    return (
      <FormWizard
        schema={schema}
        steps={steps}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
        renderActions={({
          isSubmitting,
          isFirstStep,
          isLastStep,
          next,
          back,
          submit,
        }: FormWizardActionsParams) => (
          <Stack direction="row" spacing={2} justifyContent="space-between" width="100%">
            <Button variant="outlined" onClick={back} disabled={isFirstStep || isSubmitting}>
              ← Back
            </Button>
            {isLastStep ? (
              <Button variant="contained" color="success" onClick={submit} disabled={isSubmitting}>
                Finish & Submit
              </Button>
            ) : (
              <Button variant="contained" onClick={next} disabled={isSubmitting}>
                Continue →
              </Button>
            )}
          </Stack>
        )}
      />
    );
  },
};

// ---------------------------------------------------------------------------
// Completed step navigation (back-navigation via Stepper)
// ---------------------------------------------------------------------------
export const CompletedStepNavigation: Story = {
  name: 'Completed step navigation',
  parameters: {
    docs: {
      description: {
        story:
          'After completing a step with Next, its label becomes clickable in the Stepper so the user can jump back to review or edit it. The active step is never shown as "completed" — only previously completed steps show the check icon.',
      },
    },
  },
  args: {
    schema: z.object({
      firstName: z.string().min(1, 'Required'),
      lastName: z.string().min(1, 'Required'),
      email: z.string().email('Invalid email'),
      role: z.string().min(1, 'Required'),
      agree: z.boolean().refine((v) => v, 'Must accept'),
    }),
    steps: [
      {
        label: 'Personal',
        description: 'Your name',
        fields: [
          {
            name: 'firstName',
            label: 'First Name',
            type: FIELD_TYPE.TEXT,
            required: true,
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'lastName',
            label: 'Last Name',
            type: FIELD_TYPE.TEXT,
            required: true,
            grid: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        label: 'Role',
        description: 'What you do',
        fields: [
          {
            name: 'email',
            label: 'Email',
            type: FIELD_TYPE.TEXT,
            required: true,
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'role',
            label: 'Role',
            type: FIELD_TYPE.SELECT,
            required: true,
            grid: { xs: 12, sm: 6 },
            options: [
              { label: 'Developer', value: 'dev' },
              { label: 'Designer', value: 'design' },
              { label: 'Manager', value: 'mgr' },
            ],
          },
        ],
      },
      {
        label: 'Confirm',
        description: 'Accept terms',
        fields: [
          {
            name: 'agree',
            label: 'I accept the terms and conditions',
            type: FIELD_TYPE.CHECKBOX,
            required: true,
          },
        ],
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
    submitText: 'Finish',
  },
};

// ---------------------------------------------------------------------------
// Submit error navigation
// ---------------------------------------------------------------------------
export const SubmitErrorNavigation: Story = {
  name: 'Submit error navigation',
  parameters: {
    docs: {
      description: {
        story:
          'When the final Submit fails (e.g. a cross-field refine), the wizard automatically navigates to the step containing the first error so the user can see and fix it.',
      },
    },
  },
  render: () => {
    const schema = z
      .object({
        password: z.string().min(6, 'At least 6 characters'),
        confirm: z.string().min(1, 'Required'),
      })
      .refine((d) => d.password === d.confirm, {
        message: 'Passwords must match',
        path: ['password'],
      });

    return (
      <Box>
        <FormWizard
          schema={schema}
          steps={[
            {
              label: 'Password',
              description: 'Set your password',
              fields: [
                {
                  name: 'password',
                  label: 'New Password',
                  type: FIELD_TYPE.PASSWORD,
                  required: true,
                },
              ],
            },
            {
              label: 'Confirm',
              description: 'Re-enter to confirm',
              fields: [
                {
                  name: 'confirm',
                  label: 'Confirm Password',
                  type: FIELD_TYPE.PASSWORD,
                  required: true,
                },
              ],
            },
          ]}
          onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
          submitText="Set Password"
        />
      </Box>
    );
  },
};

// ---------------------------------------------------------------------------
// Wizard with i18n labels
// ---------------------------------------------------------------------------
export const I18nWizard: Story = {
  name: 'i18n labels (Spanish)',
  args: {
    schema: z.object({
      nombre: z.string().min(1, 'Requerido'),
      correo: z.string().email('Correo inválido'),
    }),
    steps: [
      {
        label: 'Identidad',
        fields: [
          { name: 'nombre', label: 'Nombre completo', type: FIELD_TYPE.TEXT, required: true },
        ],
      },
      {
        label: 'Contacto',
        fields: [
          { name: 'correo', label: 'Correo electrónico', type: FIELD_TYPE.TEXT, required: true },
        ],
      },
    ],
    nextText: 'Siguiente',
    backText: 'Atrás',
    submitText: 'Enviar',
    cancelText: 'Cancelar',
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
    onCancel: () => alert('Cancelado'),
  },
};
