import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { z } from 'zod';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

const schema = z.object({ name: z.string(), age: z.number() });

describe('useFormBuilder — defaultValues', () => {
  it('text field defaults to empty string', () => {
    const { result } = renderHook(() =>
      useFormBuilder({
        schema,
        fields: [{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }],
      }),
    );
    expect(result.current.defaultValues['name']).toBe('');
  });

  it('number field defaults to empty string (pre-coercion)', () => {
    const { result } = renderHook(() =>
      useFormBuilder({
        schema,
        fields: [{ name: 'age', label: 'Age', type: FIELD_TYPE.NUMBER }],
      }),
    );
    expect(result.current.defaultValues['age']).toBe('');
  });

  it('single checkbox defaults to false', () => {
    const { result } = renderHook(() =>
      useFormBuilder({
        schema,
        fields: [{ name: 'name', label: 'Accept', type: FIELD_TYPE.CHECKBOX }],
      }),
    );
    expect(result.current.defaultValues['name']).toBe(false);
  });

  it('checkbox group (with options) defaults to []', () => {
    const { result } = renderHook(() =>
      useFormBuilder({
        schema,
        fields: [
          {
            name: 'name',
            label: 'Interests',
            type: FIELD_TYPE.CHECKBOX,
            options: [{ label: 'A', value: 'a' }],
          },
        ],
      }),
    );
    expect(result.current.defaultValues['name']).toEqual([]);
  });

  it('multiple select defaults to []', () => {
    const { result } = renderHook(() =>
      useFormBuilder({
        schema,
        fields: [{ name: 'name', label: 'Skills', type: FIELD_TYPE.SELECT, multiple: true }],
      }),
    );
    expect(result.current.defaultValues['name']).toEqual([]);
  });

  it('respects explicit defaultValue', () => {
    const { result } = renderHook(() =>
      useFormBuilder({
        schema,
        fields: [{ name: 'age', label: 'Age', type: FIELD_TYPE.NUMBER, defaultValue: 42 }],
      }),
    );
    expect(result.current.defaultValues['age']).toBe(42);
  });

  it('returns handleFormReset as a function', () => {
    const { result } = renderHook(() =>
      useFormBuilder({ schema, fields: [{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }] }),
    );
    expect(typeof result.current.handleFormReset).toBe('function');
  });

  it('handleFormReset calls onReset callback', () => {
    let called = false;
    const { result } = renderHook(() =>
      useFormBuilder({
        schema,
        fields: [{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }],
        onReset: () => { called = true; },
      }),
    );
    result.current.handleFormReset();
    expect(called).toBe(true);
  });
});
