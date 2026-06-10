import { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { CheckboxInput } from '../../components/form-builder/inputs/CheckboxInput';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

function SingleCheckboxFixture() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useForm<any>({ defaultValues: { accept: false } });
  return (
    <CheckboxInput
      fieldConfig={{ name: 'accept', label: 'Accept terms', type: FIELD_TYPE.CHECKBOX }}
      control={control}
    />
  );
}

function GroupCheckboxFixture() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control, watch } = useForm<any>({ defaultValues: { interests: [] } });
  const value = watch('interests');
  return (
    <>
      <CheckboxInput
        fieldConfig={{
          name: 'interests',
          label: 'Interests',
          type: FIELD_TYPE.CHECKBOX,
          options: [
            { label: 'Coding', value: 'coding' },
            { label: 'Gaming', value: 'gaming' },
          ],
        }}
        control={control}
      />
      <div data-testid="value">{JSON.stringify(value)}</div>
    </>
  );
}

describe('CheckboxInput — single boolean', () => {
  it('renders unchecked initially', () => {
    renderWithTheme(<SingleCheckboxFixture />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('toggles to true when clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SingleCheckboxFixture />);
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});

describe('CheckboxInput — group', () => {
  it('renders all options', () => {
    renderWithTheme(<GroupCheckboxFixture />);
    expect(screen.getByLabelText('Coding')).toBeInTheDocument();
    expect(screen.getByLabelText('Gaming')).toBeInTheDocument();
  });

  it('adds value to array when checked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GroupCheckboxFixture />);
    await user.click(screen.getByLabelText('Coding'));
    expect(screen.getByTestId('value').textContent).toContain('coding');
  });

  it('removes value from array when unchecked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<GroupCheckboxFixture />);
    await user.click(screen.getByLabelText('Coding'));
    await user.click(screen.getByLabelText('Coding'));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(JSON.parse(screen.getByTestId('value').textContent!)).toEqual([]);
  });

  it('renders required asterisk for group when required=true', () => {
    function RequiredGroupFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { tags: [] } });
      return (
        <CheckboxInput
          fieldConfig={{
            name: 'tags',
            label: 'Tags',
            type: FIELD_TYPE.CHECKBOX,
            required: true,
            options: [{ label: 'React', value: 'react' }],
          }}
          control={control}
        />
      );
    }
    renderWithTheme(<RequiredGroupFixture />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders group in disabled state', () => {
    function DisabledGroupFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { tags: [] } });
      return (
        <CheckboxInput
          fieldConfig={{
            name: 'tags',
            label: 'Tags',
            type: FIELD_TYPE.CHECKBOX,
            disabled: true,
            options: [{ label: 'React', value: 'react' }],
          }}
          control={control}
        />
      );
    }
    renderWithTheme(<DisabledGroupFixture />);
    expect(screen.getByLabelText('React')).toBeDisabled();
  });

  it('shows error helper text for group when field has a validation error', async () => {
    function ErrorGroupFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control, setError } = useForm<any>({ defaultValues: { tags: [] } });
      useEffect(() => {
        setError('tags', { type: 'required', message: 'Select at least one' });
      }, [setError]);
      return (
        <CheckboxInput
          fieldConfig={{
            name: 'tags',
            label: 'Tags',
            type: FIELD_TYPE.CHECKBOX,
            options: [{ label: 'React', value: 'react' }],
          }}
          control={control}
        />
      );
    }
    renderWithTheme(<ErrorGroupFixture />);
    await waitFor(() => expect(screen.getByText('Select at least one')).toBeInTheDocument());
  });
});
