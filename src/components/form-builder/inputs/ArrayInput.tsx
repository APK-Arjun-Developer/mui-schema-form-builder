import React from 'react';
import { useFieldArray, type Control } from 'react-hook-form';
import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import type { FieldConfig } from '../types/field.types';
import { FieldLabel } from './FieldLabel';
import { useFormBuilderContext } from '../FormBuilderContext';
// FormField is imported here for recursive rendering of sub-fields.
// The circular reference (FormField→ArrayInput→FormField) is safe with ES modules
// because both modules are fully initialized before any component renders.
import { FormField } from '../FormField';

interface ArrayInputProps {
  fieldConfig: FieldConfig;
  control: Control;
}

export const ArrayInput = React.memo(({ fieldConfig, control }: ArrayInputProps) => {
  const { labels } = useFormBuilderContext();
  const {
    fields: arrayFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: fieldConfig.name,
  });

  // Field-level labels take precedence; fall back to context (i18n) defaults.
  const addLabel = fieldConfig.addLabel ?? labels.arrayAddItem;
  const removeLabel = fieldConfig.removeLabel ?? labels.arrayRemove;
  const itemLabel = (i: number) => labels.arrayItemLabel(i);

  const canAdd = fieldConfig.maxItems === undefined || arrayFields.length < fieldConfig.maxItems;
  const canRemove = fieldConfig.minItems === undefined || arrayFields.length > fieldConfig.minItems;

  function buildDefaultItem(): Record<string, unknown> {
    const item: Record<string, unknown> = {};
    for (const sub of fieldConfig.itemFields ?? []) {
      item[sub.name] = sub.defaultValue ?? '';
    }
    return item;
  }

  return (
    <Box>
      <FieldLabel
        htmlFor={fieldConfig.name}
        label={fieldConfig.label}
        required={fieldConfig.required}
        disabled={fieldConfig.disabled}
      />

      {arrayFields.map((item, index) => (
        <Box
          key={item.id}
          sx={{
            mb: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {itemLabel(index)}
            </Typography>
            {canRemove && (
              <Button
                type="button"
                size="small"
                color="error"
                variant="text"
                onClick={() => remove(index)}
                disabled={fieldConfig.disabled}
                sx={{ textTransform: 'none' }}
              >
                {removeLabel}
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 1.5 }} />
          <Grid container spacing={2}>
            {fieldConfig.itemFields?.map((subField) => (
              <FormField
                key={subField.name}
                fieldConfig={{
                  ...subField,
                  name: `${fieldConfig.name}.${index}.${subField.name}`,
                }}
                control={control}
              />
            ))}
          </Grid>
        </Box>
      ))}

      {canAdd && (
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={() => append(buildDefaultItem())}
          disabled={fieldConfig.disabled}
          sx={{ textTransform: 'none', mt: arrayFields.length > 0 ? 1 : 0 }}
        >
          {addLabel}
        </Button>
      )}
    </Box>
  );
});

ArrayInput.displayName = 'ArrayInput';
