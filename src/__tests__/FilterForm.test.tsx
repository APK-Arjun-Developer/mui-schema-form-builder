import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderWithTheme } from './helpers';
import { FilterForm } from '../components/form-builder/FilterForm';
import { FIELD_TYPE, type FieldConfig } from '../components/form-builder/types/field.types';

const textField: FieldConfig = { name: 'search', label: 'Search', type: FIELD_TYPE.TEXT };
const selectField: FieldConfig = {
  name: 'status',
  label: 'Status',
  type: FIELD_TYPE.SELECT,
  options: [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ],
};
const checkboxField: FieldConfig = {
  name: 'inStock',
  label: 'In stock only',
  type: FIELD_TYPE.CHECKBOX,
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
describe('FilterForm — rendering', () => {
  it('renders all fields with their labels', () => {
    renderWithTheme(<FilterForm fields={[textField, selectField]} onChange={vi.fn()} />);
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders no submit button', () => {
    renderWithTheme(<FilterForm fields={[textField]} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
  });

  it('renders no reset button by default', () => {
    renderWithTheme(<FilterForm fields={[textField]} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
  });

  it('renders reset button when showReset is true', () => {
    renderWithTheme(<FilterForm fields={[textField]} onChange={vi.fn()} showReset />);
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('renders custom resetText', () => {
    renderWithTheme(
      <FilterForm fields={[textField]} onChange={vi.fn()} showReset resetText="Clear filters" />,
    );
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('renders no <form> element — fields live in a plain Box', () => {
    const { container } = renderWithTheme(<FilterForm fields={[textField]} onChange={vi.fn()} />);
    expect(container.querySelector('form')).not.toBeInTheDocument();
  });

  it('renders multiple field types', () => {
    renderWithTheme(
      <FilterForm fields={[textField, selectField, checkboxField]} onChange={vi.fn()} />,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// onChange behaviour
// ---------------------------------------------------------------------------
describe('FilterForm — onChange', () => {
  it('calls onChange when a text field value changes', async () => {
    const onChange = vi.fn();
    renderWithTheme(<FilterForm fields={[textField]} onChange={onChange} />);

    await userEvent.type(screen.getByRole('textbox'), 'react');

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
      const latest = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Record<
        string,
        unknown
      >;
      expect(latest.search).toBe('react');
    });
  });

  it('never shows validation error messages', async () => {
    renderWithTheme(<FilterForm fields={[textField]} onChange={vi.fn()} />);
    await userEvent.type(screen.getByRole('textbox'), 'test');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('includes all field names in the onChange payload', async () => {
    const onChange = vi.fn();
    renderWithTheme(<FilterForm fields={[textField, checkboxField]} onChange={onChange} />);

    await userEvent.type(screen.getByRole('textbox'), 'x');

    await waitFor(() => {
      const latest = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Record<
        string,
        unknown
      >;
      expect('search' in latest).toBe(true);
      expect('inStock' in latest).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// defaultValues
// ---------------------------------------------------------------------------
describe('FilterForm — defaultValues', () => {
  it('pre-fills a text field', () => {
    renderWithTheme(
      <FilterForm
        fields={[textField]}
        onChange={vi.fn()}
        defaultValues={{ search: 'initial query' }}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('initial query');
  });

  it('defaultValues takes precedence over field-level defaultValue', () => {
    const fieldWithDefault: FieldConfig = {
      ...textField,
      defaultValue: 'field default',
    };
    renderWithTheme(
      <FilterForm
        fields={[fieldWithDefault]}
        onChange={vi.fn()}
        defaultValues={{ search: 'prop default' }}
      />,
    );
    expect(screen.getByRole('textbox')).toHaveValue('prop default');
  });
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------
describe('FilterForm — reset', () => {
  it('resets the text field to empty after typing', async () => {
    renderWithTheme(<FilterForm fields={[textField]} onChange={vi.fn()} showReset />);

    await userEvent.type(screen.getByRole('textbox'), 'something');
    expect(screen.getByRole('textbox')).toHaveValue('something');

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('');
    });
  });

  it('calls onChange with empty values after reset', async () => {
    const onChange = vi.fn();
    renderWithTheme(<FilterForm fields={[textField]} onChange={onChange} showReset />);

    await userEvent.type(screen.getByRole('textbox'), 'test');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      const latest = onChange.mock.calls[onChange.mock.calls.length - 1][0] as Record<
        string,
        unknown
      >;
      expect(latest.search).toBe('');
    });
  });

  it('resets to defaultValues, not to empty', async () => {
    renderWithTheme(
      <FilterForm
        fields={[textField]}
        onChange={vi.fn()}
        showReset
        defaultValues={{ search: 'default' }}
      />,
    );

    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'changed');

    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveValue('default');
    });
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------
describe('FilterForm — accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <FilterForm fields={[textField, selectField, checkboxField]} onChange={vi.fn()} showReset />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
