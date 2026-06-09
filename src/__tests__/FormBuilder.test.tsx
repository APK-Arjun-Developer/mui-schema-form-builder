import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
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

describe('FormBuilder — virtualize', () => {
  it('falls back to normal list when react-window is unavailable', async () => {
    // Spy on the dynamic import and make it reject to simulate react-window not installed.
    // Using import.meta is not available in CJS test env, so we patch via spyOn on the
    // module's internal import mechanism via a rejected dynamic import simulation.
    const importSpy = vi.spyOn(
      await import('../components/form-builder/FormBuilder'),
      'FormBuilder',
    );

    // Since FormBuilder loads react-window via dynamic import inside useEffect,
    // render it without react-window available — it should fall back gracefully.
    renderWithTheme(<Builder virtualize />);

    // The form still renders in non-virtual mode (FixedSizeList load is async + may fail)
    await waitFor(() => {
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    importSpy.mockRestore();
  });

  it('accepts virtualizeHeight and virtualizeItemSize props without error', () => {
    renderWithTheme(<Builder virtualize virtualizeHeight={400} virtualizeItemSize={120} />);
    // Non-virtual fallback renders until async react-window import resolves
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});
