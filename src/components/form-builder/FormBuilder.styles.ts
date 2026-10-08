import type { SxProps, Theme } from '@mui/material';

export function normalizeSx(sx: SxProps<Theme> | undefined) {
  if (Array.isArray(sx)) return [...sx];
  return sx != null ? [sx] : [];
}

export const formBuilderSx = {
  paper: {
    p: 0,
    bgcolor: 'transparent',
    boxShadow: 'none',
    '& .MuiOutlinedInput-root.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
  },
  actionsBox: { mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' },
  resetButton: { textTransform: 'none', fontWeight: 500 },
  cancelButton: { textTransform: 'none', fontWeight: 500 },
  submitButton: { px: 4, py: 1, fontWeight: 600 },
  sectionTitle: { fontWeight: 700 },
} as const;

export const getTitleSx = (titleAlign: 'left' | 'center' | 'right', isInside: boolean) => ({
  fontWeight: 700,
  textAlign: titleAlign,
  mb: isInside ? 2 : 1,
});

export const getSectionHeaderSx = (isFirst: boolean) => ({
  mt: isFirst ? 0 : 3,
  mb: 2,
});
