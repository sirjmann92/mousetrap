import * as React from 'react';
import { PickersInputBaseProps } from "../PickersInputBase/index.js";
import { PickerTextFieldOwnerState } from "../../models/fields.js";
export interface PickersInputProps extends PickersInputBaseProps {
  disableUnderline?: boolean;
}
export interface PickerInputOwnerState extends PickerTextFieldOwnerState {
  /**
   * `true` if the input has an underline, `false` otherwise.
   */
  inputHasUnderline: boolean;
}
/**
 * @ignore - internal component.
 */
declare const PickersInput: React.ForwardRefExoticComponent<Omit<PickersInputProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { PickersInput };