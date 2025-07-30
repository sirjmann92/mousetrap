import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { usePickerPrivateContext } from "../internals/hooks/usePickerPrivateContext.js";
import { usePickerAdapter } from "../hooks/usePickerAdapter.js";
export function usePickerDayOwnerState(parameters) {
  const {
    disabled,
    selected,
    today,
    outsideCurrentMonth,
    day,
    disableMargin,
    disableHighlightToday,
    showDaysOutsideCurrentMonth
  } = parameters;
  const adapter = usePickerAdapter();
  const {
    ownerState: pickerOwnerState
  } = usePickerPrivateContext();
  return React.useMemo(() => _extends({}, pickerOwnerState, {
    day,
    isDaySelected: selected ?? false,
    isDayDisabled: disabled ?? false,
    isDayCurrent: today ?? false,
    isDayOutsideMonth: outsideCurrentMonth ?? false,
    isDayStartOfWeek: adapter.isSameDay(day, adapter.startOfWeek(day)),
    isDayEndOfWeek: adapter.isSameDay(day, adapter.endOfWeek(day)),
    disableMargin: disableMargin ?? false,
    disableHighlightToday: disableHighlightToday ?? false,
    showDaysOutsideCurrentMonth: showDaysOutsideCurrentMonth ?? false
  }), [adapter, pickerOwnerState, day, selected, disabled, today, outsideCurrentMonth, disableMargin, disableHighlightToday, showDaysOutsideCurrentMonth]);
}