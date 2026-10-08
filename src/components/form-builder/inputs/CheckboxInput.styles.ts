export const checkboxInputSx = {
  formControl: { width: '100%' },
  asterisk: { color: 'error.main', ml: 0.5 },
} as const;

function getLabelColor(error: boolean, disabled?: boolean): string {
  if (error) return 'error.main';
  if (disabled) return 'text.disabled';
  return 'text.primary';
}

export const getCheckboxGroupLabelSx = (error: boolean, disabled?: boolean) => ({
  fontWeight: 600,
  fontSize: '0.875rem',
  mb: 1,
  color: getLabelColor(error, disabled),
  '&.Mui-focused': { color: 'inherit' },
});
