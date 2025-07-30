import { DateView, MuiPickersAdapter, PickersTimezone, PickerValidDate, PickerValueType } from "../../models/index.js";
import { DateOrTimeViewWithMeridiem } from "../models/index.js";
export declare const mergeDateAndTime: (adapter: MuiPickersAdapter, dateParam: PickerValidDate, timeParam: PickerValidDate) => PickerValidDate;
interface FindClosestDateParams {
  date: PickerValidDate;
  disableFuture?: boolean;
  disablePast?: boolean;
  maxDate: PickerValidDate;
  minDate: PickerValidDate;
  isDateDisabled: (date: PickerValidDate) => boolean;
  adapter: MuiPickersAdapter;
  timezone: PickersTimezone;
}
export declare const findClosestEnabledDate: ({
  date,
  disableFuture,
  disablePast,
  maxDate,
  minDate,
  isDateDisabled,
  adapter,
  timezone
}: FindClosestDateParams) => PickerValidDate | null;
export declare const replaceInvalidDateByNull: (adapter: MuiPickersAdapter, value: PickerValidDate | null) => PickerValidDate | null;
export declare const applyDefaultDate: (adapter: MuiPickersAdapter, value: PickerValidDate | null | undefined, defaultValue: PickerValidDate) => PickerValidDate;
export declare const areDatesEqual: (adapter: MuiPickersAdapter, a: PickerValidDate | null, b: PickerValidDate | null) => boolean;
export declare const getMonthsInYear: (adapter: MuiPickersAdapter, year: PickerValidDate) => PickerValidDate[];
export declare const getTodayDate: (adapter: MuiPickersAdapter, timezone: PickersTimezone, valueType?: PickerValueType) => PickerValidDate;
export declare const formatMeridiem: (adapter: MuiPickersAdapter, meridiem: "am" | "pm") => string;
export declare const DATE_VIEWS: readonly ["year", "month", "day"];
export declare const isDatePickerView: (view: DateOrTimeViewWithMeridiem) => view is DateView;
export declare const resolveDateFormat: (adapter: MuiPickersAdapter, {
  format,
  views
}: {
  format?: string;
  views: readonly DateView[];
}, isInToolbar: boolean) => string;
export declare const getWeekdays: (adapter: MuiPickersAdapter, date: PickerValidDate) => PickerValidDate[];
export {};