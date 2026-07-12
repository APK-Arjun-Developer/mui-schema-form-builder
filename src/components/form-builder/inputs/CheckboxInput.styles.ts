export const checkboxInputSx = {
  formControl: { width: '100%' },
  asterisk: { color: 'error.main', ml: 0.5 },
} as const;

export const getCheckboxGroupLabelSx = (error: boolean, disabled?: boolean) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  mb: 1,
  color: error ? 'error.main' : disabled ? 'text.disabled' : 'text.primary',
  '&.Mui-focused': { color: 'inherit' },
});
