import React from 'react';
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
