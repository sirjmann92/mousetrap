import { PickersInputBaseClasses } from "../PickersInputBase/index.js";
export interface PickersFilledInputClasses extends PickersInputBaseClasses {
  /** Styles applied to the root element unless `disableUnderline={true}`. */
  underline: string;
}
export type PickersFilledInputClassKey = keyof PickersFilledInputClasses;
export declare function getPickersFilledInputUtilityClass(slot: string): string;
export declare const pickersFilledInputClasses: {
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