import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { NumberInput } from '../../components/form-builder/inputs/NumberInput';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

// Each test uses a fixture component so hooks are called inside a React function.

describe('NumberInput', () => {
  it('renders a number input', () => {
    function Fixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { qty: '' } });
      return (
        <NumberInput
          fieldConfig={{
            name: 'qty',
            label: 'Quantity',
            type: FIELD_TYPE.NUMBER,
            min: 1,
            max: 100,
          }}
          control={control}
        />
      );
    }
    renderWithTheme(<Fixture />);
    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'number');
  });

  it('reflects min and max on the native input', () => {
    function Fixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { qty: '' } });
      return (
        <NumberInput
          fieldConfig={{ name: 'qty', label: 'Qty', type: FIELD_TYPE.NUMBER, min: 1, max: 100 }}
          control={control}
        />
      );
    }
    renderWithTheme(<Fixture />);
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '100');
  });

  it('coerces typed value to a number', async () => {
    const user = userEvent.setup();
    let captured: unknown;

    function CaptureFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control, watch } = useForm<any>({ defaultValues: { qty: '' } });
      captured = watch('qty');
      return (
        <NumberInput
          fieldConfig={{ name: 'qty', label: 'Qty', type: FIELD_TYPE.NUMBER }}
          control={control}
        />
      );
    }

    renderWithTheme(<CaptureFixture />);
    await user.clear(screen.getByRole('spinbutton'));
    await user.type(screen.getByRole('spinbutton'), '42');
    expect(typeof captured).toBe('number');
    expect(captured).toBe(42);
  });

  it('stores empty string when field is cleared', async () => {
    const user = userEvent.setup();
    let captured: unknown = 5;

    function CaptureFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control, watch } = useForm<any>({ defaultValues: { qty: 5 } });
      captured = watch('qty');
      return (
        <NumberInput
          fieldConfig={{ name: 'qty', label: 'Qty', type: FIELD_TYPE.NUMBER }}
          control={control}
        />
      );
    }

    renderWithTheme(<CaptureFixture />);
    await user.clear(screen.getByRole('spinbutton'));
    expect(captured).toBe('');
  });
});
