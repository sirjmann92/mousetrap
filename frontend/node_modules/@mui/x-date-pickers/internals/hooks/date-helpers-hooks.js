"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useMeridiemMode = useMeridiemMode;
exports.useNextMonthDisabled = useNextMonthDisabled;
exports.usePreviousMonthDisabled = usePreviousMonthDisabled;
var React = _interopRequireWildcard(require("react"));
var _timeUtils = require("../utils/time-utils");
var _usePickerAdapter = require("../../hooks/usePickerAdapter");
function useNextMonthDisabled(month, {
  disableFuture,
  maxDate,
  timezone
}) {
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  return React.useMemo(() => {
    const now = adapter.date(undefined, timezone);
    const lastEnabledMonth = adapter.startOfMonth(disableFuture && adapter.isBefore(now, maxDate) ? now : maxDate);
    return !adapter.isAfter(lastEnabledMonth, month);
  }, [disableFuture, maxDate, month, adapter, timezone]);
}
function usePreviousMonthDisabled(month, {
  disablePast,
  minDate,
  timezone
}) {
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  return React.useMemo(() => {
    const now = adapter.date(undefined, timezone);
    const firstEnabledMonth = adapter.startOfMonth(disablePast && adapter.isAfter(now, minDate) ? now : minDate);
    return !adapter.isBefore(firstEnabledMonth, month);
  }, [disablePast, minDate, month, adapter, timezone]);
}
function useMeridiemMode(date, ampm, onChange, selectionState) {
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  const cleanDate = React.useMemo(() => !adapter.isValid(date) ? null : date, [adapter, date]);
  const meridiemMode = (0, _timeUtils.getMeridiem)(cleanDate, adapter);
  const handleMeridiemChange = React.useCallback(mode => {
    const timeWithMeridiem = cleanDate == null ? null : (0, _timeUtils.convertToMeridiem)(cleanDate, mode, Boolean(ampm), adapter);
    onChange(timeWithMeridiem, selectionState ?? 'partial');
  }, [ampm, cleanDate, onChange, selectionState, adapter]);
  return {
    meridiemMode,
    handleMeridiemChange
  };
}