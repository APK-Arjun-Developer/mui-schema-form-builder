import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
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
});
