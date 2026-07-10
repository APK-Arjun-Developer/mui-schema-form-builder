import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { ComboInput } from '../../components/form-builder/inputs/ComboInput';
import { FIELD_TYPE, type FieldConfig } from '../../components/form-builder/types/field.types';

const SELECT_OPTIONS = [
  { label: '+1', value: '+1' },
  { label: '+44', value: '+44' },
  { label: '+49', value: '+49' },
];

const baseField: FieldConfig = {
  name: 'phone',
  label: 'Phone',
  type: FIELD_TYPE.COMBO_INPUT,
  selectOptions: SELECT_OPTIONS,
  selectPlaceholder: 'Code',
  placeholder: 'Number',
};

function Fixture({
  fieldConfig = baseField,
  defaultValue,
}: {
  fieldConfig?: FieldConfig;
  defaultValue?: { select: string; input: string };
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useForm<any>({
    defaultValues: { phone: defaultValue ?? { select: '', input: '' } },
  });
  return <ComboInput fieldConfig={fieldConfig} control={control} />;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
describe('ComboInput — rendering', () => {
  it('renders the label', () => {
    renderWithTheme(<Fixture />);
    expect(screen.getByText('Phone')).toBeInTheDocument();
  });

  it('renders a combobox (Select) and a textbox (TextField)', () => {
    renderWithTheme(<Fixture />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders selectOptions in the dropdown', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Fixture />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: '+1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '+44' })).toBeInTheDocument();
  });

  it('renders placeholder on the text input', () => {
    renderWithTheme(<Fixture />);
    expect(screen.getByPlaceholderText('Number')).toBeInTheDocument();
  });

  it('renders the required asterisk when required=true', () => {
    renderWithTheme(<Fixture fieldConfig={{ ...baseField, required: true }} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders the text input as type="number" when inputType="number"', () => {
    renderWithTheme(
      <Fixture fieldConfig={{ ...baseField, inputType: 'number', placeholder: '0' }} />,
    );
    expect(screen.getByPlaceholderText('0')).toHaveAttribute('type', 'number');
  });
});

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------
describe('ComboInput — defaultValues', () => {
  it('pre-fills the text input from defaultValue', () => {
    renderWithTheme(<Fixture defaultValue={{ select: '+44', input: '7911123456' }} />);
    expect(screen.getByRole('textbox')).toHaveValue('7911123456');
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------
describe('ComboInput — interactions', () => {
  it('updates the text input when the user types', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Fixture />);
    const input = screen.getByRole('textbox');
    await user.type(input, '5551234');
    expect(input).toHaveValue('5551234');
  });

  it('updates the select when the user picks an option', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Fixture />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '+44' }));
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('+44');
    });
  });
});

// ---------------------------------------------------------------------------
// Disabled state
// ---------------------------------------------------------------------------
describe('ComboInput — disabled', () => {
  it('disables both inputs when disabled=true', () => {
    renderWithTheme(<Fixture fieldConfig={{ ...baseField, disabled: true }} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// onChange callback via parent form watch
// ---------------------------------------------------------------------------
describe('ComboInput — onChange wiring', () => {
  it('fires form-level onChange when text input changes', async () => {
    const onChange = vi.fn();

    function WatchedFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control, watch } = useForm<any>({
        defaultValues: { phone: { select: '', input: '' } },
      });
      watch((values) => onChange(values));
      return <ComboInput fieldConfig={baseField} control={control} />;
    }

    const user = userEvent.setup();
    renderWithTheme(<WatchedFixture />);
    await user.type(screen.getByRole('textbox'), '5');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// selectPosition: 'end'
// ---------------------------------------------------------------------------
describe('ComboInput — selectPosition end', () => {
  it('renders input before select when selectPosition is end', () => {
    renderWithTheme(<Fixture fieldConfig={{ ...baseField, selectPosition: 'end' }} />);
    const combobox = screen.getByRole('combobox');
    const textbox = screen.getByRole('textbox');
    // textbox should come before combobox in the DOM
    expect(
      textbox.compareDocumentPosition(combobox) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// inputType: 'search' — search icon adornment
// ---------------------------------------------------------------------------
describe('ComboInput — inputType search', () => {
  it('renders an SVG search icon when inputType is search', () => {
    const { container } = renderWithTheme(
      <Fixture fieldConfig={{ ...baseField, inputType: 'search', placeholder: 'Search…' }} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the input with type search', () => {
    renderWithTheme(
      <Fixture fieldConfig={{ ...baseField, inputType: 'search', placeholder: 'Search…' }} />,
    );
    expect(screen.getByPlaceholderText('Search…')).toHaveAttribute('type', 'search');
  });
});

// ---------------------------------------------------------------------------
// inputType: 'number' — coercion
// ---------------------------------------------------------------------------
describe('ComboInput — inputType number coercion', () => {
  it('stores a number when user types digits', async () => {
    const onChange = vi.fn();

    function NumberFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control, watch } = useForm<any>({
        defaultValues: { phone: { select: '', input: '' } },
      });
      watch((values) => onChange(values));
      return (
        <ComboInput
          fieldConfig={{ ...baseField, inputType: 'number', placeholder: '0' }}
          control={control}
        />
      );
    }

    const user = userEvent.setup();
    renderWithTheme(<NumberFixture />);
    await user.type(screen.getByPlaceholderText('0'), '42');
    await waitFor(() => {
      const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(typeof last.phone.input).toBe('number');
    });
  });

  it('stores empty string when number input is cleared', async () => {
    const onChange = vi.fn();

    function NumberFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control, watch } = useForm<any>({
        defaultValues: { phone: { select: '', input: 5 } },
      });
      watch((values) => onChange(values));
      return (
        <ComboInput
          fieldConfig={{ ...baseField, inputType: 'number', placeholder: '0' }}
          control={control}
        />
      );
    }

    const user = userEvent.setup();
    renderWithTheme(<NumberFixture />);
    const input = screen.getByPlaceholderText('0');
    await user.clear(input);
    await waitFor(() => {
      const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
      expect(last.phone.input).toBe('');
    });
  });
});

// ---------------------------------------------------------------------------
// renderValue — selected option label
// ---------------------------------------------------------------------------
describe('ComboInput — renderValue with selection', () => {
  it('displays the option label when a value is pre-selected', () => {
    renderWithTheme(<Fixture defaultValue={{ select: '+44', input: '' }} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('+44');
  });

  it('displays the raw value when no matching option is found', () => {
    renderWithTheme(<Fixture defaultValue={{ select: '+99', input: '' }} />);
    expect(screen.getByRole('combobox')).toHaveTextContent('+99');
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------
describe('ComboInput — accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <Fixture fieldConfig={{ ...baseField, required: true }} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
