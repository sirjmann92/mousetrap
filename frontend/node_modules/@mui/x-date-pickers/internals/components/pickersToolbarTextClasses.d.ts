export interface PickersToolbarTextClasses {
  /** Styles applied to the root element. */
  root: string;
}
export type PickersToolbarTextClassKey = keyof PickersToolbarTextClasses;
export declare function getPickersToolbarTextUtilityClass(slot: string): string;
export declare const pickersToolbarTextClasses: Record<"root", string>;