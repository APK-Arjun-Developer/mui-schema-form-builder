import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { AutocompleteInput } from '../../components/form-builder/inputs/AutocompleteInput';
import { FIELD_TYPE, type Option } from '../../components/form-builder/types/field.types';

const STATIC_OPTIONS: Option[] = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
];

function StaticAutocompleteFixture() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useForm<any>({ defaultValues: { framework: null } });
  return (
    <AutocompleteInput
      fieldConfig={{
        name: 'framework',
        label: 'Framework',
        type: FIELD_TYPE.AUTOCOMPLETE,
        options: STATIC_OPTIONS,
        placeholder: 'Choose framework',
      }}
      control={control}
    />
  );
}

describe('AutocompleteInput — static options', () => {
  it('renders a combobox input (MUI Autocomplete uses role=combobox)', () => {
    renderWithTheme(<StaticAutocompleteFixture />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders the label', () => {
    renderWithTheme(<StaticAutocompleteFixture />);
    expect(screen.getByText('Framework')).toBeInTheDocument();
  });

  it('shows static options when the user types', async () => {
    const user = userEvent.setup();
    renderWithTheme(<StaticAutocompleteFixture />);
    await user.type(screen.getByRole('combobox'), 'R');
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });
});

describe('AutocompleteInput — async fetchOptions', () => {
  it('calls fetchOptions after the user types (real timer, waitFor)', async () => {
    // Real timers: debounce fires after 300ms; waitFor polls for up to 2s.
    // This tests that fetchOptions IS called — not precise timing (unit-tested separately).
    const fetchOptions = vi.fn().mockResolvedValue(STATIC_OPTIONS);

    function AsyncFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { skill: null } });
      return (
        <AutocompleteInput
          fieldConfig={{
            name: 'skill',
            label: 'Skill',
            type: FIELD_TYPE.AUTOCOMPLETE,
            fetchOptions,
          }}
          control={control}
        />
      );
    }

    const user = userEvent.setup();
    renderWithTheme(<AsyncFixture />);

    await user.type(screen.getByRole('combobox'), 'React');

    // Debounce fires after 300ms — waitFor polls until fetchOptions is called.
    await waitFor(
      () => {
        expect(fetchOptions).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );

    // Called with the typed value
    expect(fetchOptions).toHaveBeenCalledWith(expect.any(String));
  });

  it('handles fetch errors without crashing', async () => {
    const fetchOptions = vi.fn().mockRejectedValue(new Error('Network error'));

    function ErrorFixture() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { skill: null } });
      return (
        <AutocompleteInput
          fieldConfig={{
            name: 'skill',
            label: 'Skill',
            type: FIELD_TYPE.AUTOCOMPLETE,
            fetchOptions,
          }}
          control={control}
        />
      );
    }

    const user = userEvent.setup();
    renderWithTheme(<ErrorFixture />);

    await user.type(screen.getByRole('combobox'), 'err');

    // Wait for fetchOptions to be called (and rejected) — component should still be mounted
    await waitFor(() => expect(fetchOptions).toHaveBeenCalled(), { timeout: 2000 });

    // Component stays mounted — no throw
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
