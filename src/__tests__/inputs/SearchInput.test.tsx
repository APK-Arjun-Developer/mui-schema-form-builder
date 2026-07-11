import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { SearchInput } from '../../components/form-builder/inputs/SearchInput';
import { FIELD_TYPE, type FieldConfig } from '../../components/form-builder/types/field.types';

const baseField: FieldConfig = {
  name: 'search',
  label: 'Search',
  type: FIELD_TYPE.SEARCH,
  placeholder: 'Search…',
};

function Fixture({ fieldConfig = baseField }: { fieldConfig?: FieldConfig } = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useForm<any>({ defaultValues: { search: '' } });
  return <SearchInput fieldConfig={fieldConfig} control={control} />;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
describe('SearchInput — rendering', () => {
  it('renders the label', () => {
    renderWithTheme(<Fixture />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders an input with type="search"', () => {
    renderWithTheme(<Fixture />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('renders the placeholder', () => {
    renderWithTheme(<Fixture />);
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
  });

  it('renders an SVG search icon by default', () => {
    const { container } = renderWithTheme(<Fixture />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders the required asterisk when required=true', () => {
    renderWithTheme(<Fixture fieldConfig={{ ...baseField, required: true }} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders a custom startAdornment instead of the default icon', () => {
    renderWithTheme(<Fixture fieldConfig={{ ...baseField, startAdornment: <span>🔍</span> }} />);
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('renders an endAdornment when provided', () => {
    renderWithTheme(<Fixture fieldConfig={{ ...baseField, endAdornment: <span>✕</span> }} />);
    expect(screen.getByText('✕')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------
describe('SearchInput — interactions', () => {
  it('updates value when the user types', async () => {
    const user = userEvent.setup();
    renderWithTheme(<Fixture />);
    const input = screen.getByRole('searchbox');
    await user.type(input, 'react');
    expect(input).toHaveValue('react');
  });
});

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------
describe('SearchInput — disabled', () => {
  it('disables the input when disabled=true', () => {
    renderWithTheme(<Fixture fieldConfig={{ ...baseField, disabled: true }} />);
    expect(screen.getByRole('searchbox')).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------
describe('SearchInput — accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(
      <Fixture fieldConfig={{ ...baseField, required: true }} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
