import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { renderWithTheme } from '../helpers';
import { PasswordInput } from '../../components/form-builder/inputs/PasswordInput';
import { FormBuilder } from '../../components/form-builder/FormBuilder';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

function PasswordFixture({ disabled = false }: { disabled?: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useForm<any>({ defaultValues: { password: '' } });
  return (
    <PasswordInput
      fieldConfig={{
        name: 'password',
        label: 'Password',
        type: FIELD_TYPE.PASSWORD,
        disabled,
      }}
      control={control}
    />
  );
}

describe('PasswordInput', () => {
  it('renders with type="password" by default', () => {
    renderWithTheme(<PasswordFixture />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('renders a visibility toggle button', () => {
    renderWithTheme(<PasswordFixture />);
    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
  });

  it('toggles to type="text" when the visibility button is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PasswordFixture />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });

  it('toggles back to type="password" on second click', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PasswordFixture />);
    const toggle = screen.getByRole('button', { name: 'Show password' });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    renderWithTheme(<PasswordFixture />);
    const input = screen.getByLabelText('Password');
    await user.type(input, 'secret123');
    expect(input).toHaveValue('secret123');
  });

  it('is disabled when fieldConfig.disabled is true', () => {
    renderWithTheme(<PasswordFixture disabled />);
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
  });

  it('is registered in FormBuilder via FIELD_TYPE.PASSWORD', () => {
    const schema = z.object({ password: z.string() });
    renderWithTheme(
      <FormBuilder
        fields={[{ name: 'password', label: 'Password', type: FIELD_TYPE.PASSWORD }]}
        schema={schema}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });
});
