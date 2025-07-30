import * as React from 'react';
import { DateOrTimeViewWithMeridiem, PickerValidValue, PickerValueManager } from "../../../models/index.js";
import { PickerSelectionState, UsePickerProps, UsePickerState } from "../usePicker.types.js";
import { InferError } from "../../../../models/index.js";
import { SetValueActionOptions } from "../../../components/PickerProvider.js";
import { Validator } from "../../../../validation/index.js";
export declare function useValueAndOpenStates<TValue extends PickerValidValue, TView extends DateOrTimeViewWithMeridiem, TExternalProps extends UsePickerProps<TValue, TView, any, any>>(parameters: UsePickerDateStateParameters<TValue, TView, TExternalProps>): {
  timezone: string;
  state: UsePickerState<TValue>;
  setValue: (newValue: TValue, options?: SetValueActionOptions<InferError<TExternalProps>>) => void;
  setValueFromView: (newValue: TValue, selectionState?: PickerSelectionState) => void;
  setOpen: (action: React.SetStateAction<boolean>) => void;
  value: TValue;
  viewValue: TValue;
};
interface UsePickerDateStateParameters<TValue extends PickerValidValue, TView extends DateOrTimeViewWithMeridiem, TExternalProps extends UsePickerProps<TValue, TView, any, any>> {
  props: TExternalProps;
  valueManager: PickerValueManager<TValue, InferError<TExternalProps>>;
  validator: Validator<TValue, InferError<TExternalProps>, TExternalProps>;
}
export {};