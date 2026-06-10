import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { createDatePickerInput } from '../../components/form-builder/inputs/DatePickerInput';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

// Minimal mock of a MUI-style DatePicker component.
const MockDatePicker = ({
  label,
  value,
  onChange,
  disabled,
  slotProps,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slotProps?: any;
}) => {
  const tf = slotProps?.textField ?? {};
  return (
    <div>
      <label htmlFor={tf.id}>{label}</label>
      <input
        id={tf.id}
        data-testid="mock-datepicker"
        type="text"
        value={(value as string) ?? ''}
        disabled={disabled}
        required={tf.required}
        aria-invalid={tf.error}
        onChange={(e) => onChange(e.target.value)}
      />
      {tf.helperText}
    </div>
  );
};

const DatePickerFieldComponent = createDatePickerInput(MockDatePicker);

function Fixture({ defaultValue, onError }: { defaultValue?: string; onError?: boolean }) {
  const fieldConfig = {
    name: 'dob',
    label: 'Date of Birth',
    type: FIELD_TYPE.DATE_PICKER,
    defaultValue: defaultValue ?? null,
    required: onError ? true : undefined,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control, setError } = useForm<any>({ defaultValues: { dob: defaultValue ?? null } });
  React.useEffect(() => {
    if (onError) setError('dob', { type: 'required', message: 'Date required' });
  }, [setError, onError]);
  return <DatePickerFieldComponent fieldConfig={fieldConfig} control={control} />;
}

describe('createDatePickerInput', () => {
  it('renders the mock DatePicker with the correct label', () => {
    renderWithTheme(<Fixture />);
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
  });

  it('renders the provided defaultValue', () => {
    renderWithTheme(<Fixture defaultValue="2024-01-15T00:00:00.000Z" />);
    expect(screen.getByTestId('mock-datepicker')).toHaveValue('2024-01-15T00:00:00.000Z');
  });

  it('calls field.onChange with ISO string when a Dayjs-like value is provided', async () => {
    const user = userEvent.setup();
    // Simulate typing an ISO string directly into the mock input
    renderWithTheme(<Fixture />);
    const input = screen.getByTestId('mock-datepicker');
    await user.type(input, '2024-06-01');
    expect(input).toHaveValue('2024-06-01');
  });

  it('stores null when value is empty string', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Fixture defaultValue="2024-01-01" />);
    const input = screen.getByTestId('mock-datepicker');
    await user.clear(input);
    expect(input).toHaveValue('');
  });

  it('shows error helper text when field has a validation error', async () => {
    renderWithTheme(<Fixture onError />);
    await waitFor(() => expect(screen.getByText('Date required')).toBeInTheDocument());
  });

  it('renders a component produced by the factory', () => {
    function InnerFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { dob: null } });
      return (
        <DatePickerFieldComponent
          fieldConfig={{ name: 'dob', label: 'DOB', type: FIELD_TYPE.DATE_PICKER }}
          control={control}
        />
      );
    }
    renderWithTheme(<InnerFixture />);
    expect(screen.getByTestId('mock-datepicker')).toBeInTheDocument();
  });
});
