import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';
import { FormWizard } from '../components/form-builder/FormWizard';
import { FIELD_TYPE } from '../components/form-builder/types/field.types';

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
// Multi-step registration
// ---------------------------------------------------------------------------
export const RegistrationWizard: Story = {
  name: 'Registration (3 steps)',
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
          { name: 'password', label: 'Password', type: FIELD_TYPE.TEXT, required: true },
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
