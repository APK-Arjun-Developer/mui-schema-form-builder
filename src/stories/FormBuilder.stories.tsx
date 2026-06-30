import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';
import { Button, CircularProgress, Stack } from '@mui/material';
import { FormBuilder } from '../components/form-builder/FormBuilder';
import { FIELD_TYPE } from '../components/form-builder/types/field.types';
import type { FormBuilderActionsParams } from '../components/form-builder/types/field.types';

const meta: Meta<typeof FormBuilder> = {
  title: 'FormBuilder',
  component: FormBuilder,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Schema-driven form builder. Pass a Zod schema and a fields array — FormBuilder handles rendering, validation, and typed submission.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormBuilder>;

// ---------------------------------------------------------------------------
// All field types
// ---------------------------------------------------------------------------
export const AllFieldTypes: Story = {
  name: 'All field types',
  args: {
    schema: z.object({
      name: z.string().min(2, 'At least 2 characters'),
      bio: z.string().optional(),
      age: z.number().min(0).max(120),
      dob: z.string().optional(),
      country: z.string().min(1, 'Required'),
      city: z.unknown().nullable(),
      role: z.enum(['admin', 'user', 'guest']),
      subscribe: z.boolean(),
      interests: z.array(z.string()),
    }),
    fields: [
      { name: 'name', label: 'Full Name', type: FIELD_TYPE.TEXT, required: true },
      { name: 'bio', label: 'Bio', type: FIELD_TYPE.TEXTAREA, rows: 3 },
      { name: 'age', label: 'Age', type: FIELD_TYPE.NUMBER, min: 0, max: 120 },
      { name: 'dob', label: 'Date of Birth', type: FIELD_TYPE.DATE },
      {
        name: 'country',
        label: 'Country',
        type: FIELD_TYPE.SELECT,
        required: true,
        options: [
          { label: 'United States', value: 'us' },
          { label: 'Canada', value: 'ca' },
          { label: 'United Kingdom', value: 'uk' },
        ],
      },
      {
        name: 'city',
        label: 'City (Autocomplete)',
        type: FIELD_TYPE.AUTOCOMPLETE,
        options: [
          { label: 'New York', value: 'ny' },
          { label: 'Los Angeles', value: 'la' },
          { label: 'Chicago', value: 'chi' },
        ],
      },
      {
        name: 'role',
        label: 'Role',
        type: FIELD_TYPE.RADIO,
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
          { label: 'Guest', value: 'guest' },
        ],
      },
      { name: 'subscribe', label: 'Subscribe to newsletter', type: FIELD_TYPE.CHECKBOX },
      {
        name: 'interests',
        label: 'Interests',
        type: FIELD_TYPE.CHECKBOX,
        options: [
          { label: 'Technology', value: 'tech' },
          { label: 'Design', value: 'design' },
          { label: 'Marketing', value: 'marketing' },
        ],
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
    submitText: 'Save',
    onCancel: () => alert('Cancelled'),
    onReset: () => alert('Form reset'),
  },
};

// ---------------------------------------------------------------------------
// Password field
// ---------------------------------------------------------------------------
export const PasswordField: Story = {
  name: 'Password input',
  parameters: {
    docs: {
      description: {
        story:
          'Use `FIELD_TYPE.PASSWORD` for a text input with a built-in show/hide visibility toggle. No extra dependencies needed — the toggle icon is an inline SVG.',
      },
    },
  },
  args: {
    schema: z.object({
      password: z.string().min(8, 'At least 8 characters'),
      confirm: z.string().min(1, 'Required'),
    }),
    fields: [
      {
        name: 'password',
        label: 'New Password',
        type: FIELD_TYPE.PASSWORD,
        required: true,
      },
      {
        name: 'confirm',
        label: 'Confirm Password',
        type: FIELD_TYPE.PASSWORD,
        required: true,
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
    submitText: 'Set Password',
  },
};

// ---------------------------------------------------------------------------
// Input adornments (startAdornment / endAdornment)
// ---------------------------------------------------------------------------
export const InputAdornments: Story = {
  name: 'Input adornments',
  parameters: {
    docs: {
      description: {
        story:
          'Add prefix/suffix decorations to TEXT and NUMBER fields using `startAdornment` and `endAdornment` on FieldConfig. Pass any React node — text, icons, or interactive elements.',
      },
    },
  },
  args: {
    schema: z.object({
      price: z.number().min(0, 'Must be positive'),
      weight: z.number().min(0),
      url: z.string().url('Enter a valid URL').optional(),
      username: z.string().min(3, 'At least 3 characters'),
    }),
    fields: [
      {
        name: 'price',
        label: 'Price',
        type: FIELD_TYPE.NUMBER,
        startAdornment: '$',
        endAdornment: 'USD',
        min: 0,
        grid: { xs: 12, sm: 6 },
      },
      {
        name: 'weight',
        label: 'Weight',
        type: FIELD_TYPE.NUMBER,
        endAdornment: 'kg',
        min: 0,
        grid: { xs: 12, sm: 6 },
      },
      {
        name: 'url',
        label: 'Website',
        type: FIELD_TYPE.TEXT,
        startAdornment: 'https://',
        placeholder: 'example.com',
        grid: { xs: 12, sm: 6 },
      },
      {
        name: 'username',
        label: 'Username',
        type: FIELD_TYPE.TEXT,
        startAdornment: '@',
        grid: { xs: 12, sm: 6 },
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};

// ---------------------------------------------------------------------------
// Title — inside (default) and above
// ---------------------------------------------------------------------------
export const WithTitleInside: Story = {
  name: 'Form title (inside)',
  parameters: {
    docs: {
      description: {
        story:
          'Use the `title` prop to display a heading. `titlePosition="inside"` (default) places it inside the Paper container above the fields.',
      },
    },
  },
  args: {
    title: 'Edit Profile',
    titleAlign: 'left',
    titlePosition: 'inside',
    schema: z.object({
      name: z.string().min(1, 'Required'),
      email: z.string().email('Invalid email'),
    }),
    fields: [
      { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, required: true },
      { name: 'email', label: 'Email', type: FIELD_TYPE.TEXT, required: true },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};

export const WithTitleAbove: Story = {
  name: 'Form title (above)',
  parameters: {
    docs: {
      description: {
        story:
          '`titlePosition="above"` renders the heading outside the Paper so you can add your own container styling around it.',
      },
    },
  },
  args: {
    title: 'Create Account',
    titleAlign: 'center',
    titlePosition: 'above',
    schema: z.object({
      name: z.string().min(1, 'Required'),
      email: z.string().email('Invalid email'),
    }),
    fields: [
      { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, required: true },
      { name: 'email', label: 'Email', type: FIELD_TYPE.TEXT, required: true },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};

// ---------------------------------------------------------------------------
// Custom action buttons (renderActions)
// ---------------------------------------------------------------------------
export const CustomActions: Story = {
  name: 'Custom action buttons (renderActions)',
  parameters: {
    docs: {
      description: {
        story:
          'Supply a `renderActions` render-prop to replace the default Submit / Cancel / Reset buttons. It receives `{ isSubmitting, submit, cancel, reset }` for full control over layout and styling.',
      },
    },
  },
  render: () => {
    return (
      <FormBuilder
        schema={z.object({
          name: z.string().min(1, 'Required'),
          email: z.string().email('Invalid email'),
        })}
        fields={[
          { name: 'name', label: 'Full Name', type: FIELD_TYPE.TEXT, required: true },
          { name: 'email', label: 'Email Address', type: FIELD_TYPE.TEXT, required: true },
        ]}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
        onCancel={() => alert('Cancelled')}
        onReset={() => alert('Reset')}
        renderActions={({ isSubmitting, submit, cancel, reset }: FormBuilderActionsParams) => (
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            {reset && (
              <Button size="small" color="inherit" onClick={reset} disabled={isSubmitting}>
                Clear
              </Button>
            )}
            {cancel && (
              <Button size="small" variant="outlined" onClick={cancel} disabled={isSubmitting}>
                Discard
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={submit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={14} /> : undefined}
            >
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </Stack>
        )}
      />
    );
  },
};

// ---------------------------------------------------------------------------
// Section grouping
// ---------------------------------------------------------------------------
export const WithSections: Story = {
  name: 'Section grouping',
  args: {
    schema: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
    }),
    fields: [
      {
        name: 'firstName',
        label: 'First Name',
        type: FIELD_TYPE.TEXT,
        section: 'Personal Info',
        grid: { xs: 12, sm: 6 },
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: FIELD_TYPE.TEXT,
        section: 'Personal Info',
        grid: { xs: 12, sm: 6 },
      },
      {
        name: 'email',
        label: 'Email',
        type: FIELD_TYPE.TEXT,
        section: 'Contact',
        grid: { xs: 12, sm: 6 },
      },
      {
        name: 'phone',
        label: 'Phone',
        type: FIELD_TYPE.TEXT,
        section: 'Contact',
        grid: { xs: 12, sm: 6 },
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};

// ---------------------------------------------------------------------------
// Array field
// ---------------------------------------------------------------------------
export const ArrayField: Story = {
  name: 'Array field (dynamic list)',
  args: {
    schema: z.object({
      contacts: z.array(
        z.object({
          name: z.string().min(1, 'Required'),
          email: z.string().email('Invalid email'),
          phone: z.string().optional(),
        }),
      ),
    }),
    fields: [
      {
        name: 'contacts',
        label: 'Contacts',
        type: FIELD_TYPE.ARRAY,
        itemFields: [
          {
            name: 'name',
            label: 'Name',
            type: FIELD_TYPE.TEXT,
            required: true,
            grid: { xs: 12, sm: 4 },
          },
          {
            name: 'email',
            label: 'Email',
            type: FIELD_TYPE.TEXT,
            required: true,
            grid: { xs: 12, sm: 4 },
          },
          { name: 'phone', label: 'Phone', type: FIELD_TYPE.TEXT, grid: { xs: 12, sm: 4 } },
        ],
        addLabel: '+ Add contact',
        maxItems: 5,
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};

// ---------------------------------------------------------------------------
// Read-only mode (pre-filled data)
// ---------------------------------------------------------------------------
export const ReadOnlyMode: Story = {
  name: 'Read-only display mode',
  parameters: {
    docs: {
      description: {
        story:
          'Pass `readOnly` to render field values as formatted text. Useful for review/confirmation screens that reuse the same field config.',
      },
    },
  },
  args: {
    readOnly: true,
    schema: z.object({
      name: z.string(),
      country: z.string(),
      role: z.string(),
      interests: z.array(z.string()),
      bio: z.string(),
    }),
    fields: [
      { name: 'name', label: 'Full Name', type: FIELD_TYPE.TEXT, defaultValue: 'Alice Johnson' },
      {
        name: 'country',
        label: 'Country',
        type: FIELD_TYPE.SELECT,
        defaultValue: 'ca',
        options: [
          { label: 'United States', value: 'us' },
          { label: 'Canada', value: 'ca' },
          { label: 'United Kingdom', value: 'uk' },
        ],
      },
      {
        name: 'role',
        label: 'Role',
        type: FIELD_TYPE.RADIO,
        defaultValue: 'designer',
        options: [
          { label: 'Developer', value: 'developer' },
          { label: 'Designer', value: 'designer' },
          { label: 'Manager', value: 'manager' },
        ],
      },
      {
        name: 'interests',
        label: 'Interests',
        type: FIELD_TYPE.CHECKBOX,
        defaultValue: ['tech', 'design'],
        options: [
          { label: 'Technology', value: 'tech' },
          { label: 'Design', value: 'design' },
          { label: 'Marketing', value: 'marketing' },
        ],
      },
      {
        name: 'bio',
        label: 'Bio',
        type: FIELD_TYPE.TEXTAREA,
        defaultValue: 'Passionate designer with 5 years of experience in product design.',
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};

// ---------------------------------------------------------------------------
// i18n labels
// ---------------------------------------------------------------------------
export const I18nLabels: Story = {
  name: 'i18n labels override',
  parameters: {
    docs: {
      description: {
        story:
          'Override the built-in array field button labels via the `labels` prop. Field-level `addLabel`/`removeLabel` on FieldConfig take precedence.',
      },
    },
  },
  args: {
    schema: z.object({
      miembros: z.array(z.object({ nombre: z.string().min(1), rol: z.string().min(1) })),
    }),
    fields: [
      {
        name: 'miembros',
        label: 'Miembros del equipo',
        type: FIELD_TYPE.ARRAY,
        itemFields: [
          { name: 'nombre', label: 'Nombre', type: FIELD_TYPE.TEXT, grid: { xs: 12, sm: 6 } },
          { name: 'rol', label: 'Rol', type: FIELD_TYPE.TEXT, grid: { xs: 12, sm: 6 } },
        ],
        maxItems: 4,
      },
    ],
    labels: {
      arrayAddItem: 'Agregar miembro',
      arrayRemove: 'Eliminar',
      arrayItemLabel: (i) => `Miembro ${i + 1}`,
    },
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};

// ---------------------------------------------------------------------------
// Conditional visibility
// ---------------------------------------------------------------------------
export const ConditionalFields: Story = {
  name: 'Conditional visibility (visibleIf)',
  args: {
    schema: z.object({
      hasPromo: z.boolean(),
      promoCode: z.string().optional(),
    }),
    fields: [
      { name: 'hasPromo', label: 'I have a promo code', type: FIELD_TYPE.CHECKBOX },
      {
        name: 'promoCode',
        label: 'Promo Code',
        type: FIELD_TYPE.TEXT,
        placeholder: 'Enter code…',
        visibleIf: (values) => !!values.hasPromo,
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};

// ---------------------------------------------------------------------------
// Nested objects (dot-notation)
// ---------------------------------------------------------------------------
export const NestedObject: Story = {
  name: 'Nested object (dot-notation)',
  args: {
    schema: z.object({
      address: z.object({
        street: z.string().min(1, 'Required'),
        city: z.string().min(1, 'Required'),
        zip: z.string().min(4, 'Required'),
      }),
    }),
    fields: [
      { name: 'address.street', label: 'Street', type: FIELD_TYPE.TEXT, section: 'Address' },
      {
        name: 'address.city',
        label: 'City',
        type: FIELD_TYPE.TEXT,
        section: 'Address',
        grid: { xs: 12, sm: 8 },
      },
      {
        name: 'address.zip',
        label: 'ZIP',
        type: FIELD_TYPE.TEXT,
        section: 'Address',
        grid: { xs: 12, sm: 4 },
      },
    ],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};

// ---------------------------------------------------------------------------
// Imperative ref
// ---------------------------------------------------------------------------
export const ImperativeRef: Story = {
  name: 'Imperative ref (FormBuilderHandle)',
  parameters: {
    docs: {
      description: {
        story:
          'Attach a ref to access `reset`, `submit`, `setError`, and `getValues` programmatically. Open the Actions panel to see submit callbacks.',
      },
    },
  },
  args: {
    schema: z.object({ email: z.string().email('Invalid email') }),
    fields: [{ name: 'email', label: 'Email', type: FIELD_TYPE.TEXT, required: true }],
    onSubmit: (data) => alert(JSON.stringify(data, null, 2)),
  },
};
