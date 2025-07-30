import { PickerManager } from "../../../models/index.js";
import { PickerValidValue } from "../../models/index.js";
import { UseFieldStateReturnValue } from "./useFieldState.js";
import { UseFieldInternalProps } from "./useField.types.js";
/**
 * Returns the `onKeyDown` handler to pass to the root element of the field.
 */
export declare function useFieldRootHandleKeyDown<TValue extends PickerValidValue>(parameters: UseFieldRootHandleKeyDownParameters<TValue>): (event: React.KeyboardEvent<HTMLSpanElement>) => void;
interface UseFieldRootHandleKeyDownParameters<TValue extends PickerValidValue> {
  manager: PickerManager<TValue, any, any, any, any>;
  stateResponse: UseFieldStateReturnValue<TValue>;
  internalPropsWithDefaults: UseFieldInternalProps<TValue, any, any> & {
    minutesStep?: number;
  };
}
export {};