import { FieldSection, MuiPickersAdapter, PickersTimezone, PickerValidDate } from "../../models/index.js";
export interface GetDefaultReferenceDateProps {
  maxDate?: PickerValidDate;
  minDate?: PickerValidDate;
  minTime?: PickerValidDate;
  maxTime?: PickerValidDate;
  disableIgnoringDatePartForTimeValidation?: boolean;
}
export declare const SECTION_TYPE_GRANULARITY: {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
};
export declare const getSectionTypeGranularity: (sections: FieldSection[]) => number;
export declare const getDefaultReferenceDate: ({
  props,
  adapter,
  granularity,
  timezone,
  getTodayDate: inGetTodayDate
}: {
  props: GetDefaultReferenceDateProps;
  adapter: MuiPickersAdapter;
  granularity: number;
  timezone: PickersTimezone;
  getTodayDate?: () => PickerValidDate;
}) => PickerValidDate;