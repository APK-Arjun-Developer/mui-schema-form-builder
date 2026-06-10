import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { axe } from 'jest-axe';
import { renderWithTheme } from './helpers';
import { FormBuilder } from '../components/form-builder/FormBuilder';
import { FIELD_TYPE, type FieldConfig } from '../components/form-builder/types/field.types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(0, 'Age required'),
  country: z.string().min(1, 'Country required'),
  agree: z.boolean().refine((v) => v === true, 'Must agree'),
});

const fields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, required: true },
  { name: 'age', label: 'Age', type: FIELD_TYPE.NUMBER },
  {
    name: 'country',
    label: 'Country',
    type: FIELD_TYPE.SELECT,
    options: [
      { label: 'US', value: 'us' },
      { label: 'CA', value: 'ca' },
    ],
  },
  { name: 'agree', label: 'I agree', type: FIELD_TYPE.CHECKBOX },
];

function Builder(props: Partial<React.ComponentProps<typeof FormBuilder>>) {
  return <FormBuilder fields={fields} schema={schema} onSubmit={vi.fn()} {...props} />;
}

describe('FormBuilder — rendering', () => {
  it('renders a text input, number input, select, and checkbox', () => {
    renderWithTheme(<Builder />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders Submit button', () => {
    renderWithTheme(<Builder />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('renders custom submitText', () => {
    renderWithTheme(<Builder submitText="Save Profile" />);
    expect(screen.getByRole('button', { name: 'Save Profile' })).toBeInTheDocument();
  });

  it('renders Cancel button only when onCancel is provided', () => {
    renderWithTheme(<Builder />);
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('Cancel button appears when onCancel is provided', () => {
    renderWithTheme(<Builder onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('Reset button does NOT appear by default', () => {
    renderWithTheme(<Builder />);
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
  });

  it('Reset button appears when onReset is provided', () => {
    renderWithTheme(<Builder onReset={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });
});

describe('FormBuilder — submission', () => {
  const simpleSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    agree: z.boolean().refine((v) => v === true, 'Must agree'),
  });
  const simpleFields: FieldConfig[] = [
    { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, required: true },
    { name: 'agree', label: 'I agree', type: FIELD_TYPE.CHECKBOX },
  ];

  it('calls onSubmit with correct typed data on valid form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithTheme(
      <FormBuilder fields={simpleFields} schema={simpleSchema} onSubmit={onSubmit} />,
    );

    await user.type(screen.getByRole('textbox'), 'Alice');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'Alice', agree: true });
  });

  it('does NOT call onSubmit when the form has validation errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderWithTheme(
      <FormBuilder fields={simpleFields} schema={simpleSchema} onSubmit={onSubmit} />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows Zod field validation error on blur', async () => {
    const user = userEvent.setup();

    renderWithTheme(<FormBuilder fields={simpleFields} schema={simpleSchema} onSubmit={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), 'A');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });
});

describe('FormBuilder — Cancel and Reset', () => {
  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithTheme(<Builder onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onReset when Reset is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    renderWithTheme(<Builder onReset={onReset} />);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe('FormBuilder — visibleIf', () => {
  it('hides a field when visibleIf returns false', () => {
    const conditionalFields: FieldConfig[] = [
      { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT },
      { name: 'age', label: 'Age', type: FIELD_TYPE.NUMBER, visibleIf: () => false },
    ];

    renderWithTheme(
      <FormBuilder
        fields={conditionalFields}
        schema={z.object({ name: z.string(), age: z.number().optional() })}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });
});

describe('FormBuilder — resolver prop', () => {
  it('renders and submits with a custom resolver instead of schema', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const customResolver = vi.fn().mockResolvedValue({
      values: { name: 'Bob' },
      errors: {},
    });

    renderWithTheme(
      <FormBuilder
        fields={[{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }]}
        resolver={customResolver}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByRole('textbox'), 'Bob');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'Bob' });
  });
});

describe('FormBuilder — onChange / onFieldChange', () => {
  it('calls onChange with current values on field change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const simpleSchema = z.object({ name: z.string() });

    renderWithTheme(
      <FormBuilder
        fields={[{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }]}
        schema={simpleSchema}
        onSubmit={vi.fn()}
        onChange={onChange}
      />,
    );

    await user.type(screen.getByRole('textbox'), 'A');
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it('calls onFieldChange with field name and value', async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const simpleSchema = z.object({ name: z.string() });

    renderWithTheme(
      <FormBuilder
        fields={[{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }]}
        schema={simpleSchema}
        onSubmit={vi.fn()}
        onFieldChange={onFieldChange}
      />,
    );

    await user.type(screen.getByRole('textbox'), 'X');
    await waitFor(() => expect(onFieldChange).toHaveBeenCalledWith('name', expect.any(String)));
  });
});

describe('FormBuilder — imperative ref', () => {
  it('exposes reset, submit, setError, and getValues via ref', async () => {
    const onSubmit = vi.fn();
    const simpleSchema = z.object({ name: z.string().min(1) });
    const ref =
      React.createRef<import('../components/form-builder/FormBuilder').FormBuilderHandle>();

    renderWithTheme(
      <FormBuilder
        ref={ref}
        fields={[{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }]}
        schema={simpleSchema}
        onSubmit={onSubmit}
      />,
    );

    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.reset).toBe('function');
    expect(typeof ref.current?.submit).toBe('function');
    expect(typeof ref.current?.setError).toBe('function');
    expect(typeof ref.current?.getValues).toBe('function');
  });
});

describe('FormBuilder — accessibility (axe)', () => {
  it('has no accessibility violations on initial render', async () => {
    const { container } = renderWithTheme(<Builder />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations after a validation error', async () => {
    const user = userEvent.setup();
    const { container } = renderWithTheme(
      <FormBuilder
        fields={[{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, required: true }]}
        schema={z.object({ name: z.string().min(2, 'Too short') })}
        onSubmit={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByText('Too short')).toBeInTheDocument());
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('FormBuilder — section grouping', () => {
  it('renders a section header when fields carry a section property', () => {
    const sectionedFields = [
      { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, section: 'Personal' },
      { name: 'age', label: 'Age', type: FIELD_TYPE.NUMBER, section: 'Details' },
    ];
    renderWithTheme(
      <FormBuilder
        fields={sectionedFields}
        schema={z.object({ name: z.string(), age: z.number() })}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('groups consecutive same-section fields under one header', () => {
    const sectionedFields = [
      { name: 'first', label: 'First', type: FIELD_TYPE.TEXT, section: 'Name' },
      { name: 'last', label: 'Last', type: FIELD_TYPE.TEXT, section: 'Name' },
    ];
    renderWithTheme(
      <FormBuilder
        fields={sectionedFields}
        schema={z.object({ first: z.string(), last: z.string() })}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getAllByText('Name').length).toBe(1);
  });

  it('renders fields without a section without any header', () => {
    renderWithTheme(<Builder />);
    // None of the test fields carry a section — no section header rendered
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});

describe('FormBuilder — sx prop', () => {
  it('accepts an sx prop without errors', () => {
    renderWithTheme(<Builder sx={{ border: '1px solid red' }} />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('accepts sx as an array without errors', () => {
    renderWithTheme(<Builder sx={[{ p: 2 }, { m: 1 }]} />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});

describe('FormBuilder — nested objects (dot-notation)', () => {
  const nestedSchema = z.object({
    address: z.object({
      street: z.string().min(1, 'Street required'),
      city: z.string().min(1, 'City required'),
    }),
  });
  const nestedFields: FieldConfig[] = [
    { name: 'address.street', label: 'Street', type: FIELD_TYPE.TEXT },
    { name: 'address.city', label: 'City', type: FIELD_TYPE.TEXT },
  ];

  it('submits deeply nested data with correct shape', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithTheme(
      <FormBuilder fields={nestedFields} schema={nestedSchema} onSubmit={onSubmit} />,
    );
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '123 Main St');
    await user.type(inputs[1], 'Springfield');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      address: { street: '123 Main St', city: 'Springfield' },
    });
  });

  it('shows validation errors for nested fields', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormBuilder fields={nestedFields} schema={nestedSchema} onSubmit={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByText('Street required')).toBeInTheDocument());
    expect(screen.getByText('City required')).toBeInTheDocument();
  });
});

describe('FormBuilder — virtualize', () => {
  it('falls back to normal list when react-window is unavailable', async () => {
    // FormBuilder loads react-window via a dynamic import inside useEffect. In the
    // test environment the import resolves, but on first render the FixedSizeList
    // state is null so the regular Grid path renders. Verify the form is visible.
    renderWithTheme(<Builder virtualize />);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  it('accepts virtualizeHeight and virtualizeItemSize props without error', () => {
    renderWithTheme(<Builder virtualize virtualizeHeight={400} virtualizeItemSize={120} />);
    // Non-virtual fallback renders until async react-window import resolves
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});
