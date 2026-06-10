# API Reference — mui-schema-form-builder

## Table of Contents

1. [FormBuilder](#formbuilder)
2. [FieldConfig](#fieldconfig)
3. [FIELD_TYPE](#field_type)
4. [Hooks — useFormBuilder](#hooks--useformbuilder)
5. [registerFieldType](#registerfieldtype)
6. [createDatePickerInput](#createdatepickerinput)
7. [FormBuilderHandle (imperative ref)](#formbuilderhandle-imperative-ref)
8. [Individual input components](#individual-input-components)
9. [Types](#types)

---

## FormBuilder

Main schema-driven form component.

```tsx
import { FormBuilder } from 'mui-schema-form-builder';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | `FieldConfig[]` | **required** | Ordered list of field definitions. |
| `schema` | `z.ZodType` | — | Zod schema used for validation and type inference. Required when `resolver` is absent. |
| `resolver` | `Resolver` | — | A react-hook-form resolver (e.g. `yupResolver`, `valibotResolver`). Alternative to `schema`. |
| `onSubmit` | `(data: z.infer<TSchema>) => void \| Promise<void>` | **required** | Called with validated, typed form data on successful submission. |
| `onCancel` | `() => void` | — | Renders a Cancel button when provided. |
| `onReset` | `() => void` | — | Renders a Reset button when provided; called after the form resets. |
| `onChange` | `(values: FieldValues) => void` | — | Called on every field value change with the full form snapshot. |
| `onFieldChange` | `(name: string, value: unknown) => void` | — | Called when a single field changes with its name and new value. |
| `submitText` | `string` | `"Submit"` | Label for the submit button. |
| `cancelText` | `string` | `"Cancel"` | Label for the cancel button. |
| `resetText` | `string` | `"Reset"` | Label for the reset button. |
| `spacing` | `number` | `2` | MUI Grid spacing between fields. |
| `validationMode` | `keyof ValidationMode` | `"onTouched"` | When react-hook-form triggers validation. |
| `virtualize` | `boolean` | `false` | Enables react-window list virtualization. Requires `react-window` peer dep. |
| `virtualizeHeight` | `number` | `500` | Height (px) of the virtualized container. |
| `virtualizeItemSize` | `number` | `80` | Height (px) per virtualized row. |
| `sx` | `SxProps` | — | MUI sx prop forwarded to the outer Paper container. |
| `ref` | `React.Ref<FormBuilderHandle>` | — | Imperative ref — see [FormBuilderHandle](#formbuilderhandle-imperative-ref). |

### Basic example

```tsx
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

<FormBuilder
  schema={schema}
  fields={[
    { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, required: true },
    { name: 'email', label: 'Email', type: FIELD_TYPE.TEXT },
  ]}
  onSubmit={(data) => console.log(data)}
/>
```

### Using a custom resolver (Yup / Valibot)

```tsx
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const yupSchema = yup.object({ name: yup.string().min(2).required() });

<FormBuilder
  resolver={yupResolver(yupSchema)}
  fields={[{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }]}
  onSubmit={(data) => console.log(data)}
/>
```

---

## FieldConfig

Describes a single form field.

```tsx
import type { FieldConfig } from 'mui-schema-form-builder';
```

### Common properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Field key in the form values. Dot-notation supported (`"address.city"`). |
| `label` | `string` | Human-readable label. |
| `type` | `FieldType \| string` | One of the `FIELD_TYPE` constants or a custom string (see `registerFieldType`). |
| `defaultValue` | `unknown` | Initial value for this field. |
| `placeholder` | `string` | Input placeholder text. |
| `disabled` | `boolean` | Disables the field. |
| `required` | `boolean` | Renders a required indicator (`*`). Validation is enforced by the schema. |
| `fullWidth` | `boolean` | Stretches the input to 100% width (default `true`). |
| `size` | `"small" \| "medium"` | MUI input size. |
| `grid` | `GridConfig` | MUI Grid size breakpoints (`xs`, `sm`, `md`, `lg`, `xl`). |
| `visibleIf` | `(values: FieldValues) => boolean` | Hide the field when this returns `false`. Only fields with this prop subscribe to form-wide state. |
| `muiProps` | `Record<string, unknown>` | Extra props forwarded directly to the underlying MUI component. |
| `section` | `string` | Groups consecutive same-section fields under a shared section header. |

### Type-specific properties

#### TEXT / TEXTAREA / DATE

| Property | Type | Description |
|----------|------|-------------|
| `rows` | `number` | Visible text rows — TEXTAREA only (default `4`). |

#### NUMBER

| Property | Type | Description |
|----------|------|-------------|
| `min` | `number` | Minimum value. Also sets the HTML `min` attribute. |
| `max` | `number` | Maximum value. Also sets the HTML `max` attribute. |
| `step` | `number` | Step increment. Also sets the HTML `step` attribute. |

#### SELECT / AUTOCOMPLETE / RADIO / CHECKBOX (group)

| Property | Type | Description |
|----------|------|-------------|
| `options` | `Option[]` | List of `{ label, value, disabled? }` items. |
| `multiple` | `boolean` | Enables multi-select (SELECT and AUTOCOMPLETE). |
| `fetchOptions` | `(input: string) => Promise<Option[]>` | Async option fetching — AUTOCOMPLETE only. |

#### ARRAY

| Property | Type | Description |
|----------|------|-------------|
| `itemFields` | `FieldConfig[]` | Sub-fields rendered for each array item. |
| `addLabel` | `string` | Label for the "add item" button (default `"Add item"`). |
| `removeLabel` | `string` | Label for the per-item "remove" button (default `"Remove"`). |
| `minItems` | `number` | Minimum items; hides Remove when at this count. |
| `maxItems` | `number` | Maximum items; hides Add when at this count. |

---

## FIELD_TYPE

Const object of built-in field type strings.

```tsx
import { FIELD_TYPE } from 'mui-schema-form-builder';
```

| Key | Value | Rendered as |
|-----|-------|-------------|
| `TEXT` | `"text"` | MUI TextField (text) |
| `TEXTAREA` | `"textarea"` | MUI TextField (multiline) |
| `NUMBER` | `"number"` | MUI TextField (number) with numeric coercion |
| `DATE` | `"date"` | MUI TextField (type="date") |
| `DATE_PICKER` | `"datepicker"` | MUI DatePicker — must register via `createDatePickerInput` |
| `SELECT` | `"select"` | MUI Select |
| `AUTOCOMPLETE` | `"autocomplete"` | MUI Autocomplete |
| `RADIO` | `"radio"` | MUI RadioGroup |
| `CHECKBOX` | `"checkbox"` | MUI Checkbox (single) or FormGroup (with options) |
| `ARRAY` | `"array"` | Dynamic list with add/remove, powered by `useFieldArray` |

---

## Hooks — useFormBuilder

Low-level hook for building custom form layouts.

```tsx
import { useFormBuilder } from 'mui-schema-form-builder';
```

```tsx
const { methods, defaultValues, handleFormReset } = useFormBuilder({
  fields,
  schema,           // or: resolver
  onReset,
  validationMode,
  onChange,
  onFieldChange,
});
```

Returns the `react-hook-form` `UseFormReturn` object (`methods`), the computed default values, and a stable reset handler. Use `<FormProvider>` from `react-hook-form` to pass `methods` down to custom field components.

---

## registerFieldType

Register a custom component for a field type string.

```tsx
import { registerFieldType } from 'mui-schema-form-builder';

registerFieldType('rating', RatingInput);
```

The component must accept `{ fieldConfig: FieldConfig; control: Control }` (the `CustomFieldProps` type). Call once before any `FormBuilder` using that type renders.

---

## createDatePickerInput

Factory that produces a `FormBuilder`-compatible DatePicker input. The consumer provides the imported `DatePicker` component so `@mui/x-date-pickers` remains an optional peer dep.

```tsx
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createDatePickerInput, registerFieldType, FIELD_TYPE } from 'mui-schema-form-builder';

// Call once, at app startup.
registerFieldType(FIELD_TYPE.DATE_PICKER, createDatePickerInput(DatePicker));
```

**Requirements:**
- `@mui/x-date-pickers` must be installed.
- Wrap your app with `<LocalizationProvider>`.
- Values are stored as ISO date strings — use `z.string().datetime()` in your schema.

---

## FormBuilderHandle (imperative ref)

Access form methods imperatively via a `ref` on `FormBuilder`.

```tsx
import { useRef } from 'react';
import type { FormBuilderHandle } from 'mui-schema-form-builder';

const ref = useRef<FormBuilderHandle>(null);

<FormBuilder ref={ref} ... />

// Later:
ref.current?.submit();
ref.current?.reset();
ref.current?.setError('email', { type: 'manual', message: 'Already taken' });
const values = ref.current?.getValues();
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `reset` | `() => void` | Reset to default values; calls `onReset`. |
| `submit` | `() => void` | Trigger validation and call `onSubmit` if valid. |
| `setError` | `(name: string, error: { type: string; message: string }) => void` | Set a field-level error manually. |
| `getValues` | `() => FieldValues` | Return current values without triggering validation. |

---

## Individual input components

All inputs are exported for use in custom form layouts with `react-hook-form`:

```tsx
import { TextInput, NumberInput, SelectInput, AutocompleteInput,
         CheckboxInput, RadioInput, ArrayInput } from 'mui-schema-form-builder';
```

Each component accepts `{ fieldConfig: FieldConfig; control: Control }`.

---

## Types

```tsx
import type {
  FieldConfig,       // Single field definition
  FieldType,         // Union of FIELD_TYPE values (+ string for custom types)
  FormBuilderProps,  // All props accepted by FormBuilder
  FormBuilderHandle, // Imperative ref shape
  Option,            // { label: string; value: string | number; disabled?: boolean }
  GridConfig,        // { xs?, sm?, md?, lg?, xl? }
  CustomFieldProps,  // { fieldConfig: FieldConfig; control: Control }
  UseFormBuilderOptions, // Options accepted by useFormBuilder
} from 'mui-schema-form-builder';
```
