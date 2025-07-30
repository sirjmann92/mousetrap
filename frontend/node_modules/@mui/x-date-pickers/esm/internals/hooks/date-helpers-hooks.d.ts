import { PickerOnChangeFn } from "./useViews.js";
import { PickerSelectionState } from "./usePicker/index.js";
import { PickersTimezone, PickerValidDate } from "../../models/index.js";
export interface MonthValidationOptions {
  disablePast?: boolean;
  disableFuture?: boolean;
  minDate: PickerValidDate;
  maxDate: PickerValidDate;
  timezone: PickersTimezone;
}
export declare function useNextMonthDisabled(month: PickerValidDate, {
  disableFuture,
  maxDate,
  timezone
}: Pick<MonthValidationOptions, 'disableFuture' | 'maxDate' | 'timezone'>): boolean;
export declare function usePreviousMonthDisabled(month: PickerValidDate, {
  disablePast,
  minDate,
  timezone
}: Pick<MonthValidationOptions, 'disablePast' | 'minDate' | 'timezone'>): boolean;
export declare function useMeridiemMode(date: PickerValidDate | null, ampm: boolean | undefined, onChange: PickerOnChangeFn, selectionState?: PickerSelectionState): {
  meridiemMode: import("../utils/time-utils.js").Meridiem | null;
  handleMeridiemChange: (mode: "am" | "pm") => void;
};