export const arrayInputSx = {
  itemBox: {
    mb: 2,
    p: 2,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 1.5,
  },
  removeButton: { textTransform: 'none' },
} as const;

export const getAddButtonSx = (hasItems: boolean) => ({
  textTransform: 'none' as const,
  mt: hasItems ? 1 : 0,
});
