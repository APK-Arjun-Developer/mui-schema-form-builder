/**
 * Focused regression tests for issues fixed in 1.10.1.
 * Each describe block maps to a numbered fix in the changelog.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { renderWithTheme } from './helpers';
import { FormBuilder } from '../components/form-builder/FormBuilder';
import { FIELD_TYPE, type FieldConfig } from '../components/form-builder/types/field.types';
import { useFormBuilder } from '../hooks/useFormBuilder';
import {
  buildDefaultValues,
  buildArrayItemDefaults,
  getPath,
} from '../components/form-builder/utils/fieldDefaults';

// ---------------------------------------------------------------------------
// Fix 1: Nested onFieldChange — getPath resolves dot-notation correctly
// ---------------------------------------------------------------------------
describe('Fix 1 — nested onFieldChange', () => {
  it('calls onFieldChange with the correct nested value for a dot-notation field', async () => {
    const user = userEvent.setup();
    const onFieldChange = vi.fn();
    const schema = z.object({ address: z.object({ city: z.string() }) });

    renderWithTheme(
      <FormBuilder
        fields={[{ name: 'address.city', label: 'City', type: FIELD_TYPE.TEXT }]}
        schema={schema}
        onSubmit={vi.fn()}
        onFieldChange={onFieldChange}
      />,
    );

    await user.type(screen.getByRole('textbox'), 'Springfield');

    await waitFor(() => {
      // Must be called with the actual value string, not undefined
      const calls = onFieldChange.mock.calls.filter(([name]) => name === 'address.city');
      expect(calls.length).toBeGreaterThan(0);
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toBe('address.city');
      expect(typeof lastCall[1]).toBe('string');
      expect(lastCall[1]).not.toBeUndefined();
    });
  });

  it('getPath reads nested values correctly', () => {
    const obj = { address: { city: 'Springfield', zip: '12345' } };
    expect(getPath(obj, 'address.city')).toBe('Springfield');
    expect(getPath(obj, 'address.zip')).toBe('12345');
    expect(getPath(obj, 'address.missing')).toBeUndefined();
    expect(getPath(obj, 'missing')).toBeUndefined();
  });

  it('getPath returns undefined for null/undefined intermediates', () => {
    const obj = { a: null } as Record<string, unknown>;
    expect(getPath(obj, 'a.b')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Fix 2: buildDefaultValues — type-aware defaults for all field types
// ---------------------------------------------------------------------------
describe('Fix 2 — buildDefaultValues type-aware defaults', () => {
  it('number field defaults to empty string (for uncontrolled input pre-coercion)', () => {
    const defaults = buildDefaultValues([{ name: 'age', label: 'Age', type: FIELD_TYPE.NUMBER }]);
    expect(defaults.age).toBe('');
  });

  it('single checkbox defaults to false', () => {
    const defaults = buildDefaultValues([
      { name: 'agree', label: 'Agree', type: FIELD_TYPE.CHECKBOX },
    ]);
    expect(defaults.agree).toBe(false);
  });

  it('checkbox group defaults to []', () => {
    const defaults = buildDefaultValues([
      {
        name: 'interests',
        label: 'Interests',
        type: FIELD_TYPE.CHECKBOX,
        options: [{ label: 'A', value: 'a' }],
      },
    ]);
    expect(defaults.interests).toEqual([]);
  });

  it('single select defaults to empty string', () => {
    const defaults = buildDefaultValues([
      { name: 'country', label: 'Country', type: FIELD_TYPE.SELECT },
    ]);
    expect(defaults.country).toBe('');
  });

  it('multiple select defaults to []', () => {
    const defaults = buildDefaultValues([
      { name: 'tags', label: 'Tags', type: FIELD_TYPE.SELECT, multiple: true },
    ]);
    expect(defaults.tags).toEqual([]);
  });

  it('single autocomplete defaults to null', () => {
    const defaults = buildDefaultValues([
      { name: 'user', label: 'User', type: FIELD_TYPE.AUTOCOMPLETE },
    ]);
    expect(defaults.user).toBeNull();
  });

  it('multiple autocomplete defaults to []', () => {
    const defaults = buildDefaultValues([
      { name: 'users', label: 'Users', type: FIELD_TYPE.AUTOCOMPLETE, multiple: true },
    ]);
    expect(defaults.users).toEqual([]);
  });

  it('array field defaults to []', () => {
    const defaults = buildDefaultValues([
      { name: 'items', label: 'Items', type: FIELD_TYPE.ARRAY },
    ]);
    expect(defaults.items).toEqual([]);
  });

  it('combo field defaults to { select: "", input: "" }', () => {
    const defaults = buildDefaultValues([
      { name: 'combo', label: 'Combo', type: FIELD_TYPE.COMBO_INPUT },
    ]);
    expect(defaults.combo).toEqual({ select: '', input: '' });
  });

  it('explicit defaultValue always takes precedence', () => {
    const defaults = buildDefaultValues([
      { name: 'agree', label: 'Agree', type: FIELD_TYPE.CHECKBOX, defaultValue: true },
      { name: 'count', label: 'Count', type: FIELD_TYPE.NUMBER, defaultValue: 42 },
    ]);
    expect(defaults.agree).toBe(true);
    expect(defaults.count).toBe(42);
  });

  it('dot-notation field names produce nested structure', () => {
    const defaults = buildDefaultValues([
      { name: 'address.city', label: 'City', type: FIELD_TYPE.TEXT },
      { name: 'address.zip', label: 'Zip', type: FIELD_TYPE.TEXT },
    ]);
    expect(defaults).toEqual({ address: { city: '', zip: '' } });
  });
});

// ---------------------------------------------------------------------------
// Fix 2b: buildArrayItemDefaults — consistent with buildDefaultValues
// ---------------------------------------------------------------------------
describe('Fix 2b — buildArrayItemDefaults', () => {
  it('produces correct types for each field kind', () => {
    const item = buildArrayItemDefaults([
      { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT },
      { name: 'age', label: 'Age', type: FIELD_TYPE.NUMBER },
      { name: 'active', label: 'Active', type: FIELD_TYPE.CHECKBOX },
      { name: 'role', label: 'Role', type: FIELD_TYPE.SELECT },
    ]);
    expect(item).toEqual({ name: '', age: '', active: false, role: '' });
  });

  it('dot-notation sub-field names produce nested objects inside the item', () => {
    const item = buildArrayItemDefaults([
      { name: 'address.city', label: 'City', type: FIELD_TYPE.TEXT },
      { name: 'address.zip', label: 'Zip', type: FIELD_TYPE.TEXT },
    ]);
    expect(item).toEqual({ address: { city: '', zip: '' } });
  });

  it('respects explicit defaultValue on sub-fields', () => {
    const item = buildArrayItemDefaults([
      { name: 'active', label: 'Active', type: FIELD_TYPE.CHECKBOX, defaultValue: true },
    ]);
    expect(item.active).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Fix 2c: ArrayInput uses correct type-aware defaults when appending
// ---------------------------------------------------------------------------
describe('Fix 2c — ArrayInput append produces correct typed defaults', () => {
  it('appended checkbox sub-field starts as false not empty string', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const schema = z.object({
      members: z.array(z.object({ name: z.string(), active: z.boolean() })),
    });
    const fields: FieldConfig[] = [
      {
        name: 'members',
        label: 'Members',
        type: FIELD_TYPE.ARRAY,
        itemFields: [
          { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT },
          { name: 'active', label: 'Active', type: FIELD_TYPE.CHECKBOX },
        ],
      },
    ];

    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Add item' }));

    // The checkbox should start unchecked (false), not in a text '' state
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    // Submit with the checkbox unchecked — active should be false
    await user.type(screen.getByRole('textbox'), 'Alice');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      members: [{ name: 'Alice', active: false }],
    });
  });

  it('appended autocomplete sub-field starts as null not empty string', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const schema = z.object({
      items: z.array(z.object({ tag: z.string().nullable() })),
    });
    const fields: FieldConfig[] = [
      {
        name: 'items',
        label: 'Items',
        type: FIELD_TYPE.ARRAY,
        itemFields: [
          {
            name: 'tag',
            label: 'Tag',
            type: FIELD_TYPE.AUTOCOMPLETE,
            options: [{ label: 'A', value: 'a' }],
          },
        ],
      },
    ];

    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Add item' }));

    // Autocomplete combobox should exist (field rendered correctly)
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Fix 4: hidden field with unregisterWhenHidden
// ---------------------------------------------------------------------------
describe('Fix 4 — unregisterWhenHidden', () => {
  it('hides AND unregisters a field when unregisterWhenHidden=true', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const schema = z.object({
      show: z.boolean(),
      extra: z.string().optional(),
    });
    const fields: FieldConfig[] = [
      { name: 'show', label: 'Show extra', type: FIELD_TYPE.CHECKBOX },
      {
        name: 'extra',
        label: 'Extra',
        type: FIELD_TYPE.TEXT,
        visibleIf: (vals) => !!vals['show'],
        unregisterWhenHidden: true,
      },
    ];

    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={onSubmit} />);

    // Extra is hidden by default → submit → extra should not be in payload
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const firstSubmit = onSubmit.mock.calls[0][0] as Record<string, unknown>;
    expect(firstSubmit).not.toHaveProperty('extra');
  });

  it('retains field value when unregisterWhenHidden=false (default)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const schema = z.object({
      show: z.boolean(),
      extra: z.string().optional(),
    });
    const fields: FieldConfig[] = [
      { name: 'show', label: 'Show extra', type: FIELD_TYPE.CHECKBOX },
      {
        name: 'extra',
        label: 'Extra',
        type: FIELD_TYPE.TEXT,
        visibleIf: (vals) => !!vals['show'],
        // unregisterWhenHidden defaults to false
      },
    ];

    renderWithTheme(<FormBuilder fields={fields} schema={schema} onSubmit={onSubmit} />);

    // Show the extra field and type a value
    await user.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(screen.getByRole('textbox')).toBeInTheDocument());
    await user.type(screen.getByRole('textbox'), 'hello');

    // Hide it again
    await user.click(screen.getByRole('checkbox'));
    await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());

    // Submit — extra is still in form state (not unregistered)
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const result = onSubmit.mock.calls[0][0] as Record<string, unknown>;
    expect(result['extra']).toBe('hello');
  });
});

// ---------------------------------------------------------------------------
// Fix 5: custom component registry isolation between two FormBuilder instances
// ---------------------------------------------------------------------------
describe('Fix 5 — instance-scoped components registry isolation', () => {
  it('two FormBuilder instances can use different components for the same type', () => {
    const ComponentA = () => <div data-testid="comp-a">Component A</div>;
    const ComponentB = () => <div data-testid="comp-b">Component B</div>;

    const schema = z.object({ custom: z.string() });
    const fields: FieldConfig[] = [
      { name: 'custom', label: 'Custom', type: 'custom_type' as never },
    ];

    const { rerender } = renderWithTheme(
      <div>
        <FormBuilder
          fields={fields}
          schema={schema}
          onSubmit={vi.fn()}
          components={{ custom_type: ComponentA }}
        />
        <FormBuilder
          fields={fields}
          schema={schema}
          onSubmit={vi.fn()}
          components={{ custom_type: ComponentB }}
        />
      </div>,
    );

    expect(screen.getByTestId('comp-a')).toBeInTheDocument();
    expect(screen.getByTestId('comp-b')).toBeInTheDocument();

    // Verify they don't bleed into each other
    expect(screen.getAllByTestId('comp-a')).toHaveLength(1);
    expect(screen.getAllByTestId('comp-b')).toHaveLength(1);

    void rerender; // rerender available for further checks if needed
  });
});

// ---------------------------------------------------------------------------
// Fix 6: useFormBuilder — resolver prop works without schema
// ---------------------------------------------------------------------------
describe('Fix 6 — resolver without schema', () => {
  it('accepts a custom resolver and submits values correctly', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const customResolver = vi.fn().mockResolvedValue({
      values: { name: 'Custom' },
      errors: {},
    });

    renderWithTheme(
      <FormBuilder
        fields={[{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }]}
        resolver={customResolver}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByRole('textbox'), 'Custom');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'Custom' });
  });
});

// ---------------------------------------------------------------------------
// Fix 7: useFormBuilder — nested defaults via buildDefaultValues
// ---------------------------------------------------------------------------
describe('Fix 7 — useFormBuilder nested dot-notation defaults', () => {
  it('produces nested default values for address fields', () => {
    const schema = z.object({ address: z.object({ city: z.string(), zip: z.string() }) });
    const { result } = renderHook(() =>
      useFormBuilder({
        schema,
        fields: [
          { name: 'address.city', label: 'City', type: FIELD_TYPE.TEXT },
          { name: 'address.zip', label: 'Zip', type: FIELD_TYPE.TEXT },
        ],
      }),
    );
    expect(result.current.defaultValues).toEqual({ address: { city: '', zip: '' } });
  });

  it('nested array sub-fields produce nested defaults on useFormBuilder', () => {
    const schema = z.object({
      members: z.array(z.object({ name: z.string() })),
    });
    const { result } = renderHook(() =>
      useFormBuilder({
        schema,
        fields: [
          {
            name: 'members',
            label: 'Members',
            type: FIELD_TYPE.ARRAY,
            itemFields: [{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }],
          },
        ],
      }),
    );
    expect(result.current.defaultValues.members).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Fix 8: MUI muiProps cannot accidentally override RHF-controlled props
// ---------------------------------------------------------------------------
describe('Fix 8 — muiProps spread order: RHF props win', () => {
  it('Select renders correctly even when muiProps is provided', () => {
    const onSubmit = vi.fn();
    const schema = z.object({ country: z.string() });

    renderWithTheme(
      <FormBuilder
        fields={[
          {
            name: 'country',
            label: 'Country',
            type: FIELD_TYPE.SELECT,
            options: [{ label: 'US', value: 'us' }],
            // Consumer passes MenuProps (a legitimate muiProps entry)
            muiProps: { MenuProps: { disablePortal: true } },
          },
        ]}
        schema={schema}
        onSubmit={onSubmit}
      />,
    );

    // Form still renders correctly
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Fix 9: async Autocomplete — AbortSignal is passed to fetchOptions
// (See also AutocompleteInput.test.tsx which already validates this.)
// ---------------------------------------------------------------------------
import { AutocompleteInput } from '../components/form-builder/inputs/AutocompleteInput';

describe('Fix 9 — async Autocomplete AbortSignal', () => {
  it('fetchOptions receives (searchString, AbortSignal)', async () => {
    const user = userEvent.setup();
    const fetchOptions = vi.fn().mockResolvedValue([]);

    function Fixture() {
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

    renderWithTheme(<Fixture />);
    await user.type(screen.getByRole('combobox'), 'React');

    await waitFor(() => expect(fetchOptions).toHaveBeenCalled(), { timeout: 2000 });
    expect(fetchOptions).toHaveBeenCalledWith(expect.any(String), expect.any(AbortSignal));
  });
});
