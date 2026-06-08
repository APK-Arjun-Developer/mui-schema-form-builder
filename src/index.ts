// Core components
export { FormBuilder } from './components/form-builder/FormBuilder';
export { FormField } from './components/form-builder/FormField';

// Individual input components — exported for consumers who compose their own layouts
export { TextInput } from './components/form-builder/inputs/TextInput';
export { NumberInput } from './components/form-builder/inputs/NumberInput';
export { SelectInput } from './components/form-builder/inputs/SelectInput';
export { AutocompleteInput } from './components/form-builder/inputs/AutocompleteInput';
export { CheckboxInput } from './components/form-builder/inputs/CheckboxInput';
export { RadioInput } from './components/form-builder/inputs/RadioInput';

// FIELD_TYPE const object (preferred) + FieldType backward-compat alias (value AND type).
// `export { FieldType }` makes both the value (FieldType.TEXT) and the type available.
// No separate `export type { FieldType }` is needed — it would duplicate the identifier.
export { FIELD_TYPE, FieldType } from './components/form-builder/types/field.types';

// Public types — note: FieldType is already accessible via the value export above.
export type {
  FieldConfig,
  FormBuilderProps,
  Option,
  GridConfig,
} from './components/form-builder/types/field.types';

// Hooks
export { useFormBuilder } from './hooks/useFormBuilder';
export type { UseFormBuilderOptions } from './hooks/useFormBuilder';

// NOTE: debounce is intentionally NOT exported — it is an internal utility.
