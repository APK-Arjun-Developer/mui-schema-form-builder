import React from 'react';
import { Typography, Box } from '@mui/material';
import type { FieldLabelProps } from '../types/component.types';
import { fieldLabelSx, getFieldLabelTextSx } from './FieldLabel.styles';

export const FieldLabel = React.memo(
  ({ htmlFor, label, required, disabled, error, id, component = 'label' }: FieldLabelProps) => {
    return (
      <Box id={id} sx={fieldLabelSx.wrapper}>
        <Typography
          component={component}
          htmlFor={component === 'label' ? htmlFor : undefined}
          variant="subtitle2"
          sx={getFieldLabelTextSx(!!error, disabled, component)}
        >
          {label}
          {required && (
            // aria-hidden: screen readers already announce "required" via aria-required
            // on the input itself. The asterisk is a visual-only cue.
            <Box component="span" aria-hidden="true" sx={fieldLabelSx.asterisk}>
              *
            </Box>
          )}
        </Typography>
      </Box>
    );
  },
);

FieldLabel.displayName = 'FieldLabel';
