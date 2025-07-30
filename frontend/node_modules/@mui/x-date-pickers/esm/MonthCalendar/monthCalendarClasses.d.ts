export declare function getMonthCalendarUtilityClass(slot: string): string;
export interface MonthCalendarClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the button element that represents a single month */
  button: string;
  /** Styles applied to a disabled button element. */
  disabled: string;
  /** Styles applied to a selected button element. */
  selected: string;
}
export type MonthCalendarClassKey = keyof MonthCalendarClasses;
export declare const monthCalendarClasses: Record<keyof MonthCalendarClasses, string>;