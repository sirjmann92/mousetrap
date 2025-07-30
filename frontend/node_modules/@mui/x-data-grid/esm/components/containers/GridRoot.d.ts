import * as React from 'react';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
export interface GridRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
  sidePanel?: React.ReactNode;
}
declare const MemoizedGridRoot: React.ForwardRefExoticComponent<GridRootProps> | React.ForwardRefExoticComponent<GridRootProps & React.RefAttributes<HTMLDivElement>>;
export { MemoizedGridRoot as GridRoot };