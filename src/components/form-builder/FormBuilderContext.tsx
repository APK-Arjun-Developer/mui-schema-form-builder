import React from 'react';
import type { CustomFieldComponent } from './types/field.types';

/** Resolved (defaults filled-in) label strings used internally. */
export interface ResolvedLabels {
  arrayAddItem: string;
  arrayRemove: string;
  arrayItemLabel: (index: number) => string;
}

export const DEFAULT_LABELS: ResolvedLabels = {
  arrayAddItem: 'Add item',
  arrayRemove: 'Remove',
  arrayItemLabel: (i) => `Item ${i + 1}`,
};

interface FormBuilderContextValue {
  readOnly: boolean;
  labels: ResolvedLabels;
  /** Instance-scoped custom field components, keyed by type string. */
  components: Record<string, CustomFieldComponent>;
  /** RHF unregister function — available inside FormBuilder/FormWizard, undefined in FilterForm. */
  unregister: ((name: string) => void) | undefined;
}

export const FormBuilderContext = React.createContext<FormBuilderContextValue>({
  readOnly: false,
  labels: DEFAULT_LABELS,
  components: {},
  unregister: undefined,
});

export const useFormBuilderContext = () => React.useContext(FormBuilderContext);
