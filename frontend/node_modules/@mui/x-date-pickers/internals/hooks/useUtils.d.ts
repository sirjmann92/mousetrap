import { PickersTimezone, PickerValidDate } from "../../models/index.js";
export declare const useDefaultDates: () => {
  minDate: PickerValidDate;
  maxDate: PickerValidDate;
};
export declare const useNow: (timezone: PickersTimezone) => PickerValidDate;