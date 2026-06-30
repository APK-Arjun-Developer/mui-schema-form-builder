import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { TextInput } from '../../components/form-builder/inputs/TextInput';
import { NumberInput } from '../../components/form-builder/inputs/NumberInput';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

function TextWithAdornments({ start, end }: { start?: React.ReactNode; end?: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useForm<any>({ defaultValues: { amount: '' } });
  return (
    <TextInput
      fieldConfig={{
        name: 'amount',
        label: 'Amount',
        type: FIELD_TYPE.TEXT,
        startAdornment: start,
        endAdornment: end,
      }}
      control={control}
    />
  );
}

function NumberWithAdornments({ start, end }: { start?: React.ReactNode; end?: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useForm<any>({ defaultValues: { weight: '' } });
  return (
    <NumberInput
      fieldConfig={{
        name: 'weight',
        label: 'Weight',
        type: FIELD_TYPE.NUMBER,
        startAdornment: start,
        endAdornment: end,
      }}
      control={control}
    />
  );
}

describe('Input adornments — TextInput', () => {
  it('renders a start adornment', () => {
    renderWithTheme(<TextWithAdornments start={<span>$</span>} />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders an end adornment', () => {
    renderWithTheme(<TextWithAdornments end={<span>.00</span>} />);
    expect(screen.getByText('.00')).toBeInTheDocument();
  });

  it('renders both start and end adornments simultaneously', () => {
    renderWithTheme(<TextWithAdornments start={<span>€</span>} end={<span>EUR</span>} />);
    expect(screen.getByText('€')).toBeInTheDocument();
    expect(screen.getByText('EUR')).toBeInTheDocument();
  });

  it('renders without adornments when none are provided', () => {
    renderWithTheme(<TextWithAdornments />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

describe('Input adornments — NumberInput', () => {
  it('renders a start adornment', () => {
    renderWithTheme(<NumberWithAdornments start={<span>kg</span>} />);
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('renders an end adornment', () => {
    renderWithTheme(<NumberWithAdornments end={<span>lbs</span>} />);
    expect(screen.getByText('lbs')).toBeInTheDocument();
  });

  it('renders both start and end adornments simultaneously', () => {
    renderWithTheme(<NumberWithAdornments start={<span>$</span>} end={<span>USD</span>} />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });
});
