import { PickerActionsContextValue } from "../internals/components/PickerProvider.js";
import { DateOrTimeViewWithMeridiem, PickerValidValue, PickerValue } from "../internals/models/index.js";
/**
 * Returns a subset of the context passed by the Picker wrapping the current component.
 * It only contains the actions and never causes a re-render of the component using it.
 */
export declare const usePickerActionsContext: <TValue extends PickerValidValue = PickerValue, TView extends DateOrTimeViewWithMeridiem = DateOrTimeViewWithMeridiem, TError = string | null>() => PickerActionsContextValue<TValue, TView, TError>;