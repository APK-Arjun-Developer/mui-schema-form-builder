export const formWizardSx = {
  paper: { p: 0, bgcolor: 'transparent', boxShadow: 'none' },
  stepper: { mb: 3 },
  divider: { mb: 3 },
  actionsBox: { mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' },
  cancelButton: { textTransform: 'none', fontWeight: 500 },
  backButton: { textTransform: 'none', fontWeight: 500 },
  submitButton: { px: 4, py: 1, fontWeight: 600 },
  nextButton: { px: 4, py: 1, fontWeight: 600, textTransform: 'none' },
} as const;
