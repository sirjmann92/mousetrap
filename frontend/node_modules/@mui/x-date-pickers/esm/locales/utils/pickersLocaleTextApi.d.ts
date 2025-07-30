import { TimeViewWithMeridiem } from "../../internals/models/index.js";
import { DateView, TimeView, FieldSectionContentType } from "../../models/index.js";
export interface PickersComponentSpecificLocaleText {
  /**
   * Title displayed in the toolbar of the Date Picker and its variants.
   * Will be overridden by the `toolbarTitle` translation key passed directly on the Picker.
   */
  datePickerToolbarTitle: string;
  /**
   * Title displayed in the toolbar of the Time Picker and its variants.
   * Will be overridden by the `toolbarTitle` translation key passed directly on the Picker.
   */
  timePickerToolbarTitle: string;
  /**
   * Title displayed in the toolbar of the Date Time Picker and its variants.
   * Will be overridden by the `toolbarTitle` translation key passed directly on the Picker.
   */
  dateTimePickerToolbarTitle: string;
  /**
   * Title displayed in the toolbar of the Date Range Picker and its variants.
   * Will be overridden by the `toolbarTitle` translation key passed directly on the Picker.
   */
  dateRangePickerToolbarTitle: string;
  /**
   * Title displayed in the toolbar of the `TimeRangePicker` and its variants.
   * Will be overridden by the `toolbarTitle` translation key passed directly on the picker.
   */
  timeRangePickerToolbarTitle: string;
}
export interface PickersComponentAgnosticLocaleText {
  previousMonth: string;
  nextMonth: string;
  calendarWeekNumberHeaderLabel: string;
  calendarWeekNumberHeaderText: string;
  calendarWeekNumberAriaLabelText: (weekNumber: number) => string;
  calendarWeekNumberText: (weekNumber: number) => string;
  openPreviousView: string;
  openNextView: string;
  calendarViewSwitchingButtonAriaLabel: (currentView: DateView) => string;
  start: string;
  end: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  cancelButtonLabel: string;
  clearButtonLabel: string;
  okButtonLabel: string;
  todayButtonLabel: string;
  nextStepButtonLabel: string;
  clockLabelText: (view: TimeView, formattedTime: string | null) => string;
  hoursClockNumberText: (hours: string) => string;
  minutesClockNumberText: (minutes: string) => string;
  secondsClockNumberText: (seconds: string) => string;
  selectViewText: (view: TimeViewWithMeridiem) => string;
  openDatePickerDialogue: (formattedDate: string | null) => string;
  openTimePickerDialogue: (formattedTime: string | null) => string;
  openRangePickerDialogue: (formattedRange: string | null) => string;
  fieldClearLabel: string;
  timeTableLabel: string;
  dateTableLabel: string;
  fieldYearPlaceholder: (params: {
    digitAmount: number;
    format: string;
  }) => string;
  fieldMonthPlaceholder: (params: {
    contentType: FieldSectionContentType;
    format: string;
  }) => string;
  fieldDayPlaceholder: (params: {
    format: string;
  }) => string;
  fieldWeekDayPlaceholder: (params: {
    contentType: FieldSectionContentType;
    format: string;
  }) => string;
  fieldHoursPlaceholder: (params: {
    format: string;
  }) => string;
  fieldMinutesPlaceholder: (params: {
    format: string;
  }) => string;
  fieldSecondsPlaceholder: (params: {
    format: string;
  }) => string;
  fieldMeridiemPlaceholder: (params: {
    format: string;
  }) => string;
  year: string;
  month: string;
  day: string;
  weekDay: string;
  hours: string;
  minutes: string;
  seconds: string;
  meridiem: string;
  empty: string;
}
export interface PickersLocaleText extends PickersComponentAgnosticLocaleText, PickersComponentSpecificLocaleText {}
export type PickersInputLocaleText = Partial<PickersLocaleText>;
/**
 * Translations that can be provided directly to the Picker components.
 * It contains some generic translations like `toolbarTitle`
 * which will be dispatched to various translations keys in `PickersLocaleText`, depending on the pickers received them.
 */
export interface PickersInputComponentLocaleText extends Partial<PickersComponentAgnosticLocaleText> {
  /**
   * Title displayed in the toolbar of this Picker.
   * Will override the global translation keys like `datePickerToolbarTitle` passed to the `LocalizationProvider`.
   */
  toolbarTitle?: string;
}
export type PickersTranslationKeys = keyof PickersLocaleText;
export type LocalizedComponent<Props extends {
  localeText?: PickersInputComponentLocaleText;
}> = Omit<Props, 'localeText'> & {
  localeText?: PickersInputLocaleText;
};