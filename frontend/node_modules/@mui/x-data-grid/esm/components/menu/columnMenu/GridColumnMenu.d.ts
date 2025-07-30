import * as React from 'react';
import { GridColumnMenuColumnsItem } from "./menuItems/GridColumnMenuColumnsItem.js";
import { GridColumnMenuFilterItem } from "./menuItems/GridColumnMenuFilterItem.js";
import { GridColumnMenuSortItem } from "./menuItems/GridColumnMenuSortItem.js";
import { GridColumnMenuProps, GridGenericColumnMenuProps } from "./GridColumnMenuProps.js";
export declare const GRID_COLUMN_MENU_SLOTS: {
  columnMenuSortItem: typeof GridColumnMenuSortItem;
  columnMenuFilterItem: typeof GridColumnMenuFilterItem;
  columnMenuColumnsItem: typeof GridColumnMenuColumnsItem;
};
export declare const GRID_COLUMN_MENU_SLOT_PROPS: {
  columnMenuSortItem: {
    displayOrder: number;
  };
  columnMenuFilterItem: {
    displayOrder: number;
  };
  columnMenuColumnsItem: {
    displayOrder: number;
  };
};
declare const GridGenericColumnMenu: React.ForwardRefExoticComponent<GridGenericColumnMenuProps> | React.ForwardRefExoticComponent<GridGenericColumnMenuProps & React.RefAttributes<HTMLUListElement>>;
declare const GridColumnMenu: React.ForwardRefExoticComponent<GridColumnMenuProps> | React.ForwardRefExoticComponent<GridColumnMenuProps & React.RefAttributes<HTMLUListElement>>;
export { GridColumnMenu, GridGenericColumnMenu };