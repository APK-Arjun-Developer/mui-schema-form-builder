// Core components
export { FormBuilder } from './components/form-builder/FormBuilder';
export { FormWizard } from './components/form-builder/FormWizard';
export { FilterForm } from './components/form-builder/FilterForm';
export { FormField, registerFieldType } from './components/form-builder/FormField';
export type {
  FormBuilderHandle,
  WizardStep,
  FormWizardProps,
  FilterFormProps,
  CustomFieldProps,
} from './components/form-builder/types/builder.types';

// Individual input components — exported for consumers who compose their own layouts
export { TextInput } from './components/form-builder/inputs/TextInput';
export { NumberInput } from './components/form-builder/inputs/NumberInput';
export { SelectInput } from './components/form-builder/inputs/SelectInput';
export { AutocompleteInput } from './components/form-builder/inputs/AutocompleteInput';
export { CheckboxInput } from './components/form-builder/inputs/CheckboxInput';
export { RadioInput } from './components/form-builder/inputs/RadioInput';
export { ArrayInput } from './components/form-builder/inputs/ArrayInput';
export { PasswordInput } from './components/form-builder/inputs/PasswordInput';
export { ComboInput } from './components/form-builder/inputs/ComboInput';
export { SearchInput } from './components/form-builder/inputs/SearchInput';
/**
 * createDatePickerInput produces a FormBuilder field component that wraps
 * @mui/x-date-pickers DatePicker. Pass the imported DatePicker component as the
 * argument, then register the result with registerFieldType.
 */
export { createDatePickerInput } from './components/form-builder/inputs/DatePickerInput';

export { FIELD_TYPE } from './components/form-builder/types/field.types';

// Public types
export type {
  FieldType,
  FieldConfig,
  FormBuilderProps,
  FormBuilderLabels,
  FormBuilderActionsParams,
  FormWizardActionsParams,
  Option,
  GridConfig,
} from './components/form-builder/types/field.types';

// Hooks
export { useFormBuilder } from './hooks/useFormBuilder';
export type { UseFormBuilderOptions } from './hooks/useFormBuilder';

// NOTE: debounce is intentionally NOT exported — it is an internal utility.
