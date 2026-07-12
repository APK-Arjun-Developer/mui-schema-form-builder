export const formBuilderSx = {
  paper: { p: 0, bgcolor: 'transparent', boxShadow: 'none' },
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
