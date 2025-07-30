import { PickersInputBaseClasses } from "../PickersInputBase/index.js";
export interface PickersInputClasses extends PickersInputBaseClasses {
  /** Styles applied to the root element unless `disableUnderline={true}`. */
  underline: string;
}
export type PickersInputClassKey = keyof PickersInputClasses;
export declare function getPickersInputUtilityClass(slot: string): string;
export declare const pickersInputClasses: {
  root: string;
  input: string;
  underline: string;
  sectionContent: string;
  disabled: string;
  readOnly: string;
  focused: string;
  error: string;
  inputSizeSmall: string;
  notchedOutline: string;
  sectionsContainer: string;
  sectionBefore: string;
  sectionAfter: string;
  adornedStart: string;
  adornedEnd: string;
  activeBar: string;
};