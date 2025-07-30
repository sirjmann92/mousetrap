import { PickerDayOwnerState } from "./PickersDay.types.js";
import { PickerValidDate } from "../models/pickers.js";
export declare function usePickerDayOwnerState(parameters: UsePickerDayOwnerStateParameters): PickerDayOwnerState;
interface UsePickerDayOwnerStateParameters {
  day: PickerValidDate;
  disabled: boolean | undefined;
  selected: boolean | undefined;
  today: boolean | undefined;
  outsideCurrentMonth: boolean | undefined;
  disableMargin: boolean | undefined;
  disableHighlightToday: boolean | undefined;
  showDaysOutsideCurrentMonth: boolean | undefined;
}
export {};