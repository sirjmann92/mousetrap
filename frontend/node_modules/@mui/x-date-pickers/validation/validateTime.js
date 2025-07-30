"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateTime = void 0;
var _timeUtils = require("../internals/utils/time-utils");
var _valueManagers = require("../internals/utils/valueManagers");
/**
 * Validation props used by the Time Picker, Time Field and Clock components.
 */

/**
 * Validation props as received by the validateTime method.
 */

/**
 * Name of the props that should be defaulted before being passed to the validateTime method.
 */

const validateTime = ({
  adapter,
  value,
  timezone,
  props
}) => {
  if (value === null) {
    return null;
  }
  const {
    minTime,
    maxTime,
    minutesStep,
    shouldDisableTime,
    disableIgnoringDatePartForTimeValidation = false,
    disablePast,
    disableFuture
  } = props;
  const now = adapter.date(undefined, timezone);
  const isAfter = (0, _timeUtils.createIsAfterIgnoreDatePart)(disableIgnoringDatePartForTimeValidation, adapter);
  switch (true) {
    case !adapter.isValid(value):
      return 'invalidDate';
    case Boolean(minTime && isAfter(minTime, value)):
      return 'minTime';
    case Boolean(maxTime && isAfter(value, maxTime)):
      return 'maxTime';
    case Boolean(disableFuture && adapter.isAfter(value, now)):
      return 'disableFuture';
    case Boolean(disablePast && adapter.isBefore(value, now)):
      return 'disablePast';
    case Boolean(shouldDisableTime && shouldDisableTime(value, 'hours')):
      return 'shouldDisableTime-hours';
    case Boolean(shouldDisableTime && shouldDisableTime(value, 'minutes')):
      return 'shouldDisableTime-minutes';
    case Boolean(shouldDisableTime && shouldDisableTime(value, 'seconds')):
      return 'shouldDisableTime-seconds';
    case Boolean(minutesStep && adapter.getMinutes(value) % minutesStep !== 0):
      return 'minutesStep';
    default:
      return null;
  }
};
exports.validateTime = validateTime;
validateTime.valueManager = _valueManagers.singleItemValueManager;