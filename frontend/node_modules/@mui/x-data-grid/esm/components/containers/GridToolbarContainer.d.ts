import * as React from 'react';
import { SxProps, Theme } from '@mui/system';
export type GridToolbarContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  sx?: SxProps<Theme>;
};
/**
 * @deprecated Use the {@link https://mui.com/x/react-data-grid/components/toolbar/ Toolbar} component instead. This component will be removed in a future major release.
 */
declare const GridToolbarContainer: React.ForwardRefExoticComponent<GridToolbarContainerProps> | React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
  sx?: SxProps<Theme>;
} & React.RefAttributes<HTMLDivElement>>;
export { GridToolbarContainer };