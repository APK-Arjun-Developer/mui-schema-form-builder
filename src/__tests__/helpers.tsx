import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme();

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export function renderWithTheme(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Wrapper, ...options });
}
