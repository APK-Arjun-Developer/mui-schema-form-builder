import React from 'react';

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
}

export const FormBuilderContext = React.createContext<FormBuilderContextValue>({
  readOnly: false,
  labels: DEFAULT_LABELS,
});

export const useFormBuilderContext = () => React.useContext(FormBuilderContext);
