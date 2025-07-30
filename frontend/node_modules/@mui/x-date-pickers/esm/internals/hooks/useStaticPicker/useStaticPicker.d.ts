import * as React from 'react';
import { UseStaticPickerParams, UseStaticPickerProps } from "./useStaticPicker.types.js";
import { DateOrTimeViewWithMeridiem } from "../../models/index.js";
/**
 * Hook managing all the single-date static pickers:
 * - StaticDatePicker
 * - StaticDateTimePicker
 * - StaticTimePicker
 */
export declare const useStaticPicker: <TView extends DateOrTimeViewWithMeridiem, TExternalProps extends UseStaticPickerProps<TView, any, TExternalProps>>({
  props,
  steps,
  ...pickerParams
}: UseStaticPickerParams<TView, TExternalProps>) => {
  renderPicker: () => React.JSX.Element;
};