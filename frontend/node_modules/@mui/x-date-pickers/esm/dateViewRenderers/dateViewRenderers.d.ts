import * as React from 'react';
import { DateCalendarProps } from "../DateCalendar/index.js";
import { DateView } from "../models/index.js";
import { DateOrTimeViewWithMeridiem } from "../internals/models/index.js";
export interface DateViewRendererProps<TView extends DateOrTimeViewWithMeridiem> extends Omit<DateCalendarProps, 'views' | 'openTo' | 'view' | 'onViewChange' | 'focusedView'> {
  view: TView;
  onViewChange?: (view: TView) => void;
  views: readonly TView[];
  focusedView: TView | null;
}
export declare const renderDateViewCalendar: ({
  view,
  onViewChange,
  views,
  focusedView,
  onFocusedViewChange,
  value,
  defaultValue,
  referenceDate,
  onChange,
  className,
  classes,
  disableFuture,
  disablePast,
  minDate,
  maxDate,
  shouldDisableDate,
  shouldDisableMonth,
  shouldDisableYear,
  reduceAnimations,
  onMonthChange,
  monthsPerRow,
  onYearChange,
  yearsOrder,
  yearsPerRow,
  slots,
  slotProps,
  loading,
  renderLoading,
  disableHighlightToday,
  readOnly,
  disabled,
  showDaysOutsideCurrentMonth,
  dayOfWeekFormatter,
  sx,
  autoFocus,
  fixedWeekNumber,
  displayWeekNumber,
  timezone
}: DateViewRendererProps<DateView>) => React.JSX.Element;