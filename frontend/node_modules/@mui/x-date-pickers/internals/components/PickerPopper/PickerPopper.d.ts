import * as React from 'react';
import { PaperProps as MuiPaperProps, PaperProps } from '@mui/material/Paper';
import { PopperProps as MuiPopperProps, PopperPlacementType, PopperProps } from '@mui/material/Popper';
import { TrapFocusProps as MuiTrapFocusProps } from '@mui/material/Unstable_TrapFocus';
import { TransitionProps as MuiTransitionProps } from '@mui/material/transitions';
import { SlotComponentPropsFromProps } from '@mui/x-internals/types';
import { PickerPopperClasses } from "./pickerPopperClasses.js";
import { PickerOwnerState } from "../../../models/index.js";
export interface PickerPopperOwnerState extends PickerOwnerState {
  popperPlacement: PopperPlacementType;
}
export interface PickerPopperSlots {
  /**
   * Custom component for the paper rendered inside the desktop picker's Popper.
   * @default PickerPopperPaper
   */
  desktopPaper?: React.JSXElementConstructor<MuiPaperProps>;
  /**
   * Custom component for the desktop popper [Transition](https://mui.com/material-ui/transitions/).
   * @default Grow or Fade from '@mui/material' when `reduceAnimations` is `true`.
   */
  desktopTransition?: React.JSXElementConstructor<MuiTransitionProps>;
  /**
   * Custom component for trapping the focus inside the views on desktop.
   * @default TrapFocus from '@mui/material'.
   */
  desktopTrapFocus?: React.JSXElementConstructor<MuiTrapFocusProps>;
  /**
   * Custom component for the popper inside which the views are rendered on desktop.
   * @default Popper from '@mui/material'.
   */
  popper?: React.ElementType<MuiPopperProps>;
}
export interface PickerPopperSlotProps {
  /**
   * Props passed down to the desktop [Paper](https://mui.com/material-ui/api/paper/) component.
   */
  desktopPaper?: SlotComponentPropsFromProps<PaperProps, {}, PickerPopperOwnerState>;
  /**
   * Props passed down to the desktop [Transition](https://mui.com/material-ui/transitions/) component.
   */
  desktopTransition?: Partial<MuiTransitionProps>;
  /**
   * Props passed down to the [FocusTrap](https://mui.com/base-ui/react-focus-trap/) component on desktop.
   */
  desktopTrapFocus?: Partial<MuiTrapFocusProps>;
  /**
   * Props passed down to [Popper](https://mui.com/material-ui/api/popper/) component.
   */
  popper?: SlotComponentPropsFromProps<PopperProps, {}, PickerOwnerState>;
}
export interface ExportedPickerPopperProps {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<PickerPopperClasses>;
  /**
   * @default "bottom-start"
   */
  placement?: MuiPopperProps['placement'];
}
export interface PickerPopperProps extends ExportedPickerPopperProps {
  children?: React.ReactNode;
  slots?: PickerPopperSlots;
  slotProps?: PickerPopperSlotProps;
}
export declare function PickerPopper(inProps: PickerPopperProps): React.JSX.Element;