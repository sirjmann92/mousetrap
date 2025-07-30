import * as React from 'react';
import { DefaultizedProps, SlotComponentPropsFromProps } from '@mui/x-internals/types';
import { PickerDayOwnerState, PickersDayProps } from "../PickersDay/index.js";
import { ExportedPickersDayProps } from "../PickersDay/PickersDay.types.js";
import { PickerOnChangeFn } from "../internals/hooks/useViews.js";
import { SlideDirection, SlideTransitionProps } from "./PickersSlideTransition.js";
import { BaseDateValidationProps, DayValidationProps, MonthValidationProps, YearValidationProps } from "../internals/models/validation.js";
import { DayCalendarClasses } from "./dayCalendarClasses.js";
import { PickerValidDate, TimezoneProps } from "../models/index.js";
import { FormProps } from "../internals/models/formProps.js";
export interface DayCalendarSlots {
  /**
   * Custom component for day.
   * Check the [PickersDay](https://mui.com/x/api/date-pickers/pickers-day/) component.
   * @default PickersDay
   */
  day?: React.ElementType<PickersDayProps>;
}
export interface DayCalendarSlotProps {
  day?: SlotComponentPropsFromProps<PickersDayProps, {}, PickerDayOwnerState>;
}
export interface ExportedDayCalendarProps extends ExportedPickersDayProps {
  /**
   * If `true`, calls `renderLoading` instead of rendering the day calendar.
   * Can be used to preload information and show it in calendar.
   * @default false
   */
  loading?: boolean;
  /**
   * Component rendered on the "day" view when `props.loading` is true.
   * @returns {React.ReactNode} The node to render when loading.
   * @default () => "..."
   */
  renderLoading?: () => React.ReactNode;
  /**
   * Formats the day of week displayed in the calendar header.
   * @param {PickerValidDate} date The date of the day of week provided by the adapter.
   * @returns {string} The name to display.
   * @default (date: PickerValidDate) => adapter.format(date, 'weekdayShort').charAt(0).toUpperCase()
   */
  dayOfWeekFormatter?: (date: PickerValidDate) => string;
  /**
   * If `true`, the week number will be display in the calendar.
   */
  displayWeekNumber?: boolean;
  /**
   * The day view will show as many weeks as needed after the end of the current month to match this value.
   * Put it to 6 to have a fixed number of weeks in Gregorian calendars
   */
  fixedWeekNumber?: number;
}
export interface DayCalendarProps extends ExportedDayCalendarProps, DayValidationProps, MonthValidationProps, YearValidationProps, Required<BaseDateValidationProps>, DefaultizedProps<TimezoneProps, 'timezone'>, FormProps {
  className?: string;
  currentMonth: PickerValidDate;
  selectedDays: (PickerValidDate | null)[];
  onSelectedDaysChange: PickerOnChangeFn;
  focusedDay: PickerValidDate | null;
  isMonthSwitchingAnimating: boolean;
  onFocusedDayChange: (newFocusedDay: PickerValidDate) => void;
  onMonthSwitchingAnimationEnd: () => void;
  reduceAnimations: boolean;
  slideDirection: SlideDirection;
  TransitionProps?: Partial<SlideTransitionProps>;
  hasFocus: boolean;
  onFocusedViewChange?: (newHasFocus: boolean) => void;
  gridLabelId?: string;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<DayCalendarClasses>;
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: DayCalendarSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: DayCalendarSlotProps;
}
/**
 * @ignore - do not document.
 */
export declare function DayCalendar(inProps: DayCalendarProps): React.JSX.Element;