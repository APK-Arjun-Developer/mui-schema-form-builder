# mui-schema-form-builder

> Schema-driven, type-safe form builder for MUI + React Hook Form + Zod

Generate complex, production-ready forms from a plain JSON config. No boilerplate. No manual `register` calls. Full TypeScript inference from your Zod schema through to your `onSubmit` handler.

---

## Features

- **Zero-config forms** — one `fields` array, one `schema`, done
- **Type-safe submit** — `onSubmit` data is fully typed from your Zod schema
- **MUI-native** — built on `@mui/material` v9, not bolted on
- **Async autocomplete** — debounced fetch with built-in stale-response protection
- **Conditional fields** — hide/show fields based on other field values
- **Performance** — fields without `visibleIf` never re-render on sibling changes
- **Accessible** — proper `<label htmlFor>`, `aria-required`, `aria-invalid`, `aria-describedby`
- **Virtualization** — optional `react-window` support for 50+ field forms

---

## Installation

```bash
npm install mui-schema-form-builder
```

**Peer dependencies** (install these if you don't have them):

```bash
npm install react react-dom @mui/material @emotion/react @emotion/styled \
            react-hook-form @hookform/resolvers zod
```

**Optional** (only needed when `virtualize={true}`):

```bash
npm install react-window
```

---

## Quick Start

```tsx
import { z } from 'zod';
import { FormBuilder, FIELD_TYPE } from 'mui-schema-form-builder';
import { ThemeProvider, createTheme } from '@mui/material';

const schema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
});

const fields = [
  { name: 'name', label: 'Full Name', type: FIELD_TYPE.TEXT, required: true },
  { name: 'email', label: 'Email Address', type: FIELD_TYPE.TEXT, required: true },
  { name: 'age', label: 'Age', type: FIELD_TYPE.NUMBER, required: true },
];

export default function App() {
  return (
    <ThemeProvider theme={createTheme()}>
      <FormBuilder
        fields={fields}
        schema={schema}
        onSubmit={(data) => {
          // data.name  → string  (TypeScript inferred from schema)
          // data.email → string
          // data.age   → number
          console.log(data);
        }}
      />
    </ThemeProvider>
  );
}
```

---

## Field Schema Reference

| Property       | Type                                   | Required | Description                                           |
| -------------- | -------------------------------------- | -------- | ----------------------------------------------------- |
| `name`         | `string`                               | ✓        | Field name — must match a key in your Zod schema      |
| `label`        | `string`                               | ✓        | Display label                                         |
| `type`         | `FieldType`                            | ✓        | See field types below                                 |
| `defaultValue` | `unknown`                              |          | Initial value                                         |
| `placeholder`  | `string`                               |          | Input placeholder                                     |
| `required`     | `boolean`                              |          | Shows asterisk, sets `aria-required`                  |
| `disabled`     | `boolean`                              |          | Disables the field                                    |
| `options`      | `Option[]`                             |          | For SELECT, RADIO, CHECKBOX                           |
| `multiple`     | `boolean`                              |          | Multi-select for SELECT and AUTOCOMPLETE              |
| `grid`         | `GridConfig`                           |          | MUI Grid `size` — e.g. `{ xs: 12, sm: 6 }`            |
| `size`         | `'small' \| 'medium'`                  |          | MUI component size                                    |
| `fullWidth`    | `boolean`                              |          | Full-width input (default `true`)                     |
| `min`          | `number`                               |          | Min value — NUMBER only; also sets HTML `min`         |
| `max`          | `number`                               |          | Max value — NUMBER only; also sets HTML `max`         |
| `step`         | `number`                               |          | Step — NUMBER only; also sets HTML `step`             |
| `fetchOptions` | `(query: string) => Promise<Option[]>` |          | Async options for AUTOCOMPLETE                        |
| `visibleIf`    | `(values: FieldValues) => boolean`     |          | Hides field when returns `false`                      |
| `muiProps`     | `Record<string, any>`                  |          | Extra props forwarded to the underlying MUI component |

### Field Types

```tsx
import { FIELD_TYPE } from 'mui-schema-form-builder';

FIELD_TYPE.TEXT; // <input type="text">
FIELD_TYPE.TEXTAREA; // <textarea> (multiline)
FIELD_TYPE.NUMBER; // <input type="number">
FIELD_TYPE.DATE; // <input type="date">
FIELD_TYPE.SELECT; // <Select> single or multi
FIELD_TYPE.AUTOCOMPLETE; // <Autocomplete> static or async
FIELD_TYPE.RADIO; // <RadioGroup>
FIELD_TYPE.CHECKBOX; // Boolean or checkbox group
```

---

## Validation

Pass any Zod schema. The library uses `@hookform/resolvers/zod` internally:

```tsx
const schema = z
  .object({
    password: z.string().min(8).regex(/[A-Z]/, 'Needs uppercase'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords must match',
    path: ['confirm'],
  });
```

Control when validation runs:

```tsx
<FormBuilder
  validationMode="onChange"  // 'onChange' | 'onBlur' | 'onTouched' | 'onSubmit'
  ...
/>
```

---

## Conditional Fields

Only fields with `visibleIf` subscribe to form state changes. All other fields are isolated — typing in one field does not re-render its siblings.

```tsx
const fields = [
  {
    name: 'status',
    label: 'Status',
    type: FIELD_TYPE.SELECT,
    options: [
      { label: 'Employed', value: 'employed' },
      { label: 'Student', value: 'student' },
    ],
  },
  {
    name: 'company',
    label: 'Company',
    type: FIELD_TYPE.TEXT,
    visibleIf: (values) => values['status'] === 'employed',
  },
];
```

---

## Async Autocomplete

Built-in 300ms debounce and stale-response protection. If a later search resolves before an earlier one, the earlier response is discarded.

```tsx
{
  name: 'country',
  label: 'Country',
  type: FIELD_TYPE.AUTOCOMPLETE,
  fetchOptions: async (query) => {
    const res = await fetch(`/api/countries?q=${query}`);
    const data = await res.json();
    return data.map((c: Country) => ({ label: c.name, value: c.code }));
  },
}
```

---

## FormBuilder Props

| Prop             | Type                                                | Default       | Description                         |
| ---------------- | --------------------------------------------------- | ------------- | ----------------------------------- |
| `fields`         | `FieldConfig[]`                                     | required      | Field configuration                 |
| `schema`         | `z.ZodType`                                         | required      | Zod validation schema               |
| `onSubmit`       | `(data: z.infer<TSchema>) => void \| Promise<void>` | required      | Typed submit handler                |
| `onCancel`       | `() => void`                                        |               | Renders Cancel button when provided |
| `onReset`        | `() => void`                                        |               | Renders Reset button when provided  |
| `submitText`     | `string`                                            | `'Submit'`    | Submit button label                 |
| `cancelText`     | `string`                                            | `'Cancel'`    | Cancel button label                 |
| `resetText`      | `string`                                            | `'Reset'`     | Reset button label                  |
| `spacing`        | `number`                                            | `2`           | MUI Grid spacing between fields     |
| `virtualize`     | `boolean`                                           | `false`       | Enable react-window for large forms |
| `validationMode` | `ValidationMode`                                    | `'onTouched'` | When validation triggers            |

---

## TypeScript Tips

The generic propagates from schema → onSubmit automatically:

```tsx
const schema = z.object({ name: z.string(), age: z.number() });

<FormBuilder
  schema={schema}
  fields={fields}
  onSubmit={(data) => {
    // data.name → string ✓
    // data.age  → number ✓
  }}
/>;
```

**Memoize your `fields` array** to prevent unnecessary recomputation of default values:

```tsx
const fields = useMemo<FieldConfig[]>(
  () => [{ name: 'name', label: 'Name', type: FIELD_TYPE.TEXT }],
  [],
);
```

---

## Accessibility

- Every input has a proper `<label htmlFor>` association — clicking the label focuses the input
- Required asterisk is `aria-hidden` (visual cue only)
- Inputs have `aria-required`, `aria-invalid`, `aria-describedby` linked to error messages
- Error messages have `role="alert"` for screen reader announcement
- Radio groups and checkbox groups use `<fieldset>` + `<legend>` (WCAG 1.3.1)

### Customizing Text Inputs and Actions

The builder intentionally keeps customization aligned with MUI primitives:

```tsx
const fields = [
  {
    type: FIELD_TYPE.TEXT,
    name: 'amount',
    label: 'Amount',
    startAdornment: '$',
    endAdornment: 'USD',
  },
  {
    type: FIELD_TYPE.PASSWORD,
    name: 'password',
    label: 'Password',
  },
];

<FormBuilder
  title="User Registration"
  titleProps={{ align: 'center', variant: 'h4' }}
  fields={fields}
  schema={schema}
  onSubmit={onSubmit}
  renderActions={({ submit, loading }) => (
    <Button variant="contained" onClick={submit} loading={loading}>
      Create account
    </Button>
  )}
/>;
```

Adornments are rendered with MUI `InputAdornment`, password fields reuse the TextField implementation with an accessible visibility toggle, and `renderActions` is optional so existing built-in buttons remain backward compatible.

---

## License

MIT © Arjun Prakash
