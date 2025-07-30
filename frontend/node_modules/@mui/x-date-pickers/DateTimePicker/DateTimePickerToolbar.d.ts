import * as React from 'react';
import { BaseToolbarProps, ExportedBaseToolbarProps } from "../internals/models/props/toolbar.js";
import { DateTimePickerToolbarClasses } from "./dateTimePickerToolbarClasses.js";
import { DateOrTimeViewWithMeridiem, PickerValue } from "../internals/models/index.js";
import { DateTimeValidationError } from "../models/index.js";
import { SetValueActionOptions } from "../internals/components/PickerProvider.js";
export interface ExportedDateTimePickerToolbarProps extends ExportedBaseToolbarProps {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<DateTimePickerToolbarClasses>;
}
export interface DateTimePickerToolbarProps extends ExportedDateTimePickerToolbarProps, BaseToolbarProps {
  /**
   * If provided, it will be used instead of `dateTimePickerToolbarTitle` from localization.
   */
  toolbarTitle?: React.ReactNode;
  ampm?: boolean;
  ampmInClock?: boolean;
}
/**
 * If `forceDesktopVariant` is set to `true`, the toolbar will always be rendered in the desktop mode.
 * If `onViewChange` is defined, the toolbar will call it instead of calling the default handler from `usePickerContext`.
 * This is used by the Date Time Range Picker Toolbar.
 */
export declare const DateTimePickerToolbarOverrideContext: React.Context<{
  value: PickerValue;
  setValue: (value: PickerValue, options?: SetValueActionOptions<DateTimeValidationError>) => void;
  forceDesktopVariant: boolean;
  setView: (view: DateOrTimeViewWithMeridiem) => void;
  view: DateOrTimeViewWithMeridiem | null;
} | null>;
/**
 * Demos:
 *
 * - [DateTimePicker](https://mui.com/x/react-date-pickers/date-time-picker/)
 * - [Custom components](https://mui.com/x/react-date-pickers/custom-components/)
 *
 * API:
 *
 * - [DateTimePickerToolbar API](https://mui.com/x/api/date-pickers/date-time-picker-toolbar/)
 */
declare function DateTimePickerToolbar(inProps: DateTimePickerToolbarProps): React.JSX.Element;
declare namespace DateTimePickerToolbar {
  var propTypes: any;
}
export { DateTimePickerToolbar };