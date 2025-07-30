import { MuiPickersAdapter, PickersTimezone, PickerValidDate } from "../../models/index.js";
import { PickerValue } from "../models/index.js";
export declare const useClockReferenceDate: <TProps extends {}>({
  value,
  referenceDate: referenceDateProp,
  adapter,
  props,
  timezone
}: {
  value: PickerValue;
  referenceDate: PickerValidDate | undefined;
  adapter: MuiPickersAdapter;
  props: TProps;
  timezone: PickersTimezone;
}) => PickerValidDate;