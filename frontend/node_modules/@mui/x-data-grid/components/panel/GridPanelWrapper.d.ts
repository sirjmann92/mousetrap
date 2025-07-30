import * as React from 'react';
import { Theme } from '@mui/material/styles';
import { MUIStyledCommonProps } from '@mui/system';
export interface GridPanelWrapperProps extends React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>, MUIStyledCommonProps<Theme> {}
declare const GridPanelWrapper: React.ForwardRefExoticComponent<GridPanelWrapperProps> | React.ForwardRefExoticComponent<GridPanelWrapperProps & React.RefAttributes<HTMLDivElement>>;
export { GridPanelWrapper };