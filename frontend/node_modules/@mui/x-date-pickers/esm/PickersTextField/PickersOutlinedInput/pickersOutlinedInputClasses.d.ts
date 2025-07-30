import { PickersInputBaseClasses } from "../PickersInputBase/index.js";
export interface PickersOutlinedInputClasses extends PickersInputBaseClasses {
  /** Styles applied to the NotchedOutline element. */
  notchedOutline: string;
}
export type PickersOutlinedInputClassKey = keyof PickersOutlinedInputClasses;
export declare function getPickersOutlinedInputUtilityClass(slot: string): string;
export declare const pickersOutlinedInputClasses: {
  root: string;
  input: string;
  notchedOutline: string;
  sectionContent: string;
  disabled: string;
  readOnly: string;
  focused: string;
  error: string;
  inputSizeSmall: string;
  sectionsContainer: string;
  sectionBefore: string;
  sectionAfter: string;
  adornedStart: string;
  adornedEnd: string;
  activeBar: string;
};