import * as React from 'react';
import type { PickerContextValue } from "../internals/components/PickerProvider.js";
import { DateOrTimeViewWithMeridiem, PickerValidValue, PickerValue } from "../internals/models/index.js";
export declare const PickerContext: React.Context<PickerContextValue<any, any, any> | null>;
/**
 * Returns the context passed by the Picker wrapping the current component.
 */
export declare const usePickerContext: <TValue extends PickerValidValue = PickerValue, TView extends DateOrTimeViewWithMeridiem = DateOrTimeViewWithMeridiem, TError = string | null>() => PickerContextValue<TValue, TView, TError>;