import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { renderWithTheme } from '../helpers';
import { SelectInput } from '../../components/form-builder/inputs/SelectInput';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

const countryOptions = [
  { label: 'United States', value: 'us' },
  { label: 'Canada', value: 'ca' },
  { label: 'United Kingdom', value: 'uk' },
];

function SingleSelectFixture() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control, watch } = useForm<any>({ defaultValues: { country: '' } });
  const value = watch('country');
  return (
    <>
      <SelectInput
        fieldConfig={{
          name: 'country',
          label: 'Country',
          type: FIELD_TYPE.SELECT,
          options: countryOptions,
          placeholder: 'Pick a country',
        }}
        control={control}
      />
      <div data-testid="value">{value as string}</div>
    </>
  );
}

describe('SelectInput — single', () => {
  it('renders a combobox', () => {
    renderWithTheme(<SingleSelectFixture />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows placeholder when nothing is selected', () => {
    renderWithTheme(<SingleSelectFixture />);
    expect(screen.getByText('Pick a country')).toBeInTheDocument();
  });

  it('selects a value', async () => {
    const user = userEvent.setup();
    renderWithTheme(<SingleSelectFixture />);
    await user.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    await user.click(within(listbox).getByText('Canada'));
    expect(screen.getByTestId('value').textContent).toBe('ca');
  });
});

describe('SelectInput — multiple', () => {
  function MultiSelectFixture() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { control, watch } = useForm<any>({ defaultValues: { tags: [] } });
    const value = watch('tags');
    return (
      <>
        <SelectInput
          fieldConfig={{
            name: 'tags',
            label: 'Tags',
            type: FIELD_TYPE.SELECT,
            multiple: true,
            options: [
              { label: 'React', value: 'react' },
              { label: 'Vue', value: 'vue' },
              { label: 'Angular', value: 'angular' },
            ],
            placeholder: 'Select frameworks',
          }}
          control={control}
        />
        <div data-testid="value">{JSON.stringify(value)}</div>
      </>
    );
  }

  it('renders checkboxes inside options for multi-select', async () => {
    const user = userEvent.setup();
    renderWithTheme(<MultiSelectFixture />);
    await user.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getAllByRole('checkbox').length).toBeGreaterThan(0);
  });

  it('shows placeholder when nothing is selected', () => {
    renderWithTheme(<MultiSelectFixture />);
    expect(screen.getByText('Select frameworks')).toBeInTheDocument();
  });

  it('renderValue joins selected option labels with comma', async () => {
    const user = userEvent.setup();
    renderWithTheme(<MultiSelectFixture />);
    await user.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    await user.click(within(listbox).getByText('React'));
    await user.click(within(listbox).getByText('Vue'));
    // Close the listbox
    await user.keyboard('{Escape}');
    expect(screen.getByRole('combobox')).toHaveTextContent('React, Vue');
  });

  it('accumulates selected values correctly', async () => {
    const user = userEvent.setup();
    renderWithTheme(<MultiSelectFixture />);
    await user.click(screen.getByRole('combobox'));
    const listbox = screen.getByRole('listbox');
    await user.click(within(listbox).getByText('Angular'));
    await user.keyboard('{Escape}');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(JSON.parse(screen.getByTestId('value').textContent!)).toEqual(['angular']);
  });
});
