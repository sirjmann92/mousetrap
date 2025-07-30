import { PickerLayoutOwnerState, PickersLayoutProps, SubComponents } from "./PickersLayout.types.js";
import { PickerValidValue } from "../internals/models/index.js";
interface UsePickerLayoutResponse<TValue extends PickerValidValue> extends SubComponents<TValue> {
  ownerState: PickerLayoutOwnerState;
}
declare const usePickerLayout: <TValue extends PickerValidValue>(props: PickersLayoutProps<TValue>) => UsePickerLayoutResponse<TValue>;
export default usePickerLayout;