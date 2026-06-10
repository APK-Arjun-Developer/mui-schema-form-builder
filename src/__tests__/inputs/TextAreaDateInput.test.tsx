import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { TextInput } from '../../components/form-builder/inputs/TextInput';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

// ─── TEXTAREA ──────────────────────────────────────────────────────────────────

function TextareaFixture({ rows }: { rows?: number } = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useForm<any>({ defaultValues: { bio: '' } });
  return (
    <TextInput
      fieldConfig={{ name: 'bio', label: 'Bio', type: FIELD_TYPE.TEXTAREA, rows }}
      control={control}
    />
  );
}

describe('TextInput — TEXTAREA', () => {
  it('renders a <textarea> element', () => {
    renderWithTheme(<TextareaFixture />);
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TextareaFixture />);
    await user.type(screen.getByRole('textbox'), 'Hello world');
    expect(screen.getByRole('textbox')).toHaveValue('Hello world');
  });

  it('defaults to 4 rows', () => {
    renderWithTheme(<TextareaFixture />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '4');
  });

  it('respects custom rows prop', () => {
    renderWithTheme(<TextareaFixture rows={8} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8');
  });

  it('renders the label', () => {
    renderWithTheme(<TextareaFixture />);
    expect(screen.getByText('Bio')).toBeInTheDocument();
  });
});

// ─── DATE ─────────────────────────────────────────────────────────────────────

function DateFixture() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control, watch } = useForm<any>({ defaultValues: { dob: '' } });
  const value = watch('dob');
  return (
    <>
      <TextInput
        fieldConfig={{ name: 'dob', label: 'Date of Birth', type: FIELD_TYPE.DATE }}
        control={control}
      />
      <div data-testid="value">{value as string}</div>
    </>
  );
}

describe('TextInput — DATE', () => {
  it('renders an input with type="date"', () => {
    renderWithTheme(<DateFixture />);
    expect(screen.getByLabelText('Date of Birth')).toHaveAttribute('type', 'date');
  });

  it('renders the label', () => {
    renderWithTheme(<DateFixture />);
    expect(screen.getByText('Date of Birth')).toBeInTheDocument();
  });

  it('accepts a date value', async () => {
    const user = userEvent.setup();
    renderWithTheme(<DateFixture />);
    const input = screen.getByLabelText('Date of Birth');
    await user.type(input, '2024-01-15');
    expect(screen.getByTestId('value').textContent).toBe('2024-01-15');
  });

  it('does NOT render a <textarea>', () => {
    renderWithTheme(<DateFixture />);
    expect(screen.queryByRole('textbox')?.tagName).not.toBe('TEXTAREA');
  });
});
