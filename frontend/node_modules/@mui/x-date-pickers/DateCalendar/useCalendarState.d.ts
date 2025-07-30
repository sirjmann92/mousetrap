import { SlideDirection } from "./PickersSlideTransition.js";
import { PickersTimezone, PickerValidDate } from "../models/index.js";
import { DateCalendarDefaultizedProps } from "./DateCalendar.types.js";
interface CalendarState {
  currentMonth: PickerValidDate;
  focusedDay: PickerValidDate | null;
  isMonthSwitchingAnimating: boolean;
  slideDirection: SlideDirection;
}
interface UseCalendarStateParameters extends Pick<DateCalendarDefaultizedProps, 'referenceDate' | 'disableFuture' | 'disablePast' | 'minDate' | 'maxDate' | 'onMonthChange' | 'onYearChange' | 'reduceAnimations' | 'shouldDisableDate'> {
  value: PickerValidDate | null;
  timezone: PickersTimezone;
  getCurrentMonthFromVisibleDate: (focusedDay: PickerValidDate, prevMonth: PickerValidDate) => PickerValidDate;
}
interface UseCalendarStateReturnValue {
  referenceDate: PickerValidDate;
  calendarState: CalendarState;
  setVisibleDate: (parameters: SetVisibleDateParameters) => void;
  isDateDisabled: (day: PickerValidDate | null) => boolean;
  onMonthSwitchingAnimationEnd: () => void;
}
export declare const useCalendarState: (params: UseCalendarStateParameters) => UseCalendarStateReturnValue;
interface SetVisibleDateParameters {
  target: PickerValidDate;
  reason: 'header-navigation' | 'cell-interaction' | 'controlled-value-change';
}
export {};