import type React from 'react';

export interface TabPanelProps {
  value: number;
  index: number;
  children: React.ReactNode;
}

export interface JsonPreviewProps {
  data: unknown;
}
