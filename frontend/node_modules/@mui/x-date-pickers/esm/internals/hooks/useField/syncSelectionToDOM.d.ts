import { PickerValidValue } from "../../models/index.js";
import { UseFieldDOMGetters } from "./useField.types.js";
import { UseFieldStateReturnValue } from "./useFieldState.js";
export declare function syncSelectionToDOM<TValue extends PickerValidValue>(parameters: SyncSelectionToDOMParameters<TValue>): void;
export interface SyncSelectionToDOMParameters<TValue extends PickerValidValue> {
  domGetters: UseFieldDOMGetters;
  stateResponse: UseFieldStateReturnValue<TValue>;
  focused: boolean;
}