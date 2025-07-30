import type { PickerRangeValue, PickerValueManager } from "../models/index.js";
import { PickersTimezone, PickerValidDate } from "../../models/index.js";
import { PickerValidValue } from "../models/index.js";
/**
 * Hooks controlling the value while making sure that:
 * - The value returned by `onChange` always have the timezone of `props.value` or `props.defaultValue` if defined
 * - The value rendered is always the one from `props.timezone` if defined
 */
export declare const useControlledValue: <TValue extends PickerValidValue, TChange extends (...params: any[]) => void>({
  name,
  timezone: timezoneProp,
  value: valueProp,
  defaultValue,
  referenceDate,
  onChange: onChangeProp,
  valueManager
}: UseControlledValueWithTimezoneParameters<TValue, TChange>) => {
  value: TValue;
  handleValueChange: TChange;
  timezone: string;
};
interface UseValueWithTimezoneParameters<TValue extends PickerValidValue, TChange extends (...params: any[]) => void> {
  timezone: PickersTimezone | undefined;
  value: TValue | undefined;
  defaultValue: TValue | undefined;
  /**
   * The reference date as passed to `props.referenceDate`.
   * It does not need to have its default value.
   * This is only used to determine the timezone to use when `props.value` and `props.defaultValue` are not defined.
   */
  referenceDate?: TValue extends PickerRangeValue ? TValue | PickerValidDate : PickerValidDate;
  onChange: TChange | undefined;
  valueManager: PickerValueManager<TValue, any>;
}
interface UseControlledValueWithTimezoneParameters<TValue extends PickerValidValue, TChange extends (...params: any[]) => void> extends UseValueWithTimezoneParameters<TValue, TChange> {
  name: string;
}
export {};