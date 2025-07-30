import * as React from 'react';
import { PickersInputBaseProps } from "../PickersInputBase/index.js";
import { PickerTextFieldOwnerState } from "../../models/fields.js";
export interface PickersFilledInputProps extends PickersInputBaseProps {
  disableUnderline?: boolean;
  hiddenLabel?: boolean;
}
export interface PickerFilledInputOwnerState extends PickerTextFieldOwnerState {
  /**
   * `true` if the input  has an underline, `false` otherwise.
   */
  inputHasUnderline: boolean;
  hiddenLabel?: boolean;
}
/**
 * @ignore - internal component.
 */
declare const PickersFilledInput: React.ForwardRefExoticComponent<Omit<PickersFilledInputProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { PickersFilledInput };