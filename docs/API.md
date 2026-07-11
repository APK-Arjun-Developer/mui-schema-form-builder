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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fields` | `FieldConfig[]` | **required** | Ordered list of field definitions. |
| `schema` | `z.ZodType` | — | Zod schema for validation and type inference. Required unless `resolver` is provided. |
| `resolver` | `Resolver` | — | A react-hook-form resolver (e.g. `yupResolver`, `valibotResolver`). Alternative to `schema`. |
| `onSubmit` | `(data: z.infer<TSchema>) => void \| Promise<void>` | **required** | Called with validated, typed form data on successful submission. |
| `onCancel` | `() => void` | — | Renders a Cancel button when provided. |
| `onReset` | `() => void` | — | Renders a Reset button when provided; called after the form resets. |
| `onChange` | `(values: FieldValues) => void` | — | Called on every field value change with the full form snapshot. |
| `onFieldChange` | `(name: string, value: unknown) => void` | — | Called when a single field changes with its name and new value. |
| `readOnly` | `boolean` | `false` | Render all fields as formatted display text instead of interactive inputs. |
| `labels` | `FormBuilderLabels` | — | Override built-in UI strings (array add/remove labels, item label). See [i18n labels](#i18n-labels). |
| `title` | `string` | — | Optional heading displayed for the form. |
| `titleAlign` | `'left' \| 'center' \| 'right'` | `'left'` | Horizontal alignment of the title. |
| `titlePosition` | `'inside' \| 'above'` | `'inside'` | Where the title is placed. `'inside'` renders it inside the Paper above the fields; `'above'` renders it outside the Paper. |
| `renderActions` | `(params: FormBuilderActionsParams) => ReactNode` | — | Replace the default Submit / Cancel / Reset buttons with a custom render. When provided, default buttons are not rendered. |
| `submitText` | `string` | `"Submit"` | Label for the submit button. Ignored when `renderActions` is provided. |
| `cancelText` | `string` | `"Cancel"` | Label for the cancel button. Ignored when `renderActions` is provided. |
| `resetText` | `string` | `"Reset"` | Label for the reset button. Ignored when `renderActions` is provided. |
| `spacing` | `number` | `2` | MUI Grid spacing between fields. |
| `validationMode` | `keyof ValidationMode` | `"onTouched"` | When react-hook-form triggers validation. |
| `virtualize` | `boolean` | `false` | Enable react-window virtualization. Requires `react-window` peer dep. |
| `virtualizeHeight` | `number` | `500` | Height (px) of the virtualized container. Only used when `virtualize=true`. |
| `virtualizeItemSize` | `number` | `80` | Height (px) per virtualized row. Only used when `virtualize=true`. |
| `sx` | `SxProps` | — | MUI sx prop forwarded to the outer Paper container. |
| `ref` | `React.Ref<FormBuilderHandle>` | — | Imperative handle — see [FormBuilderHandle](#formbuilderhandle-imperative-ref). |

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
/>
```

### Form title

```tsx
<FormBuilder
  title="Edit Profile"
  titleAlign="center"       // 'left' | 'center' | 'right'
  titlePosition="above"     // 'inside' | 'above'
  schema={schema}
  fields={fields}
  onSubmit={fn}
/>
```

### Custom action buttons (renderActions)

