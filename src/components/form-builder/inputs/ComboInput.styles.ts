export const comboInputSx = {
  container: {
    display: 'flex',
    '& > :not(:first-of-type)': { marginLeft: '-1px' },
    '& > :focus-within': { position: 'relative', zIndex: 1 },
  },
} as const;

export const getComboSelectSx = (selectPosition: 'start' | 'end', selectWidth: number) => ({
  minWidth: selectWidth,
  flexShrink: 0,
  '& .MuiOutlinedInput-root': {
    borderRadius: selectPosition === 'start' ? '4px 0 0 4px' : '0 4px 4px 0',
  },
});

export const getComboTextFieldSx = (selectPosition: 'start' | 'end') => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: selectPosition === 'start' ? '0 4px 4px 0' : '4px 0 0 4px',
  },
});
