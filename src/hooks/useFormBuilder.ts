import { useCallback, useEffect, useMemo } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import type { FormBuilderProps } from '../components/form-builder/types/field.types';
import { buildDefaultValues, getPath } from '../components/form-builder/utils/fieldDefaults';

/** Public options type for useFormBuilder — deliberately named for the public API. */
export type UseFormBuilderOptions<TSchema extends z.ZodType = z.ZodType> = Pick<
  FormBuilderProps<TSchema>,
  'fields' | 'schema' | 'resolver' | 'onReset' | 'validationMode' | 'onChange' | 'onFieldChange'
>;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zodResolver overloads require FieldValues as the input type; TSchema satisfies this at runtime
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
        // Use getPath to correctly resolve dot-notation names (e.g. "address.city")
        // from the nested object RHF stores: { address: { city: value } }.
        onFieldChange?.(name, getPath(values as Record<string, unknown>, name));
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