`renderActions` receives a [`FormBuilderActionsParams`](#formbuilderactionsparams) object and must return a React node. When provided, the default Submit / Cancel / Reset buttons are suppressed entirely.

```tsx
import type { FormBuilderActionsParams } from 'mui-schema-form-builder';

<FormBuilder
  schema={schema}
  fields={fields}
  onSubmit={fn}
  onCancel={cancelFn}
  onReset={resetFn}
  renderActions={({ isSubmitting, submit, cancel, reset }: FormBuilderActionsParams) => (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      {reset && <Button onClick={reset}>Clear</Button>}
      {cancel && <Button variant="outlined" onClick={cancel}>Discard</Button>}
      <Button variant="contained" onClick={submit} disabled={isSubmitting}>
        Save Changes
      </Button>
    </Stack>
  )}
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

### Section grouping

Fields with the same consecutive `section` value are rendered under a shared header with a divider.

```tsx
<FormBuilder
  fields={[
    { name: 'firstName', label: 'First Name', type: FIELD_TYPE.TEXT, section: 'Personal' },
    { name: 'lastName',  label: 'Last Name',  type: FIELD_TYPE.TEXT, section: 'Personal' },
    { name: 'email',     label: 'Email',      type: FIELD_TYPE.TEXT, section: 'Contact'  },
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
    { name: 'address.city',   label: 'City',   type: FIELD_TYPE.TEXT },
  ]}
  onSubmit={fn}
/>
```

---

## FormWizard

Multi-step form with MUI Stepper, per-step validation, and shared form state.

```tsx
import { FormWizard } from 'mui-schema-form-builder';
import type { WizardStep } from 'mui-schema-form-builder';
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `WizardStep[]` | **required** | Ordered list of wizard steps. |
| `schema` | `z.ZodType` | — | Zod schema covering all steps. Required unless `resolver` is provided. |
| `resolver` | `Resolver` | — | A react-hook-form resolver. Alternative to `schema`. |
| `onSubmit` | `(data: z.infer<TSchema>) => void \| Promise<void>` | **required** | Called with validated data after the final step submits successfully. |
| `onCancel` | `() => void` | — | Renders a Cancel button on the first step when provided. |
| `readOnly` | `boolean` | `false` | Render all fields as formatted display text. |
| `labels` | `FormBuilderLabels` | — | Override built-in UI strings. |
| `title` | `string` | — | Optional heading displayed for the wizard. |
| `titleAlign` | `'left' \| 'center' \| 'right'` | `'left'` | Horizontal alignment of the title. |
| `titlePosition` | `'inside' \| 'above'` | `'inside'` | Where the title is placed. `'inside'` renders above the Stepper; `'above'` renders outside the Paper. |
| `renderActions` | `(params: FormWizardActionsParams) => ReactNode` | — | Replace the default Next / Back / Submit / Cancel buttons with a custom render. |
| `nextText` | `string` | `"Next"` | Label for the Next button. Ignored when `renderActions` is provided. |
| `backText` | `string` | `"Back"` | Label for the Back button. Ignored when `renderActions` is provided. |
| `submitText` | `string` | `"Submit"` | Label for the Submit button on the last step. Ignored when `renderActions` is provided. |
| `cancelText` | `string` | `"Cancel"` | Cancel button label (first step only). Ignored when `renderActions` is provided. |
| `spacing` | `number` | `2` | MUI Grid spacing between fields. |
| `validationMode` | `keyof ValidationMode` | `"onTouched"` | When react-hook-form triggers validation. |
| `sx` | `SxProps` | — | MUI sx prop forwarded to the outer Paper container. |
| `ref` | `React.Ref<FormBuilderHandle>` | — | Imperative handle — see [FormBuilderHandle](#formbuilderhandle-imperative-ref). |

### WizardStep

```typescript
interface WizardStep {
  label: string;
  description?: string;  // Sub-text shown under the step dot in the Stepper
  fields: FieldConfig[];
}
```

### Per-step validation

Clicking **Next** calls `trigger(stepFieldNames)` — only the current step's fields are validated. The wizard advances only when every field in the current step passes. The final **Submit** validates the entire schema.

When navigating with **Back** or by clicking a completed step in the Stepper, any existing validation errors are cleared so the target step starts clean.

### Completed step navigation

After a step passes validation and the user clicks Next, that step's label becomes a clickable `StepButton` in the Stepper. The user can jump back to any previously completed step to review or edit its values. Forward navigation to unvisited steps is not permitted.

The currently active step is never rendered with a completion checkmark, even if it was previously completed — only steps that have been completed and are not currently active show the checkmark.

### Submit error navigation

If the final Submit call fails validation (e.g. a cross-field `refine` whose error path points to a field on a previous step), the wizard automatically navigates to the step containing the first error so the user can see and fix it.

### Custom action buttons (renderActions)

`renderActions` receives a [`FormWizardActionsParams`](#formwizardactionsparams) object.

```tsx
import type { FormWizardActionsParams } from 'mui-schema-form-builder';

<FormWizard
  steps={steps}
  schema={schema}
  onSubmit={fn}
  renderActions={({
    isSubmitting, isFirstStep, isLastStep, next, back, submit,
  }: FormWizardActionsParams) => (
    <Stack direction="row" spacing={2} justifyContent="space-between" width="100%">
      <Button onClick={back} disabled={isFirstStep || isSubmitting}>← Back</Button>
      {isLastStep
        ? <Button variant="contained" color="success" onClick={submit} disabled={isSubmitting}>
            Finish
          </Button>
        : <Button variant="contained" onClick={next} disabled={isSubmitting}>
            Continue →
          </Button>
      }
    </Stack>
  )}
/>
```

### Example

```tsx
import { z } from 'zod';
import { FormWizard, FIELD_TYPE } from 'mui-schema-form-builder';

const schema = z.object({
  name:  z.string().min(1, 'Required'),
  email: z.string().email(),
  plan:  z.string().min(1, 'Pick a plan'),
});

<FormWizard
  title="Sign Up"
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
          name: 'plan', label: 'Choose a plan', type: FIELD_TYPE.RADIO,
          options: [{ label: 'Free', value: 'free' }, { label: 'Pro', value: 'pro' }],
        },
      ],
    },
  ]}
  onSubmit={(data) => console.log(data)}
/>
```

`FormWizard` supports `ref` with the same `FormBuilderHandle` interface (reset, submit, setError, getValues).

---

## FieldConfig

Describes a single form field.

```tsx
import type { FieldConfig } from 'mui-schema-form-builder';
```

### Common properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Field key. Dot-notation supported (`"address.city"`). |
| `label` | `string` | Human-readable label. |
| `type` | `string` | One of the `FIELD_TYPE` constants, or a custom string (see `registerFieldType`). |
| `defaultValue` | `unknown` | Initial value for this field. |
| `placeholder` | `string` | Input placeholder text. |
| `disabled` | `boolean` | Disables the field. |
| `required` | `boolean` | Renders a required indicator (`*`). Validation is enforced by the schema. |
| `fullWidth` | `boolean` | Stretches the input to 100% width (default `true`). |
| `size` | `"small" \| "medium"` | MUI input size. |
| `grid` | `GridConfig` | MUI Grid size breakpoints (`xs`, `sm`, `md`, `lg`, `xl`). |
| `visibleIf` | `(values: FieldValues) => boolean` | Hide this field when the predicate returns `false`. Only fields with this prop subscribe to form-wide state changes. |
| `muiProps` | `Record<string, unknown>` | Extra props forwarded directly to the underlying MUI component. |
| `section` | `string` | Groups consecutive same-section fields under a shared section header. |

### Type-specific properties

#### TEXT / TEXTAREA / DATE
| Property | Description |
|----------|-------------|
| `rows` | Visible text rows — TEXTAREA only (default `4`). |
| `startAdornment` | `React.ReactNode` rendered inside an `InputAdornment` at the start of the input. E.g. `"$"`, an icon, or any React node. |
| `endAdornment` | `React.ReactNode` rendered inside an `InputAdornment` at the end of the input. E.g. `"kg"`. |

#### NUMBER
| Property | Description |
|----------|-------------|
| `min` | Minimum value. Also sets the HTML `min` attribute. |
| `max` | Maximum value. Also sets the HTML `max` attribute. |
| `step` | Step increment. Also sets the HTML `step` attribute. |
| `startAdornment` | Prefix adornment (same as TEXT). |
| `endAdornment` | Suffix adornment (same as TEXT). |

#### PASSWORD
| Property | Description |
|----------|-------------|
| `startAdornment` | Prefix adornment, same as TEXT. |

> **Note:** PASSWORD fields have a fixed end adornment (the show/hide toggle button). Setting `endAdornment` on a PASSWORD field has no effect.

#### SELECT / AUTOCOMPLETE / RADIO / CHECKBOX (group)
| Property | Description |
|----------|-------------|
| `options` | `Option[]` — list of `{ label, value, disabled? }` items. |
| `multiple` | Enable multi-select (SELECT and AUTOCOMPLETE). |
| `fetchOptions` | `(input: string) => Promise<Option[]>` — async option fetching (AUTOCOMPLETE only). |

#### ARRAY
| Property | Description |
|----------|-------------|
| `itemFields` | `FieldConfig[]` — sub-fields rendered for each array item. |
| `addLabel` | Label for the "add item" button (default: context `labels.arrayAddItem` → `"Add item"`). |
| `removeLabel` | Label for the per-item "remove" button (default: context `labels.arrayRemove` → `"Remove"`). |
| `minItems` | Minimum items; hides Remove when at this count. |
| `maxItems` | Maximum items; hides Add when at this count. |

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
| `NUMBER` | `"number"` | MUI TextField (number) — coerces to `number` before storing |
| `DATE` | `"date"` | MUI TextField (type="date") |
| `PASSWORD` | `"password"` | MUI TextField (password) with an inline show/hide toggle |
| `DATE_PICKER` | `"datepicker"` | MUI DatePicker — register via `createDatePickerInput` |
| `SELECT` | `"select"` | MUI Select |
| `AUTOCOMPLETE` | `"autocomplete"` | MUI Autocomplete |
| `RADIO` | `"radio"` | MUI RadioGroup inside a fieldset |
| `CHECKBOX` | `"checkbox"` | MUI Checkbox (boolean) or FormGroup (with `options`) |
| `ARRAY` | `"array"` | Dynamic list with add/remove, powered by `useFieldArray` |

---

## Read-only / display mode

Pass `readOnly` to render all fields as formatted display text. Useful for review or confirmation screens.

```tsx
<FormBuilder fields={fields} schema={schema} onSubmit={fn} readOnly />
```

**Display rendering per field type:**

| Type | Read-only output |
|------|-----------------|
| TEXT / TEXTAREA / NUMBER / DATE / PASSWORD | Plain text value, or `—` if empty |
| SELECT single / RADIO | Resolved option label |
| SELECT multiple | Chips for each selected label |
| CHECKBOX (boolean) | `"Yes"` or `"No"` |
| CHECKBOX (group) | Chips for each checked option |
| AUTOCOMPLETE | Option label (object) or raw string |
| AUTOCOMPLETE multiple | Chips |
| ARRAY | Each item rendered recursively in a card |
| Custom types | `String(value)` |

**Read-only toggle pattern** — switch between edit and preview with one prop:

```tsx
const [readOnly, setReadOnly] = useState(false);

<FormBuilder
  fields={fields}
  schema={schema}
  onSubmit={(data) => { setReadOnly(true); save(data); }}
  readOnly={readOnly}
/>
{readOnly && <Button onClick={() => setReadOnly(false)}>Edit</Button>}
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
  schema,           // or: resolver
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

<FormBuilder ref={ref} fields={fields} schema={schema} onSubmit={fn} />

// Programmatic control:
ref.current?.submit();
ref.current?.reset();
ref.current?.setError('email', { type: 'manual', message: 'Already taken' });
const values = ref.current?.getValues();
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `reset` | `() => void` | Reset to default values; calls `onReset` if provided. |
| `submit` | `() => void` | Trigger validation and call `onSubmit` if valid. |
| `setError` | `(name: string, error: { type: string; message: string }) => void` | Set a field-level error manually. |
| `getValues` | `() => FieldValues` | Return current values without triggering validation. |

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
  PasswordInput,
} from 'mui-schema-form-builder';
```

Each accepts `{ fieldConfig: FieldConfig; control: Control }` (`CustomFieldProps`).

`PasswordInput` renders a text field that masks its value by default and toggles visibility via a built-in icon button. No icon library dependency is required.

---

## Types

```tsx
import type {
  FieldConfig,                // Single field definition
  FieldType,                  // Union of FIELD_TYPE values (+ string for custom types)
  FormBuilderProps,           // All props accepted by FormBuilder
  FormBuilderHandle,          // Imperative ref shape (reset/submit/setError/getValues)
  FormBuilderLabels,          // i18n label overrides
  FormBuilderActionsParams,   // Passed to the FormBuilder renderActions render-prop
  FormWizardProps,            // All props accepted by FormWizard
  FormWizardActionsParams,    // Passed to the FormWizard renderActions render-prop
  WizardStep,                 // { label, description?, fields }
  Option,                     // { label: string; value: string | number; disabled?: boolean }
  GridConfig,                 // MUI Grid size breakpoints { xs?, sm?, md?, lg?, xl? }
  CustomFieldProps,           // { fieldConfig: FieldConfig; control: Control }
  UseFormBuilderOptions,      // Options accepted by useFormBuilder hook
} from 'mui-schema-form-builder';
```

### FormBuilderActionsParams

Passed to the `renderActions` render-prop of `FormBuilder`.

```typescript
interface FormBuilderActionsParams {
  /** Whether the form is currently submitting. */
  isSubmitting: boolean;
  /** Programmatically trigger form submission (runs validation + onSubmit). */
  submit: () => void;
  /** Calls the onCancel callback if provided. Undefined when onCancel is not set. */
  cancel?: () => void;
  /** Calls the onReset callback and resets the form. Undefined when onReset is not set. */
  reset?: () => void;
}
```

### FormWizardActionsParams

Passed to the `renderActions` render-prop of `FormWizard`.

```typescript
interface FormWizardActionsParams {
  /** Whether the form is currently submitting. */
  isSubmitting: boolean;
  /** True when the wizard is on the first step. */
  isFirstStep: boolean;
  /** True when the wizard is on the last step. */
  isLastStep: boolean;
  /** Zero-based index of the currently visible step. */
  activeStep: number;
  /** Validate the current step and advance to the next one. */
  next: () => void;
  /** Navigate to the previous step without validation. */
  back: () => void;
  /** Programmatically trigger full-form submission (runs validation + onSubmit). */
  submit: () => void;
  /** Calls the onCancel callback if provided. Undefined when onCancel is not set. */
  cancel?: () => void;
}
```
