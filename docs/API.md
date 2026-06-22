# API Reference — mui-schema-form-builder

## Table of Contents

1. [FormBuilder](#formbuilder)
2. [FormWizard](#formwizard)
3. [FieldConfig](#fieldconfig)
4. [FIELD_TYPE](#field_type)
5. [Read-only / display mode](#read-only--display-mode)
6. [i18n labels](#i18n-labels)
7. [Hooks — useFormBuilder](#hooks--useformbuilder)
8. [registerFieldType](#registerfieldtype)
9. [createDatePickerInput](#createdatepickerinput)
10. [FormBuilderHandle (imperative ref)](#formbuilderhandle-imperative-ref)
11. [Individual input components](#individual-input-components)
12. [Types](#types)

---

## FormBuilder

Main schema-driven form component.

```tsx
import { FormBuilder } from 'mui-schema-form-builder';
```

### Props

| Prop                 | Type                                                | Default       | Description                                                                                          |
| -------------------- | --------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `fields`             | `FieldConfig[]`                                     | **required**  | Ordered list of field definitions.                                                                   |
| `schema`             | `z.ZodType`                                         | —             | Zod schema for validation and type inference. Required unless `resolver` is provided.                |
| `resolver`           | `Resolver`                                          | —             | A react-hook-form resolver (e.g. `yupResolver`, `valibotResolver`). Alternative to `schema`.         |
| `onSubmit`           | `(data: z.infer<TSchema>) => void \| Promise<void>` | **required**  | Called with validated, typed form data on successful submission.                                     |
| `onCancel`           | `() => void`                                        | —             | Renders a Cancel button when provided.                                                               |
| `onReset`            | `() => void`                                        | —             | Renders a Reset button when provided; called after the form resets.                                  |
| `onChange`           | `(values: FieldValues) => void`                     | —             | Called on every field value change with the full form snapshot.                                      |
| `onFieldChange`      | `(name: string, value: unknown) => void`            | —             | Called when a single field changes with its name and new value.                                      |
| `readOnly`           | `boolean`                                           | `false`       | Render all fields as formatted display text instead of interactive inputs.                           |
| `labels`             | `FormBuilderLabels`                                 | —             | Override built-in UI strings (array add/remove labels, item label). See [i18n labels](#i18n-labels). |
| `submitText`         | `string`                                            | `"Submit"`    | Label for the submit button.                                                                         |
| `cancelText`         | `string`                                            | `"Cancel"`    | Label for the cancel button.                                                                         |
| `resetText`          | `string`                                            | `"Reset"`     | Label for the reset button.                                                                          |
| `spacing`            | `number`                                            | `2`           | MUI Grid spacing between fields.                                                                     |
| `validationMode`     | `keyof ValidationMode`                              | `"onTouched"` | When react-hook-form triggers validation.                                                            |
| `virtualize`         | `boolean`                                           | `false`       | Enable react-window virtualization. Requires `react-window` peer dep.                                |
| `virtualizeHeight`   | `number`                                            | `500`         | Height (px) of the virtualized container. Only used when `virtualize=true`.                          |
| `virtualizeItemSize` | `number`                                            | `80`          | Height (px) per virtualized row. Only used when `virtualize=true`.                                   |
| `sx`                 | `SxProps`                                           | —             | MUI sx prop forwarded to the outer Paper container.                                                  |
| `ref`                | `React.Ref<FormBuilderHandle>`                      | —             | Imperative handle — see [FormBuilderHandle](#formbuilderhandle-imperative-ref).                      |

### Quick example

```tsx
import { z } from 'zod';
import { FormBuilder, FIELD_TYPE } from 'mui-schema-form-builder';

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
/>;
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
/>;
```

### Section grouping

Fields with the same consecutive `section` value are rendered under a shared header with a divider.

```tsx
<FormBuilder
  fields={[
    { name: 'firstName', label: 'First Name', type: FIELD_TYPE.TEXT, section: 'Personal' },
    { name: 'lastName', label: 'Last Name', type: FIELD_TYPE.TEXT, section: 'Personal' },
    { name: 'email', label: 'Email', type: FIELD_TYPE.TEXT, section: 'Contact' },
  ]}
  schema={schema}
  onSubmit={fn}
/>
```

### Nested objects (dot-notation)

Field names may use dot-notation to map into nested Zod objects.

```tsx
const schema = z.object({
  address: z.object({ street: z.string(), city: z.string() }),
});

<FormBuilder
  schema={schema}
  fields={[
    { name: 'address.street', label: 'Street', type: FIELD_TYPE.TEXT },
    { name: 'address.city', label: 'City', type: FIELD_TYPE.TEXT },
  ]}
  onSubmit={fn}
/>;
```

---

## FormWizard

Multi-step form with MUI Stepper, per-step validation, and shared form state.

```tsx
import { FormWizard } from 'mui-schema-form-builder';
import type { WizardStep } from 'mui-schema-form-builder';
```

### Props

All `FormBuilder` props apply (except `onReset`, `virtualize`), plus:

| Prop         | Type           | Default      | Description                                                 |
| ------------ | -------------- | ------------ | ----------------------------------------------------------- |
| `steps`      | `WizardStep[]` | **required** | Ordered list of wizard steps.                               |
| `nextText`   | `string`       | `"Next"`     | Label for the Next button.                                  |
| `backText`   | `string`       | `"Back"`     | Label for the Back button.                                  |
| `submitText` | `string`       | `"Submit"`   | Label for the Submit button on the last step.               |
| `cancelText` | `string`       | `"Cancel"`   | Cancel button label (first step, when `onCancel` provided). |

### WizardStep

```typescript
interface WizardStep {
  label: string;
  description?: string; // Sub-text shown under the step dot in the Stepper
  fields: FieldConfig[];
}
```

### Per-step validation

Clicking **Next** calls `trigger(stepFieldNames)`. The wizard advances only when all current-step fields pass validation. The final **Submit** validates the entire schema.

### Example

```tsx
import { z } from 'zod';
import { FormWizard, FIELD_TYPE } from 'mui-schema-form-builder';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
  plan: z.string().min(1, 'Pick a plan'),
});

<FormWizard
  schema={schema}
  steps={[
    {
      label: 'Identity',
      fields: [{ name: 'name', label: 'Full Name', type: FIELD_TYPE.TEXT, required: true }],
    },
    {
      label: 'Contact',
      fields: [{ name: 'email', label: 'Email', type: FIELD_TYPE.TEXT, required: true }],
    },
    {
      label: 'Plan',
      fields: [
        {
          name: 'plan',
          label: 'Choose a plan',
          type: FIELD_TYPE.RADIO,
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Pro', value: 'pro' },
          ],
        },
      ],
    },
  ]}
  onSubmit={(data) => console.log(data)}
/>;
```

`FormWizard` supports `ref` with the same `FormBuilderHandle` interface (reset, submit, setError, getValues).

---

## FieldConfig

Describes a single form field.

```tsx
import type { FieldConfig } from 'mui-schema-form-builder';
```

### Common properties

| Property       | Type                               | Description                                                                                                          |
| -------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `name`         | `string`                           | Field key. Dot-notation supported (`"address.city"`).                                                                |
| `label`        | `string`                           | Human-readable label.                                                                                                |
| `type`         | `FieldType \| string`              | One of the `FIELD_TYPE` constants, or a custom string (see `registerFieldType`).                                     |
| `defaultValue` | `unknown`                          | Initial value for this field.                                                                                        |
| `placeholder`  | `string`                           | Input placeholder text.                                                                                              |
| `disabled`     | `boolean`                          | Disables the field.                                                                                                  |
| `required`     | `boolean`                          | Renders a required indicator (`*`). Validation is enforced by the schema.                                            |
| `fullWidth`    | `boolean`                          | Stretches the input to 100% width (default `true`).                                                                  |
| `size`         | `"small" \| "medium"`              | MUI input size.                                                                                                      |
| `grid`         | `GridConfig`                       | MUI Grid size breakpoints (`xs`, `sm`, `md`, `lg`, `xl`).                                                            |
| `visibleIf`    | `(values: FieldValues) => boolean` | Hide this field when the predicate returns `false`. Only fields with this prop subscribe to form-wide state changes. |
| `muiProps`     | `Record<string, unknown>`          | Extra props forwarded directly to the underlying MUI component.                                                      |
| `section`      | `string`                           | Groups consecutive same-section fields under a shared section header.                                                |

### Type-specific properties

#### TEXT / TEXTAREA / DATE

| Property | Description                                      |
| -------- | ------------------------------------------------ |
| `rows`   | Visible text rows — TEXTAREA only (default `4`). |

#### NUMBER

| Property | Description                                          |
| -------- | ---------------------------------------------------- |
| `min`    | Minimum value. Also sets the HTML `min` attribute.   |
| `max`    | Maximum value. Also sets the HTML `max` attribute.   |
| `step`   | Step increment. Also sets the HTML `step` attribute. |

#### SELECT / AUTOCOMPLETE / RADIO / CHECKBOX (group)

| Property       | Description                                                                         |
| -------------- | ----------------------------------------------------------------------------------- |
| `options`      | `Option[]` — list of `{ label, value, disabled? }` items.                           |
| `multiple`     | Enable multi-select (SELECT and AUTOCOMPLETE).                                      |
| `fetchOptions` | `(input: string) => Promise<Option[]>` — async option fetching (AUTOCOMPLETE only). |

#### ARRAY

| Property      | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `itemFields`  | `FieldConfig[]` — sub-fields rendered for each array item.                                   |
| `addLabel`    | Label for the "add item" button (default: context `labels.arrayAddItem` → `"Add item"`).     |
| `removeLabel` | Label for the per-item "remove" button (default: context `labels.arrayRemove` → `"Remove"`). |
| `minItems`    | Minimum items; hides Remove when at this count.                                              |
| `maxItems`    | Maximum items; hides Add when at this count.                                                 |

---

## FIELD_TYPE

Const object of built-in field type strings.

```tsx
import { FIELD_TYPE } from 'mui-schema-form-builder';
```

| Key            | Value            | Rendered as                                                 |
| -------------- | ---------------- | ----------------------------------------------------------- |
| `TEXT`         | `"text"`         | MUI TextField (text)                                        |
| `TEXTAREA`     | `"textarea"`     | MUI TextField (multiline)                                   |
| `NUMBER`       | `"number"`       | MUI TextField (number) — coerces to `number` before storing |
| `DATE`         | `"date"`         | MUI TextField (type="date")                                 |
| `DATE_PICKER`  | `"datepicker"`   | MUI DatePicker — register via `createDatePickerInput`       |
| `SELECT`       | `"select"`       | MUI Select                                                  |
| `AUTOCOMPLETE` | `"autocomplete"` | MUI Autocomplete                                            |
| `RADIO`        | `"radio"`        | MUI RadioGroup inside a fieldset                            |
| `CHECKBOX`     | `"checkbox"`     | MUI Checkbox (boolean) or FormGroup (with `options`)        |
| `ARRAY`        | `"array"`        | Dynamic list with add/remove, powered by `useFieldArray`    |

---

## Read-only / display mode

Pass `readOnly` to render all fields as formatted display text. Useful for review or confirmation screens.

```tsx
<FormBuilder fields={fields} schema={schema} onSubmit={fn} readOnly />
```

**Display rendering per field type:**

| Type                            | Read-only output                         |
| ------------------------------- | ---------------------------------------- |
| TEXT / TEXTAREA / NUMBER / DATE | Plain text value, or `—` if empty        |
| SELECT single / RADIO           | Resolved option label                    |
| SELECT multiple                 | Chips for each selected label            |
| CHECKBOX (boolean)              | `"Yes"` or `"No"`                        |
| CHECKBOX (group)                | Chips for each checked option            |
| AUTOCOMPLETE                    | Option label (object) or raw string      |
| AUTOCOMPLETE multiple           | Chips                                    |
| ARRAY                           | Each item rendered recursively in a card |
| Custom types                    | `String(value)`                          |

**Read-only toggle pattern** — switch between edit and preview with one prop:

```tsx
const [readOnly, setReadOnly] = useState(false);

<FormBuilder
  fields={fields}
  schema={schema}
  onSubmit={(data) => {
    setReadOnly(true);
    save(data);
  }}
  readOnly={readOnly}
/>;
{
  readOnly && <Button onClick={() => setReadOnly(false)}>Edit</Button>;
}
```

---

## i18n labels

Override built-in UI strings via the `labels` prop. Applies to both `FormBuilder` and `FormWizard`.

```tsx
<FormBuilder
  fields={fields}
  schema={schema}
  onSubmit={fn}
  labels={{
    arrayAddItem: 'Agregar elemento',
    arrayRemove: 'Eliminar',
    arrayItemLabel: (i) => `Elemento ${i + 1}`,
  }}
/>
```

### FormBuilderLabels

```typescript
interface FormBuilderLabels {
  /** Label for the ARRAY field add button. Default: "Add item". */
  arrayAddItem?: string;
  /** Label for the per-item remove button. Default: "Remove". */
  arrayRemove?: string;
  /** Header shown above each item. Receives the 1-based index. Default: (i) => `Item ${i+1}`. */
  arrayItemLabel?: (index: number) => string;
}
```

> **Priority:** field-level `addLabel` / `removeLabel` on `FieldConfig` take precedence over `labels` defaults.

---

## Hooks — useFormBuilder

Low-level hook for building custom form layouts that use the same field registry and default-value logic.

```tsx
import { useFormBuilder } from 'mui-schema-form-builder';
```

```tsx
const { methods, defaultValues, handleFormReset } = useFormBuilder({
  fields,
  schema, // or: resolver
  onReset,
  validationMode,
  onChange,
  onFieldChange,
});
```

Returns the `react-hook-form` `UseFormReturn` (`methods`), computed default values, and a stable reset handler. Pass `methods` to `<FormProvider>` and render `<FormField>` components for a fully custom layout.

---

## registerFieldType

Register a component for any custom type string so `FormBuilder` renders it automatically.

```tsx
import { registerFieldType } from 'mui-schema-form-builder';

// Call once at app startup before any FormBuilder using the type renders.
registerFieldType('rating', RatingInput);
```

The component must accept `CustomFieldProps` (`{ fieldConfig: FieldConfig; control: Control }`).

---

## createDatePickerInput

Factory that produces a `FormBuilder`-compatible DatePicker field. The consumer provides the installed `DatePicker` component so `@mui/x-date-pickers` remains an optional peer dep.

```tsx
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createDatePickerInput, registerFieldType, FIELD_TYPE } from 'mui-schema-form-builder';

// Call once at app startup.
registerFieldType(FIELD_TYPE.DATE_PICKER, createDatePickerInput(DatePicker));
```

**Requirements:**

- `@mui/x-date-pickers` installed.
- App wrapped with `<LocalizationProvider>`.
- Values stored as ISO strings — use `z.string().datetime()` in your schema.

---

## FormBuilderHandle (imperative ref)

Access form methods imperatively via a `ref` on `FormBuilder` or `FormWizard`.

```tsx
import { useRef } from 'react';
import type { FormBuilderHandle } from 'mui-schema-form-builder';

const ref = useRef<FormBuilderHandle>(null);

<FormBuilder ref={ref} fields={fields} schema={schema} onSubmit={fn} />;

// Programmatic control:
ref.current?.submit();
ref.current?.reset();
ref.current?.setError('email', { type: 'manual', message: 'Already taken' });
const values = ref.current?.getValues();
```

| Method      | Signature                                                          | Description                                           |
| ----------- | ------------------------------------------------------------------ | ----------------------------------------------------- |
| `reset`     | `() => void`                                                       | Reset to default values; calls `onReset` if provided. |
| `submit`    | `() => void`                                                       | Trigger validation and call `onSubmit` if valid.      |
| `setError`  | `(name: string, error: { type: string; message: string }) => void` | Set a field-level error manually.                     |
| `getValues` | `() => FieldValues`                                                | Return current values without triggering validation.  |

---

## Individual input components

All inputs are exported for use in custom form layouts with `react-hook-form`:

```tsx
import {
  TextInput,
  NumberInput,
  SelectInput,
  AutocompleteInput,
  CheckboxInput,
  RadioInput,
  ArrayInput,
} from 'mui-schema-form-builder';
```

Each accepts `{ fieldConfig: FieldConfig; control: Control }` (`CustomFieldProps`).

---

## Types

```tsx
import type {
  FieldConfig, // Single field definition
  FieldType, // Union of FIELD_TYPE values (+ string for custom types)
  FormBuilderProps, // All props accepted by FormBuilder
  FormBuilderHandle, // Imperative ref shape (reset/submit/setError/getValues)
  FormBuilderLabels, // i18n label overrides
  FormWizardProps, // All props accepted by FormWizard
  WizardStep, // { label, description?, fields }
  Option, // { label: string; value: string | number; disabled?: boolean }
  GridConfig, // MUI Grid size breakpoints { xs?, sm?, md?, lg?, xl? }
  CustomFieldProps, // { fieldConfig: FieldConfig; control: Control }
  UseFormBuilderOptions, // Options accepted by useFormBuilder hook
} from 'mui-schema-form-builder';
```

## Recent API additions

### TextField adornments

TextField-based controls (`text`, `textarea`, `date`, and `password`) support MUI `InputAdornment` through schema-level `startAdornment` and `endAdornment` values. This follows the Material UI TextField pattern while keeping field schemas declarative.

```tsx
{
  type: FIELD_TYPE.TEXT,
  name: 'email',
  label: 'Email',
  startAdornment: '@',
  endAdornment: '.com',
}
```

### Password fields

Password inputs are first-class text fields with an accessible visibility toggle. The toggle is enabled by default and can be disabled with `showPasswordToggle: false`.

```tsx
{
  type: FIELD_TYPE.PASSWORD,
  name: 'password',
  label: 'Password',
  showPasswordToggle: true,
}
```

### Form titles

Use `title` for simple form headings and `titleProps` for the underlying MUI `Typography` props. Compose custom headers outside the form for layouts that need more than a single heading.

```tsx
<FormBuilder
  title="User Registration"
  titleProps={{ align: 'center', variant: 'h4' }}
  fields={fields}
  schema={schema}
  onSubmit={handleSubmit}
/>
```

### Custom action rendering

`renderActions` replaces the built-in action button row without changing validation or form state management. Existing button props continue to work when `renderActions` is omitted.

```tsx
<FormBuilder
  fields={fields}
  schema={schema}
  onSubmit={handleSubmit}
  renderActions={({ submit, reset, cancel, loading }) => (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      {cancel && <Button onClick={cancel}>Cancel</Button>}
      <Button onClick={reset} disabled={loading}>
        Reset
      </Button>
      <Button variant="contained" onClick={submit} loading={loading}>
        Save
      </Button>
    </Stack>
  )}
/>
```

`FormWizard` exposes the same render prop with wizard navigation context: `previousStep`, `nextStep`, `currentStep`, and `totalSteps`.
