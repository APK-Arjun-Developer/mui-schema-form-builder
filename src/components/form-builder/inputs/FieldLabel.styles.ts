export const fieldLabelSx = {
  wrapper: { mb: 1, display: 'flex', alignItems: 'center' },
  asterisk: { color: 'error.main', ml: 0.5 },
} as const;

export const getFieldLabelTextSx = (
  error: boolean,
  disabled?: boolean,
  component: 'label' | 'legend' = 'label',
) => ({
  fontWeight: 600,
  display: 'block',
  color: error ? 'error.main' : disabled ? 'text.disabled' : 'text.primary',
  fontSize: '0.875rem',
  cursor: component === 'label' ? 'default' : undefined,
});
