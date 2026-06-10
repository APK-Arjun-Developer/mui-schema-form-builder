import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { z } from 'zod';
import { renderWithTheme } from './helpers';
import { FormBuilder } from '../components/form-builder/FormBuilder';
import { FormWizard } from '../components/form-builder/FormWizard';
import { FIELD_TYPE, type FieldConfig } from '../components/form-builder/types/field.types';

const schema = z.object({
  name: z.string(),
  country: z.string(),
  role: z.string(),
  agree: z.boolean(),
  interests: z.array(z.string()),
});

const fields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, defaultValue: 'Alice' },
  {
    name: 'country',
    label: 'Country',
    type: FIELD_TYPE.SELECT,
    defaultValue: 'ca',
    options: [
      { label: 'US', value: 'us' },
      { label: 'Canada', value: 'ca' },
    ],
  },
  {
    name: 'role',
    label: 'Role',
    type: FIELD_TYPE.RADIO,
    defaultValue: 'admin',
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ],
  },
  { name: 'agree', label: 'Agree', type: FIELD_TYPE.CHECKBOX, defaultValue: true },
  {
    name: 'interests',
    label: 'Interests',
    type: FIELD_TYPE.CHECKBOX,
    defaultValue: ['react'],
    options: [
      { label: 'React', value: 'react' },
      { label: 'Vue', value: 'vue' },
    ],
  },
];

describe('FormBuilder — readOnly mode', () => {
  it('renders no textbox inputs when readOnly=true', () => {
    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={vi.fn()} readOnly />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('displays text field value as plain text', () => {
    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={vi.fn()} readOnly />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('displays select value as resolved option label', () => {
    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={vi.fn()} readOnly />);
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  it('displays radio value as resolved option label', () => {
    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={vi.fn()} readOnly />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('displays boolean checkbox as Yes/No', () => {
    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={vi.fn()} readOnly />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('displays checkbox group selected values as chips', () => {
    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={vi.fn()} readOnly />);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('still renders the Submit button in readOnly mode', () => {
    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={vi.fn()} readOnly />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});

describe('FormBuilder — readOnly edge cases', () => {
  it('shows em-dash for empty text field', () => {
    renderWithTheme(
      <FormBuilder
        fields={[{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, defaultValue: '' }]}
        schema={z.object({ name: z.string() })}
        onSubmit={vi.fn()}
        readOnly
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('displays autocomplete single object value as label', () => {
    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'city',
            label: 'City',
            type: FIELD_TYPE.AUTOCOMPLETE,
            defaultValue: { label: 'New York', value: 'ny' },
          },
        ]}
        schema={z.object({ city: z.unknown().nullable() })}
        onSubmit={vi.fn()}
        readOnly
      />,
    );
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('displays autocomplete single string value', () => {
    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'city',
            label: 'City',
            type: FIELD_TYPE.AUTOCOMPLETE,
            defaultValue: 'Chicago',
          },
        ]}
        schema={z.object({ city: z.unknown().nullable() })}
        onSubmit={vi.fn()}
        readOnly
      />,
    );
    expect(screen.getByText('Chicago')).toBeInTheDocument();
  });

  it('displays autocomplete multiple values as chips', () => {
    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'tags',
            label: 'Tags',
            type: FIELD_TYPE.AUTOCOMPLETE,
            multiple: true,
            defaultValue: [
              { label: 'React', value: 'react' },
              { label: 'Vue', value: 'vue' },
            ],
          },
        ]}
        schema={z.object({ tags: z.array(z.unknown()) })}
        onSubmit={vi.fn()}
        readOnly
      />,
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
  });

  it('displays select multiple as chips', () => {
    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'roles',
            label: 'Roles',
            type: FIELD_TYPE.SELECT,
            multiple: true,
            defaultValue: ['admin', 'editor'],
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'Editor', value: 'editor' },
            ],
          },
        ]}
        schema={z.object({ roles: z.array(z.string()) })}
        onSubmit={vi.fn()}
        readOnly
      />,
    );
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('displays array field items in read-only mode', async () => {
    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'contacts',
            label: 'Contacts',
            type: FIELD_TYPE.ARRAY,
            defaultValue: [{ name: 'Bob' }],
            itemFields: [{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }],
          },
        ]}
        schema={z.object({ contacts: z.array(z.object({ name: z.string() })) })}
        onSubmit={vi.fn()}
        readOnly
      />,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows em-dash for empty array in read-only mode', () => {
    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'contacts',
            label: 'Contacts',
            type: FIELD_TYPE.ARRAY,
            defaultValue: [],
            itemFields: [{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }],
          },
        ]}
        schema={z.object({ contacts: z.array(z.object({ name: z.string() })) })}
        onSubmit={vi.fn()}
        readOnly
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('displays unknown field type value as string', () => {
    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'custom',
            label: 'Custom',
            type: 'custom-type',
            defaultValue: 'custom-value',
          },
        ]}
        schema={z.object({ custom: z.string() })}
        onSubmit={vi.fn()}
        readOnly
      />,
    );
    expect(screen.getByText('custom-value')).toBeInTheDocument();
  });

  it('shows checkbox group em-dash for empty selection', () => {
    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'interests',
            label: 'Interests',
            type: FIELD_TYPE.CHECKBOX,
            defaultValue: [],
            options: [{ label: 'React', value: 'react' }],
          },
        ]}
        schema={z.object({ interests: z.array(z.string()) })}
        onSubmit={vi.fn()}
        readOnly
      />,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('FormWizard — imperative ref', () => {
  it('exposes reset, submit, setError, getValues via ref', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ref = React.createRef<any>();
    renderWithTheme(
      <FormWizard
        ref={ref}
        steps={[
          {
            label: 'Step 1',
            fields: [{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }],
          },
        ]}
        schema={z.object({ name: z.string() })}
        onSubmit={vi.fn()}
      />,
    );
    expect(typeof ref.current?.reset).toBe('function');
    expect(typeof ref.current?.submit).toBe('function');
    expect(typeof ref.current?.setError).toBe('function');
    expect(typeof ref.current?.getValues).toBe('function');
  });
});

describe('FormBuilder — labels i18n', () => {
  it('uses custom arrayAddItem and arrayRemove labels from the labels prop', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'items',
            label: 'Items',
            type: FIELD_TYPE.ARRAY,
            itemFields: [{ name: 'val', label: 'Value', type: FIELD_TYPE.TEXT }],
          },
        ]}
        schema={z.object({ items: z.array(z.object({ val: z.string() })) })}
        onSubmit={vi.fn()}
        labels={{ arrayAddItem: 'Agregar', arrayRemove: 'Eliminar' }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
  });

  it('uses custom arrayItemLabel function', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'items',
            label: 'Items',
            type: FIELD_TYPE.ARRAY,
            itemFields: [{ name: 'val', label: 'Value', type: FIELD_TYPE.TEXT }],
          },
        ]}
        schema={z.object({ items: z.array(z.object({ val: z.string() })) })}
        onSubmit={vi.fn()}
        labels={{ arrayItemLabel: (i) => `Element ${i + 1}` }}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByText('Element 1')).toBeInTheDocument();
  });
});
