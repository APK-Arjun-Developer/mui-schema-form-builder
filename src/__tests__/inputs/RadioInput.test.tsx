import { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { RadioInput } from '../../components/form-builder/inputs/RadioInput';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

function RadioFixture() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control, watch } = useForm<any>({ defaultValues: { gender: '' } });
  const value = watch('gender');
  return (
    <>
      <RadioInput
        fieldConfig={{
          name: 'gender',
          label: 'Gender',
          type: FIELD_TYPE.RADIO,
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Other', value: 'other' },
          ],
        }}
        control={control}
      />
      <div data-testid="value">{value as string}</div>
    </>
  );
}

describe('RadioInput', () => {
  it('renders all options', () => {
    renderWithTheme(<RadioFixture />);
    expect(screen.getByLabelText('Male')).toBeInTheDocument();
    expect(screen.getByLabelText('Female')).toBeInTheDocument();
    expect(screen.getByLabelText('Other')).toBeInTheDocument();
  });

  it('starts with no option selected', () => {
    renderWithTheme(<RadioFixture />);
    expect(screen.getByTestId('value').textContent).toBe('');
  });

  it('updates value when option is selected', async () => {
    const user = userEvent.setup();
    renderWithTheme(<RadioFixture />);
    await user.click(screen.getByLabelText('Female'));
    expect(screen.getByTestId('value').textContent).toBe('female');
  });

  it('changes selection when a different option is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<RadioFixture />);
    await user.click(screen.getByLabelText('Male'));
    await user.click(screen.getByLabelText('Other'));
    expect(screen.getByTestId('value').textContent).toBe('other');
  });

  it('renders required asterisk when required=true', () => {
    function RequiredFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { gender: '' } });
      return (
        <RadioInput
          fieldConfig={{
            name: 'gender',
            label: 'Gender',
            type: FIELD_TYPE.RADIO,
            required: true,
            options: [{ label: 'Male', value: 'male' }],
          }}
          control={control}
        />
      );
    }
    renderWithTheme(<RequiredFixture />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders in disabled state', () => {
    function DisabledFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { gender: '' } });
      return (
        <RadioInput
          fieldConfig={{
            name: 'gender',
            label: 'Gender',
            type: FIELD_TYPE.RADIO,
            disabled: true,
            options: [{ label: 'Male', value: 'male' }],
          }}
          control={control}
        />
      );
    }
    renderWithTheme(<DisabledFixture />);
    expect(screen.getByLabelText('Male')).toBeDisabled();
  });

  it('shows error helper text when field has a validation error', async () => {
    function ErrorFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control, setError } = useForm<any>({ defaultValues: { gender: '' } });
      useEffect(() => {
        setError('gender', { type: 'required', message: 'Please pick a gender' });
      }, [setError]);
      return (
        <RadioInput
          fieldConfig={{
            name: 'gender',
            label: 'Gender',
            type: FIELD_TYPE.RADIO,
            options: [{ label: 'Male', value: 'male' }],
          }}
          control={control}
        />
      );
    }
    renderWithTheme(<ErrorFixture />);
    await waitFor(() => expect(screen.getByText('Please pick a gender')).toBeInTheDocument());
  });
});
