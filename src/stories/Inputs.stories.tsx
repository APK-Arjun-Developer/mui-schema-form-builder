import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';
import { FormBuilder } from '../components/form-builder/FormBuilder';
import { FIELD_TYPE } from '../components/form-builder/types/field.types';

// A thin wrapper that renders a single-field FormBuilder for each input story.
function SingleFieldForm({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fieldConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema,
}: {
  fieldConfig: Parameters<typeof FormBuilder>[0]['fields'][0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
}) {
  return (
    <FormBuilder
      fields={[fieldConfig]}
      schema={schema}
      onSubmit={(d) => alert(JSON.stringify(d, null, 2))}
    />
  );
}

// ---------------------------------------------------------------------------
// TextInput
// ---------------------------------------------------------------------------
const textMeta: Meta = {
  title: 'Input Components',
  tags: ['autodocs'],
};
export default textMeta;

export const Text: StoryObj = {
  render: () => (
    <SingleFieldForm
      fieldConfig={{ name: 'username', label: 'Username', type: FIELD_TYPE.TEXT, required: true }}
      schema={z.object({ username: z.string().min(3, 'At least 3 characters') })}
    />
  ),
};

export const Textarea: StoryObj = {
  render: () => (
    <SingleFieldForm
      fieldConfig={{ name: 'bio', label: 'Bio', type: FIELD_TYPE.TEXTAREA, rows: 5 }}
      schema={z.object({ bio: z.string().optional() })}
    />
  ),
};

export const NumberField: StoryObj = {
  name: 'Number',
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'age',
        label: 'Age',
        type: FIELD_TYPE.NUMBER,
        min: 0,
        max: 120,
        step: 1,
      }}
      schema={z.object({ age: z.number().min(0).max(120) })}
    />
  ),
};

export const Password: StoryObj = {
  name: 'Password',
  parameters: {
    docs: {
      description: {
        story:
          'A text input that hides the value by default. Click the eye icon to toggle visibility. The toggle icon is an inline SVG — no icon library needed.',
      },
    },
  },
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'password',
        label: 'Password',
        type: FIELD_TYPE.PASSWORD,
        required: true,
      }}
      schema={z.object({ password: z.string().min(8, 'At least 8 characters') })}
    />
  ),
};

export const TextWithStartAdornment: StoryObj = {
  name: 'Text — start adornment',
  parameters: {
    docs: {
      description: {
        story: 'Use `startAdornment` on a TEXT field to render a prefix inside the input.',
      },
    },
  },
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'username',
        label: 'Username',
        type: FIELD_TYPE.TEXT,
        startAdornment: '@',
        required: true,
      }}
      schema={z.object({ username: z.string().min(3, 'At least 3 characters') })}
    />
  ),
};

export const TextWithEndAdornment: StoryObj = {
  name: 'Text — end adornment',
  parameters: {
    docs: {
      description: {
        story: 'Use `endAdornment` on a TEXT field to render a suffix inside the input.',
      },
    },
  },
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'domain',
        label: 'Subdomain',
        type: FIELD_TYPE.TEXT,
        endAdornment: '.example.com',
        placeholder: 'myapp',
        required: true,
      }}
      schema={z.object({ domain: z.string().min(1, 'Required') })}
    />
  ),
};

export const NumberWithAdornments: StoryObj = {
  name: 'Number — start + end adornments',
  parameters: {
    docs: {
      description: {
        story:
          'NUMBER fields also support `startAdornment` and `endAdornment` for currency symbols, units, etc.',
      },
    },
  },
  render: () => (
    <FormBuilder
      fields={[
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
      ]}
      schema={z.object({
        price: z.number().min(0, 'Must be non-negative'),
        weight: z.number().min(0, 'Must be non-negative'),
      })}
      onSubmit={(d) => alert(JSON.stringify(d, null, 2))}
    />
  ),
};

export const SelectSingle: StoryObj = {
  name: 'Select (single)',
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'country',
        label: 'Country',
        type: FIELD_TYPE.SELECT,
        options: [
          { label: 'United States', value: 'us' },
          { label: 'Canada', value: 'ca' },
          { label: 'United Kingdom', value: 'uk' },
        ],
      }}
      schema={z.object({ country: z.string().min(1) })}
    />
  ),
};

