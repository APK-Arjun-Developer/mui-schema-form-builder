import React from 'react';
import { useController, type Control } from 'react-hook-form';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { type FieldConfig, FIELD_TYPE } from '../types/field.types';
import { FieldLabel } from './FieldLabel';

interface ReadOnlyFieldProps {
  fieldConfig: FieldConfig;
  control: Control;
}

// Chips row helper used for multi-value fields
function ChipRow({ labels }: { labels: string[] }) {
  if (!labels.length)
    return (
      <Typography variant="body1" color="text.disabled">
        —
      </Typography>
    );
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
      {labels.map((l) => (
        <Chip key={l} label={l} size="small" />
      ))}
    </Stack>
  );
}

export const ReadOnlyField = React.memo(({ fieldConfig, control }: ReadOnlyFieldProps) => {
  const { field } = useController({ name: fieldConfig.name, control });
  const value = field.value;

  const empty = value === null || value === undefined || value === '';

  let display: React.ReactNode;

  if (empty) {
    display = (
      <Typography variant="body1" color="text.disabled">
        —
      </Typography>
    );
  } else {
    switch (fieldConfig.type) {
      case FIELD_TYPE.CHECKBOX: {
        if (fieldConfig.options) {
          const checked = value as (string | number)[];
          const lbls = checked.map(
            (v) => fieldConfig.options?.find((o) => o.value === v)?.label ?? String(v),
          );
          display = <ChipRow labels={lbls} />;
        } else {
          display = <Typography variant="body1">{value ? 'Yes' : 'No'}</Typography>;
        }
        break;
      }

      case FIELD_TYPE.SELECT:
      case FIELD_TYPE.RADIO: {
        if (Array.isArray(value)) {
          const lbls = (value as (string | number)[]).map(
            (v) => fieldConfig.options?.find((o) => o.value === v)?.label ?? String(v),
          );
          display = <ChipRow labels={lbls} />;
        } else {
          const opt = fieldConfig.options?.find((o) => o.value === value);
          display = <Typography variant="body1">{opt?.label ?? String(value)}</Typography>;
        }
        break;
      }

      case FIELD_TYPE.AUTOCOMPLETE: {
        if (Array.isArray(value)) {
          const lbls = (value as ({ label?: string } | string)[]).map((v) =>
            typeof v === 'string' ? v : (v?.label ?? String(v)),
          );
          display = <ChipRow labels={lbls} />;
        } else {
          const str =
            typeof value === 'object' && value !== null
              ? ((value as { label?: string }).label ?? JSON.stringify(value))
              : String(value);
          display = <Typography variant="body1">{str}</Typography>;
        }
        break;
      }

      case FIELD_TYPE.ARRAY: {
        const items = value as Record<string, unknown>[];
        if (!items.length) {
          display = (
            <Typography variant="body1" color="text.disabled">
              —
            </Typography>
          );
        } else {
          display = (
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              {items.map((_, idx) => (
                <Box
                  key={idx}
                  sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: 'block' }}
                  >
                    Item {idx + 1}
                  </Typography>
                  {fieldConfig.itemFields?.map((subField) => (
                    <ReadOnlyField
                      key={subField.name}
                      fieldConfig={{
                        ...subField,
                        name: `${fieldConfig.name}.${idx}.${subField.name}`,
                      }}
                      control={control}
                    />
                  ))}
                </Box>
              ))}
            </Stack>
          );
        }
        break;
      }

      case FIELD_TYPE.COMBO_INPUT: {
        const comboVal = value as { select?: string | number; input?: string | number };
        const selectLabel =
          fieldConfig.selectOptions?.find((o) => o.value === comboVal.select)?.label ??
          String(comboVal.select ?? '');
        const inputStr = String(comboVal.input ?? '');
        if (!selectLabel && !inputStr) {
          display = (
            <Typography variant="body1" color="text.disabled">
              —
            </Typography>
          );
        } else {
          const parts =
            fieldConfig.selectPosition === 'end'
              ? [inputStr, selectLabel]
              : [selectLabel, inputStr];
          display = <Typography variant="body1">{parts.filter(Boolean).join(' ')}</Typography>;
        }
        break;
      }

      default:
        display = <Typography variant="body1">{String(value)}</Typography>;
    }
  }

  return (
    <Box sx={{ mb: 1 }}>
      <FieldLabel
        htmlFor={fieldConfig.name}
        label={fieldConfig.label}
        required={fieldConfig.required}
        component="label"
      />
      <Box sx={{ pl: 0.5 }}>{display}</Box>
    </Box>
  );
});

ReadOnlyField.displayName = 'ReadOnlyField';
