export interface PickerPopperClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the paper element. */
  paper: string;
}
export type PickerPopperClassKey = keyof PickerPopperClasses;
export declare function getPickerPopperUtilityClass(slot: string): string;
export declare const pickerPopperClasses: Record<"root" | "paper", string>;