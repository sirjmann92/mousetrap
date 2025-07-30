"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveDateFormat = exports.replaceInvalidDateByNull = exports.mergeDateAndTime = exports.isDatePickerView = exports.getWeekdays = exports.getTodayDate = exports.getMonthsInYear = exports.formatMeridiem = exports.findClosestEnabledDate = exports.areDatesEqual = exports.applyDefaultDate = exports.DATE_VIEWS = void 0;
var _views = require("./views");
const mergeDateAndTime = (adapter, dateParam, timeParam) => {
  let mergedDate = dateParam;
  mergedDate = adapter.setHours(mergedDate, adapter.getHours(timeParam));
  mergedDate = adapter.setMinutes(mergedDate, adapter.getMinutes(timeParam));
  mergedDate = adapter.setSeconds(mergedDate, adapter.getSeconds(timeParam));
  mergedDate = adapter.setMilliseconds(mergedDate, adapter.getMilliseconds(timeParam));
  return mergedDate;
};
exports.mergeDateAndTime = mergeDateAndTime;
const findClosestEnabledDate = ({
  date,
  disableFuture,
  disablePast,
  maxDate,
  minDate,
  isDateDisabled,
  adapter,
  timezone
}) => {
  const today = mergeDateAndTime(adapter, adapter.date(undefined, timezone), date);
  if (disablePast && adapter.isBefore(minDate, today)) {
    minDate = today;
  }
  if (disableFuture && adapter.isAfter(maxDate, today)) {
    maxDate = today;
  }
  let forward = date;
  let backward = date;
  if (adapter.isBefore(date, minDate)) {
    forward = minDate;
    backward = null;
  }
  if (adapter.isAfter(date, maxDate)) {
    if (backward) {
      backward = maxDate;
    }
    forward = null;
  }
  while (forward || backward) {
    if (forward && adapter.isAfter(forward, maxDate)) {
      forward = null;
    }
    if (backward && adapter.isBefore(backward, minDate)) {
      backward = null;
    }
    if (forward) {
      if (!isDateDisabled(forward)) {
        return forward;
      }
      forward = adapter.addDays(forward, 1);
    }
    if (backward) {
      if (!isDateDisabled(backward)) {
        return backward;
      }
      backward = adapter.addDays(backward, -1);
    }
  }
  return null;
};
exports.findClosestEnabledDate = findClosestEnabledDate;
const replaceInvalidDateByNull = (adapter, value) => !adapter.isValid(value) ? null : value;
exports.replaceInvalidDateByNull = replaceInvalidDateByNull;
const applyDefaultDate = (adapter, value, defaultValue) => {
  if (value == null || !adapter.isValid(value)) {
    return defaultValue;
  }
  return value;
};
exports.applyDefaultDate = applyDefaultDate;
const areDatesEqual = (adapter, a, b) => {
  if (!adapter.isValid(a) && a != null && !adapter.isValid(b) && b != null) {
    return true;
  }
  return adapter.isEqual(a, b);
};
exports.areDatesEqual = areDatesEqual;
const getMonthsInYear = (adapter, year) => {
  const firstMonth = adapter.startOfYear(year);
  const months = [firstMonth];
  while (months.length < 12) {
    const prevMonth = months[months.length - 1];
    months.push(adapter.addMonths(prevMonth, 1));
  }
  return months;
};
exports.getMonthsInYear = getMonthsInYear;
const getTodayDate = (adapter, timezone, valueType) => valueType === 'date' ? adapter.startOfDay(adapter.date(undefined, timezone)) : adapter.date(undefined, timezone);
exports.getTodayDate = getTodayDate;
const formatMeridiem = (adapter, meridiem) => {
  const date = adapter.setHours(adapter.date(), meridiem === 'am' ? 2 : 14);
  return adapter.format(date, 'meridiem');
};
exports.formatMeridiem = formatMeridiem;
const DATE_VIEWS = exports.DATE_VIEWS = ['year', 'month', 'day'];
const isDatePickerView = view => DATE_VIEWS.includes(view);
exports.isDatePickerView = isDatePickerView;
const resolveDateFormat = (adapter, {
  format,
  views
}, isInToolbar) => {
  if (format != null) {
    return format;
  }
  const formats = adapter.formats;
  if ((0, _views.areViewsEqual)(views, ['year'])) {
    return formats.year;
  }
  if ((0, _views.areViewsEqual)(views, ['month'])) {
    return formats.month;
  }
  if ((0, _views.areViewsEqual)(views, ['day'])) {
    return formats.dayOfMonth;
  }
  if ((0, _views.areViewsEqual)(views, ['month', 'year'])) {
    return `${formats.month} ${formats.year}`;
  }
  if ((0, _views.areViewsEqual)(views, ['day', 'month'])) {
    return `${formats.month} ${formats.dayOfMonth}`;
  }
  if (isInToolbar) {
    // Little localization hack (Google is doing the same for android native pickers):
    // For english localization it is convenient to include weekday into the date "Mon, Jun 1".
    // For other locales using strings like "June 1", without weekday.
    return /en/.test(adapter.getCurrentLocaleCode()) ? formats.normalDateWithWeekday : formats.normalDate;
  }
  return formats.keyboardDate;
};
exports.resolveDateFormat = resolveDateFormat;
const getWeekdays = (adapter, date) => {
  const start = adapter.startOfWeek(date);
  return [0, 1, 2, 3, 4, 5, 6].map(diff => adapter.addDays(start, diff));
};
exports.getWeekdays = getWeekdays;