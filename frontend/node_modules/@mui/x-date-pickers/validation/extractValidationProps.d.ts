import { BaseDateValidationProps, BaseTimeValidationProps, DateTimeValidationProps, DayValidationProps, MonthValidationProps, TimeValidationProps, YearValidationProps } from "../internals/models/validation.js";
export declare const DATE_VALIDATION_PROP_NAMES: (keyof BaseDateValidationProps | keyof YearValidationProps | keyof MonthValidationProps | keyof DayValidationProps)[];
export declare const TIME_VALIDATION_PROP_NAMES: (keyof BaseTimeValidationProps | keyof TimeValidationProps | 'ampm')[];
export declare const DATE_TIME_VALIDATION_PROP_NAMES: (keyof DateTimeValidationProps)[];
/**
 * Extract the validation props for the props received by a component.
 * Limit the risk of forgetting some of them and reduce the bundle size.
 */
export declare const extractValidationProps: <Props extends {
  [key: string]: any;
}>(props: Props) => Pick<Props, "maxDate" | "minDate" | "disablePast" | "disableFuture" | "shouldDisableYear" | "shouldDisableMonth" | "shouldDisableDate" | "minTime" | "maxTime" | "minutesStep" | "shouldDisableTime" | "disableIgnoringDatePartForTimeValidation" | "ampm" | "minDateTime" | "maxDateTime">;