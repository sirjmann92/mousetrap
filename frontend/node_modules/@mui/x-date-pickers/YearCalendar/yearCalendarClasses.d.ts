export interface YearCalendarClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the button element that represents a single year */
  button: string;
  /** Styles applied to a disabled button element. */
  disabled: string;
  /** Styles applied to a selected button element. */
  selected: string;
}
export type YearCalendarClassKey = keyof YearCalendarClasses;
export declare function getYearCalendarUtilityClass(slot: string): string;
export declare const yearCalendarClasses: Record<"root" | "disabled" | "button" | "selected", string>;