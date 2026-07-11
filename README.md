# mui-schema-form-builder

> Schema-driven, type-safe form builder for MUI + React Hook Form + Zod

Generate complex, production-ready forms from a plain JSON config. No boilerplate. No manual `register` calls. Full TypeScript inference from your Zod schema through to your `onSubmit` handler.

---

## Features

- **Zero-config forms** — one `fields` array, one `schema`, done
- **Type-safe submit** — `onSubmit` data is fully typed from your Zod schema
- **MUI-native** — built on `@mui/material` v9, not bolted on
- **Password input** — `FIELD_TYPE.PASSWORD` with a built-in show/hide toggle (no icon library needed)
- **Combo input** — `FIELD_TYPE.COMBO_INPUT` fuses a Select dropdown with a text/number/search input into a single compound field
- **Search input** — `FIELD_TYPE.SEARCH` is a ready-to-use search field with a magnifying-glass icon pre-wired — no `startAdornment` config needed
- **Filter form** — `FilterForm` fires `onChange` on every keystroke — no submit button, no schema required
- **Input adornments** — `startAdornment` / `endAdornment` on TEXT and NUMBER fields for prefixes, suffixes, and icons
- **Form title** — optional heading with alignment (`titleAlign`) and placement (`titlePosition`) control
- **Custom action buttons** — replace Submit/Cancel/Reset with your own layout via `renderActions`
- **Multi-step wizard** — `FormWizard` with per-step validation, completed-step navigation, and submit-error navigation
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

| Property         | Type                                   | Required | Description                                                    |
| ---------------- | -------------------------------------- | -------- | -------------------------------------------------------------- |
| `name`           | `string`                               | ✓        | Field name — must match a key in your Zod schema               |
| `label`          | `string`                               | ✓        | Display label                                                  |
| `type`           | `string`                               | ✓        | See field types below                                          |
| `defaultValue`   | `unknown`                              |          | Initial value                                                  |
| `placeholder`    | `string`                               |          | Input placeholder                                              |
| `required`       | `boolean`                              |          | Shows asterisk, sets `aria-required`                           |
| `disabled`       | `boolean`                              |          | Disables the field                                             |
| `options`        | `Option[]`                             |          | For SELECT, RADIO, CHECKBOX                                    |
| `multiple`       | `boolean`                              |          | Multi-select for SELECT and AUTOCOMPLETE                       |
| `grid`           | `GridConfig`                           |          | MUI Grid `size` — e.g. `{ xs: 12, sm: 6 }`                    |
| `size`           | `'small' \| 'medium'`                  |          | MUI component size                                             |
| `fullWidth`      | `boolean`                              |          | Full-width input (default `true`)                              |
| `min`            | `number`                               |          | Min value — NUMBER only; also sets HTML `min`                  |
| `max`            | `number`                               |          | Max value — NUMBER only; also sets HTML `max`                  |
| `step`           | `number`                               |          | Step — NUMBER only; also sets HTML `step`                      |
| `rows`           | `number`                               |          | Visible text rows — TEXTAREA only (default `4`)                |
| `startAdornment` | `React.ReactNode`                      |          | Prefix node inside the input (TEXT, NUMBER). E.g. `"$"`, icon |
| `endAdornment`   | `React.ReactNode`                      |          | Suffix node inside the input (TEXT, NUMBER). E.g. `"kg"`       |
| `fetchOptions`      | `(query: string) => Promise<Option[]>` |          | Async options for AUTOCOMPLETE                                 |
| `visibleIf`         | `(values: FieldValues) => boolean`     |          | Hides field when returns `false`                               |
| `muiProps`          | `Record<string, any>`                  |          | Extra props forwarded to the underlying MUI component          |
| `section`           | `string`                               |          | Groups consecutive same-section fields under a shared header   |
| `selectOptions`     | `Option[]`                             |          | Dropdown options — COMBO_INPUT only                            |
| `selectPosition`    | `'start' \| 'end'`                     |          | Which side the Select appears on — COMBO_INPUT (default `'start'`) |
| `selectPlaceholder` | `string`                               |          | Placeholder shown when no option is selected — COMBO_INPUT only |
| `inputType`         | `'text' \| 'number' \| 'search'`       |          | HTML input type for the text portion — COMBO_INPUT (default `'text'`) |
| `selectWidth`       | `number`                               |          | Width in px of the Select portion — COMBO_INPUT (default `120`) |

### Field Types