export const SelectMultiple: StoryObj = {
  name: 'Select (multiple)',
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'roles',
        label: 'Roles',
        type: FIELD_TYPE.SELECT,
        multiple: true,
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Editor', value: 'editor' },
          { label: 'Viewer', value: 'viewer' },
        ],
      }}
      schema={z.object({ roles: z.array(z.string()) })}
    />
  ),
};

export const AutocompleteStatic: StoryObj = {
  name: 'Autocomplete (static options)',
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'city',
        label: 'City',
        type: FIELD_TYPE.AUTOCOMPLETE,
        options: [
          { label: 'New York', value: 'ny' },
          { label: 'Los Angeles', value: 'la' },
          { label: 'Chicago', value: 'chi' },
          { label: 'Houston', value: 'hou' },
        ],
        placeholder: 'Search cities…',
      }}
      schema={z.object({ city: z.unknown().nullable() })}
    />
  ),
};

export const RadioGroup: StoryObj = {
  name: 'Radio group',
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'plan',
        label: 'Plan',
        type: FIELD_TYPE.RADIO,
        options: [
          { label: 'Free', value: 'free' },
          { label: 'Pro', value: 'pro' },
          { label: 'Enterprise', value: 'enterprise' },
        ],
      }}
      schema={z.object({ plan: z.string().min(1) })}
    />
  ),
};

export const CheckboxBoolean: StoryObj = {
  name: 'Checkbox (boolean)',
  render: () => (
    <SingleFieldForm
      fieldConfig={{ name: 'agree', label: 'I agree to the terms', type: FIELD_TYPE.CHECKBOX }}
      schema={z.object({ agree: z.boolean().refine((v) => v, 'Must agree') })}
    />
  ),
};

export const CheckboxGroup: StoryObj = {
  name: 'Checkbox (group)',
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'tags',
        label: 'Tags',
        type: FIELD_TYPE.CHECKBOX,
        options: [
          { label: 'Frontend', value: 'fe' },
          { label: 'Backend', value: 'be' },
          { label: 'DevOps', value: 'ops' },
        ],
      }}
      schema={z.object({ tags: z.array(z.string()) })}
    />
  ),
};

// ---------------------------------------------------------------------------
// ComboInput
// ---------------------------------------------------------------------------

export const ComboPhoneNumber: StoryObj = {
  name: 'ComboInput — phone number',
  parameters: {
    docs: {
      description: {
        story:
          'A country-code selector fused to a phone number input. The value shape is `{ select, input }` — one field in the schema holds both parts.',
      },
    },
  },
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'phone',
        label: 'Phone number',
        type: FIELD_TYPE.COMBO_INPUT,
        required: true,
        selectOptions: [
          { label: '+1', value: '+1' },
          { label: '+44', value: '+44' },
          { label: '+49', value: '+49' },
          { label: '+33', value: '+33' },
          { label: '+81', value: '+81' },
          { label: '+91', value: '+91' },
        ],
        selectPlaceholder: 'Code',
        selectWidth: 90,
        placeholder: '(555) 000-0000',
        inputType: 'text',
      }}
      schema={z.object({
        phone: z
          .object({
            select: z.string().min(1, 'Select a country code'),
            input: z.string().min(6, 'Enter a valid number'),
          })
          .refine((v) => v.select && v.input, 'Phone number is required'),
      })}
    />
  ),
};

export const ComboCurrency: StoryObj = {
  name: 'ComboInput — currency amount',
  parameters: {
    docs: {
      description: {
        story:
          'Currency selector at the start with a numeric amount input. `inputType: "number"` stores the input portion as a JS number.',
      },
    },
  },
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'price',
        label: 'Price',
        type: FIELD_TYPE.COMBO_INPUT,
        required: true,
        selectOptions: [
          { label: 'USD $', value: 'usd' },
          { label: 'EUR €', value: 'eur' },
          { label: 'GBP £', value: 'gbp' },
          { label: 'JPY ¥', value: 'jpy' },
        ],
        selectPlaceholder: 'Currency',
        selectWidth: 100,
        inputType: 'number',
        min: 0,
        placeholder: '0.00',
      }}
      schema={z.object({
        price: z.object({
          select: z.string().min(1, 'Select a currency'),
          input: z.union([z.number().min(0, 'Must be ≥ 0'), z.literal('')]),
        }),
      })}
    />
  ),
};

