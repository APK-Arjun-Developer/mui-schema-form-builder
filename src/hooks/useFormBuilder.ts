import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { FIELD_TYPE, type FieldConfig, type FormBuilderProps } from '../components/form-builder/types/field.types';

/** Public options type for useFormBuilder — deliberately named for the public API. */
export type UseFormBuilderOptions<TSchema extends z.ZodType> = Pick<
  FormBuilderProps<TSchema>,
  'fields' | 'schema' | 'onReset' | 'validationMode'
>;

function buildDefaultValues(fields: FieldConfig[]): Record<string, unknown> {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    if (field.defaultValue !== undefined) {
      acc[field.name] = field.defaultValue;
      return acc;
    }

    if (field.multiple || (field.type === FIELD_TYPE.CHECKBOX && field.options)) {
      acc[field.name] = [];
    } else if (field.type === FIELD_TYPE.CHECKBOX) {
      acc[field.name] = false;
    } else {
      acc[field.name] = '';
    }

    return acc;
  }, {});
}

export const useFormBuilder = <TSchema extends z.ZodType>({
  fields,
  schema,
  onReset,
  validationMode,
}: UseFormBuilderOptions<TSchema>) => {
  const defaultValues = useMemo(() => buildDefaultValues(fields), [fields]);

  // We use zodResolver without the generic form-values type because z.infer<TSchema>
  // cannot be proved to extend FieldValues at the constraint level. The public onSubmit
  // callback on FormBuilderProps<TSchema> carries the correct inferred type — the
  // internal machinery intentionally uses the untyped form to bridge the gap.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as Record<string, unknown>,
    mode: validationMode ?? 'onTouched',
    shouldFocusError: true,
  });

  const { reset } = methods;

  const handleFormReset = useCallback(() => {
    reset(defaultValues as Record<string, unknown>);
    onReset?.();
  }, [reset, defaultValues, onReset]);

  return {
    methods,
    defaultValues,
    handleFormReset,
  };
};
