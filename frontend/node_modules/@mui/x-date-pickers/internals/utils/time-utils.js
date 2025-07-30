"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveTimeFormat = exports.isTimeView = exports.isInternalTimeView = exports.getSecondsInDay = exports.getMeridiem = exports.createIsAfterIgnoreDatePart = exports.convertValueToMeridiem = exports.convertToMeridiem = exports.TIME_VIEWS = exports.EXPORTED_TIME_VIEWS = void 0;
var _views = require("./views");
const EXPORTED_TIME_VIEWS = exports.EXPORTED_TIME_VIEWS = ['hours', 'minutes', 'seconds'];
const TIME_VIEWS = exports.TIME_VIEWS = ['hours', 'minutes', 'seconds', 'meridiem'];
const isTimeView = view => EXPORTED_TIME_VIEWS.includes(view);
exports.isTimeView = isTimeView;
const isInternalTimeView = view => TIME_VIEWS.includes(view);
exports.isInternalTimeView = isInternalTimeView;
const getMeridiem = (date, adapter) => {
  if (!date) {
    return null;
  }
  return adapter.getHours(date) >= 12 ? 'pm' : 'am';
};
exports.getMeridiem = getMeridiem;
const convertValueToMeridiem = (value, meridiem, ampm) => {
  if (ampm) {
    const currentMeridiem = value >= 12 ? 'pm' : 'am';
    if (currentMeridiem !== meridiem) {
      return meridiem === 'am' ? value - 12 : value + 12;
    }
  }
  return value;
};
exports.convertValueToMeridiem = convertValueToMeridiem;
const convertToMeridiem = (time, meridiem, ampm, adapter) => {
  const newHoursAmount = convertValueToMeridiem(adapter.getHours(time), meridiem, ampm);
  return adapter.setHours(time, newHoursAmount);
};
exports.convertToMeridiem = convertToMeridiem;
const getSecondsInDay = (date, adapter) => {
  return adapter.getHours(date) * 3600 + adapter.getMinutes(date) * 60 + adapter.getSeconds(date);
};
exports.getSecondsInDay = getSecondsInDay;
const createIsAfterIgnoreDatePart = (disableIgnoringDatePartForTimeValidation, adapter) => (dateLeft, dateRight) => {
  if (disableIgnoringDatePartForTimeValidation) {
    return adapter.isAfter(dateLeft, dateRight);
  }
  return getSecondsInDay(dateLeft, adapter) > getSecondsInDay(dateRight, adapter);
};
exports.createIsAfterIgnoreDatePart = createIsAfterIgnoreDatePart;
const resolveTimeFormat = (adapter, {
  format,
  views,
  ampm
}) => {
  if (format != null) {
    return format;
  }
  const formats = adapter.formats;
  if ((0, _views.areViewsEqual)(views, ['hours'])) {
    return ampm ? `${formats.hours12h} ${formats.meridiem}` : formats.hours24h;
  }
  if ((0, _views.areViewsEqual)(views, ['minutes'])) {
    return formats.minutes;
  }
  if ((0, _views.areViewsEqual)(views, ['seconds'])) {
    return formats.seconds;
  }
  if ((0, _views.areViewsEqual)(views, ['minutes', 'seconds'])) {
    return `${formats.minutes}:${formats.seconds}`;
  }
  if ((0, _views.areViewsEqual)(views, ['hours', 'minutes', 'seconds'])) {
    return ampm ? `${formats.hours12h}:${formats.minutes}:${formats.seconds} ${formats.meridiem}` : `${formats.hours24h}:${formats.minutes}:${formats.seconds}`;
  }
  return ampm ? `${formats.hours12h}:${formats.minutes} ${formats.meridiem}` : `${formats.hours24h}:${formats.minutes}`;
};
exports.resolveTimeFormat = resolveTimeFormat;