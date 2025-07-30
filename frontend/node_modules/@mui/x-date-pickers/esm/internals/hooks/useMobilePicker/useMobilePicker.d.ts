import * as React from 'react';
import { UseMobilePickerParams, UseMobilePickerProps } from "./useMobilePicker.types.js";
import { DateOrTimeViewWithMeridiem } from "../../models/index.js";
/**
 * Hook managing all the single-date mobile pickers:
 * - MobileDatePicker
 * - MobileDateTimePicker
 * - MobileTimePicker
 */
export declare const useMobilePicker: <TView extends DateOrTimeViewWithMeridiem, TEnableAccessibleFieldDOMStructure extends boolean, TExternalProps extends UseMobilePickerProps<TView, TEnableAccessibleFieldDOMStructure, any, TExternalProps>>({
  props,
  steps,
  ...pickerParams
}: UseMobilePickerParams<TView, TEnableAccessibleFieldDOMStructure, TExternalProps>) => {
  renderPicker: () => React.JSX.Element;
};