export const ComboSearchWithCategory: StoryObj = {
  name: 'ComboInput — search with category',
  parameters: {
    docs: {
      description: {
        story:
          'Selector at the end: the free-text search box comes first, the category dropdown is fused on the right. Use `selectPosition: "end"` to flip the order.',
      },
    },
  },
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'search',
        label: 'Search',
        type: FIELD_TYPE.COMBO_INPUT,
        selectPosition: 'end',
        selectOptions: [
          { label: 'All', value: '' },
          { label: 'Books', value: 'books' },
          { label: 'Electronics', value: 'electronics' },
          { label: 'Clothing', value: 'clothing' },
          { label: 'Home', value: 'home' },
        ],
        selectPlaceholder: 'Category',
        selectWidth: 130,
        inputType: 'search',
        placeholder: 'Search products…',
      }}
      schema={z.object({
        search: z.object({ select: z.string(), input: z.string() }),
      })}
    />
  ),
};

export const ComboMeasurement: StoryObj = {
  name: 'ComboInput — measurement with unit',
  parameters: {
    docs: {
      description: {
        story:
          'Number input with a unit selector on the right — ideal for weight, distance, or any measurable quantity.',
      },
    },
  },
  render: () => (
    <SingleFieldForm
      fieldConfig={{
        name: 'weight',
        label: 'Weight',
        type: FIELD_TYPE.COMBO_INPUT,
        required: true,
        selectPosition: 'end',
        selectOptions: [
          { label: 'kg', value: 'kg' },
          { label: 'lb', value: 'lb' },
          { label: 'g', value: 'g' },
          { label: 'oz', value: 'oz' },
        ],
        selectPlaceholder: 'Unit',
        selectWidth: 80,
        inputType: 'number',
        min: 0,
        placeholder: '0',
      }}
      schema={z.object({
        weight: z.object({
          select: z.string().min(1, 'Select a unit'),
          input: z.union([z.number().min(0), z.literal('')]),
        }),
      })}
    />
  ),
};

export const ComboInForm: StoryObj = {
  name: 'ComboInput — inside a full form',
  parameters: {
    docs: {
      description: {
        story:
          'ComboInput fields work alongside any other field type inside FormBuilder. Here a product listing form pairs a currency+price combo with a weight+unit combo.',
      },
    },
  },
  render: () => (
    <FormBuilder
      title="Add product"
      fields={[
        {
          name: 'name',
          label: 'Product name',
          type: FIELD_TYPE.TEXT,
          required: true,
          placeholder: 'e.g. Wireless Headphones',
          grid: { xs: 12 },
        },
        {
          name: 'price',
          label: 'Price',
          type: FIELD_TYPE.COMBO_INPUT,
          required: true,
          selectOptions: [
            { label: 'USD $', value: 'usd' },
            { label: 'EUR €', value: 'eur' },
            { label: 'GBP £', value: 'gbp' },
          ],
          selectPlaceholder: 'Currency',
          selectWidth: 100,
          inputType: 'number',
          min: 0,
          placeholder: '0.00',
          grid: { xs: 12, sm: 6 },
        },
        {
          name: 'weight',
          label: 'Weight',
          type: FIELD_TYPE.COMBO_INPUT,
          selectPosition: 'end',
          selectOptions: [
            { label: 'kg', value: 'kg' },
            { label: 'lb', value: 'lb' },
            { label: 'g', value: 'g' },
          ],
          selectPlaceholder: 'Unit',
          selectWidth: 80,
          inputType: 'number',
          min: 0,
          placeholder: '0',
          grid: { xs: 12, sm: 6 },
        },
        {
          name: 'sku',
          label: 'SKU',
          type: FIELD_TYPE.TEXT,
          placeholder: 'e.g. PRD-001',
          grid: { xs: 12 },
        },
      ]}
      schema={z.object({
        name: z.string().min(1, 'Product name is required'),
        price: z.object({
          select: z.string().min(1, 'Select a currency'),
          input: z.union([z.number().min(0), z.literal('')]),
        }),
        weight: z.object({
          select: z.string(),
          input: z.union([z.number().min(0), z.literal('')]),
        }),
        sku: z.string().optional(),
      })}
      onSubmit={(d) => alert(JSON.stringify(d, null, 2))}
    />
  ),
};
