import { singleItemValueManager } from "../internals/utils/valueManagers.js";

/**
 * Validation props used by the Date Picker, Date Field and Date Calendar components.
 */

/**
 * Validation props as received by the validateDate method.
 */

/**
 * Name of the props that should be defaulted before being passed to the validateDate method.
 */

export const validateDate = ({
  props,
  value,
  timezone,
  adapter
}) => {
  if (value === null) {
    return null;
  }
  const {
    shouldDisableDate,
    shouldDisableMonth,
    shouldDisableYear,
    disablePast,
    disableFuture,
    minDate,
    maxDate
  } = props;
  const now = adapter.date(undefined, timezone);
  switch (true) {
    case !adapter.isValid(value):
      return 'invalidDate';
    case Boolean(shouldDisableDate && shouldDisableDate(value)):
      return 'shouldDisableDate';
    case Boolean(shouldDisableMonth && shouldDisableMonth(value)):
      return 'shouldDisableMonth';
    case Boolean(shouldDisableYear && shouldDisableYear(value)):
      return 'shouldDisableYear';
    case Boolean(disableFuture && adapter.isAfterDay(value, now)):
      return 'disableFuture';
    case Boolean(disablePast && adapter.isBeforeDay(value, now)):
      return 'disablePast';
    case Boolean(minDate && adapter.isBeforeDay(value, minDate)):
      return 'minDate';
    case Boolean(maxDate && adapter.isAfterDay(value, maxDate)):
      return 'maxDate';
    default:
      return null;
  }
};
validateDate.valueManager = singleItemValueManager;