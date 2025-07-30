import { MuiPickersAdapter, PickerValidDate } from "../../models/index.js";
import { DateOrTimeViewWithMeridiem, TimeViewWithMeridiem } from "../models/index.js";
export declare const EXPORTED_TIME_VIEWS: readonly ["hours", "minutes", "seconds"];
export declare const TIME_VIEWS: readonly ["hours", "minutes", "seconds", "meridiem"];
export declare const isTimeView: (view: DateOrTimeViewWithMeridiem) => boolean;
export declare const isInternalTimeView: (view: DateOrTimeViewWithMeridiem) => view is TimeViewWithMeridiem;
export type Meridiem = 'am' | 'pm';
export declare const getMeridiem: (date: PickerValidDate | null, adapter: MuiPickersAdapter) => Meridiem | null;
export declare const convertValueToMeridiem: (value: number, meridiem: Meridiem | null, ampm: boolean) => number;
export declare const convertToMeridiem: (time: PickerValidDate, meridiem: Meridiem, ampm: boolean, adapter: MuiPickersAdapter) => PickerValidDate;
export declare const getSecondsInDay: (date: PickerValidDate, adapter: MuiPickersAdapter) => number;
export declare const createIsAfterIgnoreDatePart: (disableIgnoringDatePartForTimeValidation: boolean, adapter: MuiPickersAdapter) => (dateLeft: PickerValidDate, dateRight: PickerValidDate) => boolean;
export declare const resolveTimeFormat: (adapter: MuiPickersAdapter, {
  format,
  views,
  ampm
}: {
  format?: string;
  views: readonly TimeViewWithMeridiem[];
  ampm: boolean;
}) => string;