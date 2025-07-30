import * as React from 'react';
import { GridSlotProps, GridBaseIconProps } from "../../models/gridSlotsComponentsProps.js";
interface GridActionsCellItemCommonProps {
  icon?: React.JSXElementConstructor<GridBaseIconProps> | React.ReactNode;
  /** from https://mui.com/material-ui/api/button-base/#ButtonBase-prop-component */
  component?: React.ElementType;
}
export type GridActionsCellItemProps = GridActionsCellItemCommonProps & (({
  showInMenu?: false;
  icon: React.ReactElement<any>;
  label: string;
} & Omit<GridSlotProps['baseIconButton'], 'component'>) | ({
  showInMenu: true;
  /**
   * If false, the menu will not close when this item is clicked.
   * @default true
   */
  closeMenuOnClick?: boolean;
  closeMenu?: () => void;
  label: React.ReactNode;
} & Omit<GridSlotProps['baseMenuItem'], 'component'>));
declare const GridActionsCellItem: React.ForwardRefExoticComponent<GridActionsCellItemProps> | React.ForwardRefExoticComponent<((GridActionsCellItemCommonProps & {
  showInMenu: true;
  /**
   * If false, the menu will not close when this item is clicked.
   * @default true
   */
  closeMenuOnClick?: boolean;
  closeMenu?: () => void;
  label: React.ReactNode;
} & Omit<React.DOMAttributes<HTMLElement> & {
  [k: `aria-${string}`]: any;
  [k: `data-${string}`]: any;
  className?: string;
  style?: React.CSSProperties;
} & {
  autoFocus?: boolean;
  children?: React.ReactNode;
  inert?: boolean;
  disabled?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  selected?: boolean;
  value?: number | string | readonly string[];
  style?: React.CSSProperties;
} & import("@mui/x-data-grid").BaseMenuItemPropsOverrides, "component">) | Omit<GridActionsCellItemCommonProps & {
  showInMenu?: false;
  icon: React.ReactElement<any>;
  label: string;
} & Omit<Omit<import("../../models/gridBaseSlots.js").ButtonProps, "startIcon"> & {
  label?: string;
  color?: "default" | "inherit" | "primary";
  edge?: "start" | "end" | false;
} & import("@mui/x-data-grid").BaseIconButtonPropsOverrides, "component">, "ref">) & React.RefAttributes<HTMLElement>>;
export { GridActionsCellItem };