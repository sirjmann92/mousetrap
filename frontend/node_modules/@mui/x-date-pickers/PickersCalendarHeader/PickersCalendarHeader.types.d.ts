import * as React from 'react';
import { SlotComponentProps } from '@mui/utils/types';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import { SxProps, Theme } from '@mui/material/styles';
import { ExportedPickersArrowSwitcherProps, PickersArrowSwitcherSlots, PickersArrowSwitcherSlotProps } from "../internals/components/PickersArrowSwitcher/index.js";
import { MonthValidationOptions } from "../internals/hooks/date-helpers-hooks.js";
import { PickerValidDate, DateView, PickerOwnerState } from "../models/index.js";
import { PickersCalendarHeaderClasses } from "./pickersCalendarHeaderClasses.js";
export interface PickersCalendarHeaderSlots extends PickersArrowSwitcherSlots {
  /**
   * Button displayed to switch between different calendar views.
   * @default IconButton
   */
  switchViewButton?: React.ElementType;
  /**
   * Icon displayed in the SwitchViewButton. Rotated by 180° when the open view is `year`.
   * @default ArrowDropDown
   */
  switchViewIcon?: React.ElementType;
}
export interface PickersCalendarHeaderSlotPropsOverrides {}
export interface PickersCalendarHeaderSlotProps extends PickersArrowSwitcherSlotProps {
  switchViewButton?: SlotComponentProps<typeof IconButton, PickersCalendarHeaderSlotPropsOverrides, PickerOwnerState>;
  switchViewIcon?: SlotComponentProps<typeof SvgIcon, PickersCalendarHeaderSlotPropsOverrides, PickerOwnerState>;
}
export interface PickersCalendarHeaderProps extends ExportedPickersArrowSwitcherProps, MonthValidationOptions {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: PickersCalendarHeaderSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: PickersCalendarHeaderSlotProps;
  currentMonth: PickerValidDate;
  disabled?: boolean;
  views: readonly DateView[];
  onMonthChange: (date: PickerValidDate) => void;
  view: DateView;
  reduceAnimations: boolean;
  onViewChange?: (view: DateView) => void;
  /**
   * Id of the calendar text element.
   * It is used to establish an `aria-labelledby` relationship with the calendar `grid` element.
   */
  labelId?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<PickersCalendarHeaderClasses>;
  className?: string;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxProps<Theme>;
}
export type ExportedPickersCalendarHeaderProps = Pick<PickersCalendarHeaderProps, 'classes' | 'slots' | 'slotProps'>;