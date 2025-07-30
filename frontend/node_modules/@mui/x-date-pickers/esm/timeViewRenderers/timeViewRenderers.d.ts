import * as React from 'react';
import { TimeClockProps } from "../TimeClock/index.js";
import { TimeView } from "../models/index.js";
import { DigitalClockProps } from "../DigitalClock/index.js";
import { BaseClockProps } from "../internals/models/props/time.js";
import { MultiSectionDigitalClockProps } from "../MultiSectionDigitalClock/index.js";
import { TimeViewWithMeridiem } from "../internals/models/index.js";
import type { TimePickerProps } from "../TimePicker/TimePicker.types.js";
export type TimeViewRendererProps<TView extends TimeViewWithMeridiem, TComponentProps extends BaseClockProps<TView>> = Omit<TComponentProps, 'views' | 'openTo' | 'view' | 'onViewChange'> & {
  view: TView;
  onViewChange?: (view: TView) => void;
  views: readonly TView[];
};
export declare const renderTimeViewClock: ({
  view,
  onViewChange,
  focusedView,
  onFocusedViewChange,
  views,
  value,
  defaultValue,
  referenceDate,
  onChange,
  className,
  classes,
  disableFuture,
  disablePast,
  minTime,
  maxTime,
  shouldDisableTime,
  minutesStep,
  ampm,
  ampmInClock,
  slots,
  slotProps,
  readOnly,
  disabled,
  sx,
  autoFocus,
  showViewSwitcher,
  disableIgnoringDatePartForTimeValidation,
  timezone
}: TimeViewRendererProps<TimeView, TimeClockProps<TimeView>>) => React.JSX.Element;
export declare const renderDigitalClockTimeView: ({
  view,
  onViewChange,
  focusedView,
  onFocusedViewChange,
  views,
  value,
  defaultValue,
  referenceDate,
  onChange,
  className,
  classes,
  disableFuture,
  disablePast,
  minTime,
  maxTime,
  shouldDisableTime,
  minutesStep,
  ampm,
  slots,
  slotProps,
  readOnly,
  disabled,
  sx,
  autoFocus,
  disableIgnoringDatePartForTimeValidation,
  timeSteps,
  skipDisabled,
  timezone
}: TimeViewRendererProps<Extract<TimeView, "hours">, Omit<DigitalClockProps, "timeStep"> & Pick<TimePickerProps, "timeSteps">>) => React.JSX.Element;
export declare const renderMultiSectionDigitalClockTimeView: ({
  view,
  onViewChange,
  focusedView,
  onFocusedViewChange,
  views,
  value,
  defaultValue,
  referenceDate,
  onChange,
  className,
  classes,
  disableFuture,
  disablePast,
  minTime,
  maxTime,
  shouldDisableTime,
  minutesStep,
  ampm,
  slots,
  slotProps,
  readOnly,
  disabled,
  sx,
  autoFocus,
  disableIgnoringDatePartForTimeValidation,
  timeSteps,
  skipDisabled,
  timezone
}: TimeViewRendererProps<TimeViewWithMeridiem, MultiSectionDigitalClockProps>) => React.JSX.Element;