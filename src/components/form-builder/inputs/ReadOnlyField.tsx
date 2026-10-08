import React from 'react';
import { useController } from 'react-hook-form';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { FIELD_TYPE } from '../types/field.types';
import type {
  FieldConfig,
  SelectFieldConfig,
  RadioFieldConfig,
  CheckboxFieldConfig,
  ArrayFieldConfig,
  ComboFieldConfig,
} from '../types/field.types';
import type { Control } from 'react-hook-form';
import type { ReadOnlyFieldProps } from '../types/component.types';
import { FieldLabel } from './FieldLabel';
import { readOnlyFieldSx } from './ReadOnlyField.styles';

const ChipRow = React.memo(function ChipRow({ labels }: { labels: string[] }) {
  if (!labels.length)
    return (
      <Typography variant="body1" color="text.disabled">
        —
      </Typography>
    );
  return (
    <Stack direction="row" sx={readOnlyFieldSx.chipRow}>
      {labels.map((l) => (
        <Chip key={l} label={l} size="small" />
      ))}
    </Stack>
  );
});
ChipRow.displayName = 'ChipRow';

// Extracted to a standalone function to keep ReadOnlyField's cognitive complexity low.
// The ARRAY case is handled separately in the component because it recurses into ReadOnlyField.
function renderNonArrayValue(fieldConfig: FieldConfig, value: unknown): React.ReactNode {
  switch (fieldConfig.type) {
    case FIELD_TYPE.CHECKBOX: {
      const cfg = fieldConfig as CheckboxFieldConfig;
      if (cfg.options) {
        const checked = value as (string | number)[];
        const lbs = checked.map((v) => cfg.options?.find((o) => o.value === v)?.label ?? String(v));
        return <ChipRow labels={lbs} />;
      }
      return <Typography variant="body1">{value ? 'Yes' : 'No'}</Typography>;
    }

    case FIELD_TYPE.SELECT:
    case FIELD_TYPE.RADIO: {
      const cfg = fieldConfig as SelectFieldConfig | RadioFieldConfig;
      if (Array.isArray(value)) {
        const lbs = (value as (string | number)[]).map(
          (v) => cfg.options?.find((o) => o.value === v)?.label ?? String(v),
        );
        return <ChipRow labels={lbs} />;
      }
      const opt = cfg.options?.find((o) => o.value === value);
      return (
        <Typography variant="body1">{opt?.label ?? String(value as string | number)}</Typography>
      );
    }

    case FIELD_TYPE.AUTOCOMPLETE: {
      if (Array.isArray(value)) {
        const lbls = (value as ({ label?: string } | string)[]).map((v) =>
          typeof v === 'string' ? v : (v?.label ?? JSON.stringify(v)),
        );
        return <ChipRow labels={lbls} />;
      }
      const str =
        typeof value === 'object' && value !== null
          ? ((value as { label?: string }).label ?? JSON.stringify(value))
          : String(value as string | number);
      return <Typography variant="body1">{str}</Typography>;
    }

    case FIELD_TYPE.COMBO_INPUT: {
      const cfg = fieldConfig as ComboFieldConfig;
      const comboVal = value as { select?: string | number; input?: string | number };
      const selectLabel =
        cfg.selectOptions?.find((o) => o.value === comboVal.select)?.label ??
        String(comboVal.select ?? '');
      const inputStr = String(comboVal.input ?? '');
      if (!selectLabel && !inputStr) {
        return (
          <Typography variant="body1" color="text.disabled">
            —
          </Typography>
        );
      }
      const parts =
        cfg.selectPosition === 'end' ? [inputStr, selectLabel] : [selectLabel, inputStr];
      return <Typography variant="body1">{parts.filter(Boolean).join(' ')}</Typography>;
    }

    default:
      return <Typography variant="body1">{String(value as string | number)}</Typography>;
  }
}

function renderArrayValue(
  fieldConfig: ArrayFieldConfig,
  items: Record<string, unknown>[],
  control: Control,
): React.ReactNode {
  if (!items.length) {
    return (
      <Typography variant="body1" color="text.disabled">
        —
      </Typography>
    );
  }
  return (
    <Stack spacing={1} sx={readOnlyFieldSx.arrayStack}>
      {items.map((item, idx) => (
        // JSON.stringify(item) produces a content-based key; array items have no stable ID.
        <Box key={JSON.stringify(item)} sx={readOnlyFieldSx.arrayItem}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={readOnlyFieldSx.arrayItemCaption}
          >
            Item {idx + 1}
          </Typography>
          {fieldConfig.itemFields?.map((subField) => (
            <ReadOnlyField
              key={subField.name}
              fieldConfig={
                {
                  ...subField,
                  name: `${fieldConfig.name}.${idx}.${subField.name}`,
                } as FieldConfig
              }
              control={control}
            />
          ))}
        </Box>
      ))}
    </Stack>
  );
}

export const ReadOnlyField = React.memo(({ fieldConfig, control }: ReadOnlyFieldProps) => {
  const { field } = useController({ name: fieldConfig.name, control });
  const value = field.value;
  const empty = value === null || value === undefined || value === '';

  const emptyNode = (
    <Typography variant="body1" color="text.disabled">
      —
    </Typography>
  );

  let display: React.ReactNode;
  if (empty) {
    display = emptyNode;
  } else if (fieldConfig.type === FIELD_TYPE.ARRAY) {
    display = renderArrayValue(
      fieldConfig as ArrayFieldConfig,
      value as Record<string, unknown>[],
      control,
    );
  } else {
    display = renderNonArrayValue(fieldConfig, value);
  }

  return (
    <Box sx={readOnlyFieldSx.wrapper}>
      <FieldLabel
        htmlFor={fieldConfig.name}
        label={fieldConfig.label}
        required={fieldConfig.required}
        component="label"
      />
      <Box sx={readOnlyFieldSx.valueBox}>{display}</Box>
    </Box>
  );
});

ReadOnlyField.displayName = 'ReadOnlyField';
