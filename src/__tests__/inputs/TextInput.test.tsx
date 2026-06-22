import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { TextInput } from '../../components/form-builder/inputs/TextInput';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

function TextInputFixture({ defaultValue = '' }: { defaultValue?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useForm<any>({ defaultValues: { name: defaultValue } });
  return (
    <TextInput
      fieldConfig={{ name: 'name', label: 'Full Name', type: FIELD_TYPE.TEXT, required: true }}
      control={control}
    />
  );
}

describe('TextInput', () => {
  it('renders an input element', () => {
    renderWithTheme(<TextInputFixture />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    function PlaceholderFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { email: '' } });
      return (
        <TextInput
          fieldConfig={{
            name: 'email',
            label: 'Email',
            type: FIELD_TYPE.TEXT,
            placeholder: 'you@example.com',
          }}
          control={control}
        />
      );
    }
    renderWithTheme(<PlaceholderFixture />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('updates value when user types', async () => {
    const user = userEvent.setup();
    renderWithTheme(<TextInputFixture />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Alice');
    expect(input).toHaveValue('Alice');
  });

  it('is disabled when fieldConfig.disabled is true', () => {
    function DisabledFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { name: '' } });
      return (
        <TextInput
          fieldConfig={{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, disabled: true }}
          control={control}
        />
      );
    }
    renderWithTheme(<DisabledFixture />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders as <textarea> when type is TEXTAREA', () => {
    function TextareaFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { bio: '' } });
      return (
        <TextInput
          fieldConfig={{ name: 'bio', label: 'Bio', type: FIELD_TYPE.TEXTAREA }}
          control={control}
        />
      );
    }
    renderWithTheme(<TextareaFixture />);
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
  });

  it('renders start and end adornments for text fields', () => {
    function AdornmentFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { amount: '' } });
      return (
        <TextInput
          fieldConfig={{
            name: 'amount',
            label: 'Amount',
            type: FIELD_TYPE.TEXT,
            startAdornment: '$',
            endAdornment: 'USD',
          }}
          control={control}
        />
      );
    }
    renderWithTheme(<AdornmentFixture />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('toggles password visibility when configured as a password field', async () => {
    const user = userEvent.setup();
    function PasswordFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { password: '' } });
      return (
        <TextInput
          fieldConfig={{ name: 'password', label: 'Password', type: FIELD_TYPE.PASSWORD }}
          control={control}
        />
      );
    }
    renderWithTheme(<PasswordFixture />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });
});
