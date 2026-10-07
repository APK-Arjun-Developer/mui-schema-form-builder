import { useCallback, useEffect, useMemo } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import {
  FIELD_TYPE,
  type FieldConfig,
  type FormBuilderProps,
} from '../components/form-builder/types/field.types';

/** Public options type for useFormBuilder — deliberately named for the public API. */
export type UseFormBuilderOptions<TSchema extends z.ZodType = z.ZodType> = Pick<
  FormBuilderProps<TSchema>,
  'fields' | 'schema' | 'resolver' | 'onReset' | 'validationMode' | 'onChange' | 'onFieldChange'
>;

// Set a value at a dot-notation path (e.g. "address.city") inside a nested object.
function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let cursor = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (cursor[key] === undefined || typeof cursor[key] !== 'object' || cursor[key] === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

function buildDefaultValues(fields: FieldConfig[]): Record<string, unknown> {
  const acc: Record<string, unknown> = {};

  for (const field of fields) {
    let value: unknown;
    if (field.defaultValue !== undefined) {
      value = field.defaultValue;
    } else if (field.type === FIELD_TYPE.ARRAY) {
      value = [];
    } else if (field.type === FIELD_TYPE.CHECKBOX) {
      value = field.options ? [] : false;
    } else if (field.type === FIELD_TYPE.SELECT) {
      value = field.multiple ? [] : '';
    } else if (field.type === FIELD_TYPE.AUTOCOMPLETE) {
      value = field.multiple ? [] : null;
    } else if (field.type === FIELD_TYPE.COMBO_INPUT) {
      value = { select: '', input: '' };
    } else {
      value = '';
    }
    setPath(acc, field.name, value);
  }

  return acc;
}

export const useFormBuilder = <TSchema extends z.ZodType = z.ZodType>({
  fields,
  schema,
  resolver,
  onReset,
  validationMode,
  onChange,
  onFieldChange,
}: UseFormBuilderOptions<TSchema>) => {
  const defaultValues = useMemo(() => buildDefaultValues(fields), [fields]);

  // Derive the resolver: use the caller-provided resolver if given, otherwise
  // fall back to zodResolver. Neither being provided is a consumer mistake —
  // we warn once rather than throw so the form still renders.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zodResolver overloads don't accept ZodType directly
  const resolvedResolver = resolver ?? (schema ? zodResolver(schema as any) : undefined);
  if (!resolvedResolver) {
    console.warn('[mui-schema-form-builder] Either schema or resolver must be provided.');
  }

  const methods = useForm<FieldValues>({
    resolver: resolvedResolver,
    defaultValues: defaultValues as FieldValues,
    mode: validationMode ?? 'onTouched',
    shouldFocusError: true,
  });

  const { reset, watch } = methods;

  const handleFormReset = useCallback(() => {
    reset(defaultValues as FieldValues);
    onReset?.();
  }, [reset, defaultValues, onReset]);

  useEffect(() => {
    if (!onChange && !onFieldChange) return;
    const subscription = watch((values, { name }) => {
      onChange?.(values);
      if (name !== undefined) {
        onFieldChange?.(name, (values as Record<string, unknown>)[name]);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange, onFieldChange]);

  return {
    methods,
    defaultValues,
    handleFormReset,
  };
};
