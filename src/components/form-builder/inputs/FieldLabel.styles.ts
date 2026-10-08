export const fieldLabelSx = {
  wrapper: { mb: 1, display: 'flex', alignItems: 'center' },
  asterisk: { color: 'error.main', ml: 0.5 },
} as const;

function getLabelColor(error: boolean, disabled?: boolean): string {
  if (error) return 'error.main';
  if (disabled) return 'text.disabled';
  return 'text.primary';
}

export const getFieldLabelTextSx = (
  error: boolean,
  disabled?: boolean,
  component: 'label' | 'legend' = 'label',
) => ({
  fontWeight: 600,
  display: 'block',
  color: getLabelColor(error, disabled),
  fontSize: '0.875rem',
  cursor: component === 'label' ? 'default' : undefined,
});