```tsx
import { FIELD_TYPE } from 'mui-schema-form-builder';

FIELD_TYPE.TEXT;         // <input type="text">
FIELD_TYPE.TEXTAREA;     // <textarea> (multiline)
FIELD_TYPE.NUMBER;       // <input type="number">
FIELD_TYPE.DATE;         // <input type="date">
FIELD_TYPE.PASSWORD;     // Password input with show/hide toggle
FIELD_TYPE.SELECT;       // <Select> single or multi
FIELD_TYPE.AUTOCOMPLETE; // <Autocomplete> static or async
FIELD_TYPE.RADIO;        // <RadioGroup>
FIELD_TYPE.CHECKBOX;     // Boolean or checkbox group
FIELD_TYPE.ARRAY;        // Dynamic list with add/remove (useFieldArray)
FIELD_TYPE.DATE_PICKER;  // MUI DatePicker — register via createDatePickerInput
FIELD_TYPE.COMBO_INPUT;  // Fused Select + text/number/search — value shape: { select, input }
FIELD_TYPE.SEARCH;       // Text input with magnifying-glass icon pre-wired, type="search"
```

---

## FilterForm

`FilterForm` is a reactive filter bar that fires `onChange` on every field change. No submit button, no Zod schema required — designed for search bars, filter sidebars, and toolbar filters.

```tsx
import { FilterForm, FIELD_TYPE } from 'mui-schema-form-builder';

<FilterForm
  fields={[
    { name: 'search', label: 'Search', type: FIELD_TYPE.TEXT, placeholder: 'Search…', grid: { xs: 12, sm: 8 } },
    {
      name: 'status',
      label: 'Status',
      type: FIELD_TYPE.SELECT,
      options: [
        { label: 'All', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      grid: { xs: 12, sm: 4 },
    },
  ]}
  onChange={(values) => console.log(values)}
  showReset
  defaultValues={{ search: '', status: '' }}
/>
```

| Prop            | Type                            | Default | Description                                          |
| --------------- | ------------------------------- | ------- | ---------------------------------------------------- |
| `fields`        | `FieldConfig[]`                 | required | Field configuration                                |
| `onChange`      | `(values: FieldValues) => void` | required | Called on every field change with the full state   |
| `defaultValues` | `FieldValues`                   |         | Initial field values                               |
| `showReset`     | `boolean`                       | `false` | Show a Reset button that restores `defaultValues`  |
| `spacing`       | `number`                        | `2`     | MUI Grid spacing between fields                    |
| `resetText`     | `string`                        | `'Reset'` | Reset button label                               |

---

## Combo Input

`FIELD_TYPE.COMBO_INPUT` fuses a Select dropdown with a text, number, or search input into a single compound field. The RHF value shape is `{ select, input }`.

```tsx
// Phone number — country code at start
{
  name: 'phone',
  label: 'Phone number',
  type: FIELD_TYPE.COMBO_INPUT,
  required: true,
  selectOptions: [
    { label: '+1', value: '+1' },
    { label: '+44', value: '+44' },
    { label: '+91', value: '+91' },
  ],
  selectPlaceholder: 'Code',
  selectWidth: 88,
  placeholder: '(555) 000-0000',
}

// Currency amount — selector at start, number input
{
  name: 'price',
  label: 'Price',
  type: FIELD_TYPE.COMBO_INPUT,
  selectOptions: [{ label: 'USD $', value: 'usd' }, { label: 'EUR €', value: 'eur' }],
  selectPlaceholder: 'Currency',
  selectWidth: 104,
  inputType: 'number',
  min: 0,
  placeholder: '0.00',
}

// Search with category — selector at end
{
  name: 'query',
  label: 'Search',
  type: FIELD_TYPE.COMBO_INPUT,
  selectPosition: 'end',
  selectOptions: [{ label: 'All', value: '' }, { label: 'Books', value: 'books' }],
  selectPlaceholder: 'Category',
  selectWidth: 130,
  inputType: 'search',
  placeholder: 'Search products…',
}
```

The Zod schema for a COMBO_INPUT field uses a nested object:

```tsx
const schema = z.object({
  phone: z.object({
    select: z.string().min(1, 'Select a country code'),
    input: z.string().min(6, 'Enter a valid phone number'),
  }),
});
```

> **Note:** When `inputType: 'search'`, a magnifying-glass icon is automatically rendered as a start adornment — no extra configuration needed.

---

## Search Input

`FIELD_TYPE.SEARCH` renders a text input with a magnifying-glass icon automatically pre-wired as the start adornment and `type="search"` set on the HTML input. No extra configuration required.

```tsx
{
  name: 'search',
  label: 'Search',
  type: FIELD_TYPE.SEARCH,
  placeholder: 'Search products…',
}
```

Use it anywhere a `FIELD_TYPE.TEXT` field would go — especially inside `FilterForm`:

```tsx
<FilterForm
  fields={[
    { name: 'search', label: 'Search', type: FIELD_TYPE.SEARCH, placeholder: 'Search…', grid: { xs: 12, sm: 8 } },
    { name: 'status', label: 'Status', type: FIELD_TYPE.SELECT, options: [...], grid: { xs: 12, sm: 4 } },
  ]}
  onChange={(values) => console.log(values)}
/>
```

You can still override the icon via `startAdornment`, or add an `endAdornment` (e.g. a clear button):

```tsx
{ name: 'search', label: 'Search', type: FIELD_TYPE.SEARCH, endAdornment: <ClearButton /> }
```

