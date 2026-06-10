import React from 'react';
import { Typography, Box } from '@mui/material';

interface FieldLabelProps {
  /** Must match the `id` of the associated input so clicking the label focuses it. */
  htmlFor: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  /** id placed on the wrapper Box — used by Select's labelId for aria-labelledby. */
  id?: string;
  /**
   * Use 'legend' inside a <fieldset> (radio groups, checkbox groups).
   * Use 'label' for all single-input fields.
   */
  component?: 'label' | 'legend';
}

export const FieldLabel = React.memo(
  ({ htmlFor, label, required, disabled, error, id, component = 'label' }: FieldLabelProps) => {
    return (
      <Box id={id} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
        <Typography
          component={component}
          // htmlFor associates the label with its input — clicking it focuses the field.
          // Only applies to <label> elements; <legend> does not use htmlFor.
          htmlFor={component === 'label' ? htmlFor : undefined}
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            display: 'block',
            color: error ? 'error.main' : disabled ? 'text.disabled' : 'text.primary',
            fontSize: '0.875rem',
            cursor: component === 'label' ? 'default' : undefined,
          }}
        >
          {label}
          {required && (
            // aria-hidden: screen readers already announce "required" via aria-required
            // on the input itself. The asterisk is a visual-only cue.
            <Box component="span" aria-hidden="true" sx={{ color: 'error.main', ml: 0.5 }}>
              *
            </Box>
          )}
        </Typography>
      </Box>
    );
  },
);

FieldLabel.displayName = 'FieldLabel';
