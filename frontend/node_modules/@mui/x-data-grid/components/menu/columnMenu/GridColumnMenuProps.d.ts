import * as React from 'react';
import { GridColDef } from "../../../models/colDef/gridColDef.js";
import { GridColumnMenuRootProps } from "../../../hooks/features/columnMenu/index.js";
export interface GridColumnMenuContainerProps extends React.HTMLAttributes<HTMLUListElement> {
  hideMenu: (event: React.SyntheticEvent) => void;
  colDef: GridColDef;
  open: boolean;
  id?: string;
  labelledby?: string;
}
export interface GridGenericColumnMenuProps extends GridColumnMenuRootProps, GridColumnMenuContainerProps {}
export interface GridColumnMenuProps extends Omit<GridGenericColumnMenuProps, 'defaultSlots' | 'defaultSlotProps'> {}