> **Note:** For a fused Select + search input (e.g. category + keyword), use `FIELD_TYPE.COMBO_INPUT` with `inputType: 'search'` instead.

---

## Password Input

Use `FIELD_TYPE.PASSWORD` for a text input with a built-in show/hide toggle. The toggle uses an inline SVG icon — no `@mui/icons-material` dependency needed.

```tsx
{
  name: 'password',
  label: 'Password',
  type: FIELD_TYPE.PASSWORD,
  required: true,
}
```

---

## Input Adornments

Add a prefix or suffix decoration to TEXT and NUMBER fields via `startAdornment` and `endAdornment`. Pass any React node — a string, an icon, or an interactive element.

```tsx
[
  {
    name: 'price',
    label: 'Price',
    type: FIELD_TYPE.NUMBER,
    startAdornment: '$',
    endAdornment: 'USD',
  },
  {
    name: 'username',
    label: 'Username',
    type: FIELD_TYPE.TEXT,
    startAdornment: '@',
  },
]
```

> **Note:** PASSWORD fields have their own fixed end adornment (the visibility toggle). Setting `endAdornment` on a PASSWORD field has no effect.

---

## Form Title

Add a heading to `FormBuilder` or `FormWizard` with the `title`, `titleAlign`, and `titlePosition` props.

```tsx
<FormBuilder
  title="Edit Profile"
  titleAlign="left"        // 'left' | 'center' | 'right' — default: 'left'
  titlePosition="inside"   // 'inside' | 'above' — default: 'inside'
  ...
/>
```

- `titlePosition="inside"` — the heading renders inside the Paper container above the fields.
- `titlePosition="above"` — the heading renders outside the Paper, useful when you control the container styling.

---

## Custom Action Buttons

Replace the default Submit / Cancel / Reset buttons with your own layout via `renderActions`.

### FormBuilder

```tsx
import type { FormBuilderActionsParams } from 'mui-schema-form-builder';

<FormBuilder
  onSubmit={fn}
  onCancel={cancelFn}
  onReset={resetFn}
  renderActions={({ isSubmitting, submit, cancel, reset }: FormBuilderActionsParams) => (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      {cancel && <Button onClick={cancel}>Discard</Button>}
      <Button variant="contained" onClick={submit} disabled={isSubmitting}>
        Save Changes
      </Button>
    </Stack>
  )}
/>
```

### FormWizard

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
      <Button onClick={back} disabled={isFirstStep}>← Back</Button>
      {isLastStep
        ? <Button variant="contained" onClick={submit}>Finish</Button>
        : <Button variant="contained" onClick={next}>Continue →</Button>
      }
    </Stack>
  )}
/>
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

| Prop                 | Type                                                | Default       | Description                                                      |
| -------------------- | --------------------------------------------------- | ------------- | ---------------------------------------------------------------- |
| `fields`             | `FieldConfig[]`                                     | required      | Field configuration                                              |
| `schema`             | `z.ZodType`                                         | required\*    | Zod validation schema (\*or `resolver`)                          |
| `resolver`           | `Resolver`                                          |               | react-hook-form resolver (alternative to `schema`)               |
| `onSubmit`           | `(data: z.infer<TSchema>) => void \| Promise<void>` | required      | Typed submit handler                                             |
| `onCancel`           | `() => void`                                        |               | Renders Cancel button when provided                              |
| `onReset`            | `() => void`                                        |               | Renders Reset button when provided                               |
| `onChange`           | `(values: FieldValues) => void`                     |               | Called on every field value change                               |
| `onFieldChange`      | `(name: string, value: unknown) => void`            |               | Called when a single field changes                               |
| `submitText`         | `string`                                            | `'Submit'`    | Submit button label                                              |
| `cancelText`         | `string`                                            | `'Cancel'`    | Cancel button label                                              |
| `resetText`          | `string`                                            | `'Reset'`     | Reset button label                                               |
| `title`              | `string`                                            |               | Optional form heading                                            |
| `titleAlign`         | `'left' \| 'center' \| 'right'`                     | `'left'`      | Horizontal alignment of the title                                |
| `titlePosition`      | `'inside' \| 'above'`                               | `'inside'`    | Whether the title is inside or above the Paper container         |
| `renderActions`      | `(params: FormBuilderActionsParams) => ReactNode`   |               | Replace default buttons with a custom render                     |
| `readOnly`           | `boolean`                                           | `false`       | Render all fields as display text                                |
| `labels`             | `FormBuilderLabels`                                 |               | Override built-in UI strings                                     |
| `spacing`            | `number`                                            | `2`           | MUI Grid spacing between fields                                  |
| `virtualize`         | `boolean`                                           | `false`       | Enable react-window for large forms                              |
| `validationMode`     | `ValidationMode`                                    | `'onTouched'` | When validation triggers                                         |
| `sx`                 | `SxProps`                                           |               | MUI sx prop for the outer Paper                                  |

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

---

## License

MIT © Arjun Prakash
