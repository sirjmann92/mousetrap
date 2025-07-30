import * as React from 'react';
import { GridFilterInputValueProps } from "../../../models/gridFilterInputComponent.js";
import { TextFieldProps } from "../../../models/gridBaseSlots.js";
export type GridFilterInputDateProps = GridFilterInputValueProps<TextFieldProps> & {
  type?: 'date' | 'datetime-local';
};
declare function GridFilterInputDate(props: GridFilterInputDateProps): React.JSX.Element;
declare namespace GridFilterInputDate {
  var propTypes: any;
}
export { GridFilterInputDate };