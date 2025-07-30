import { validateDate } from "./validateDate.js";
import { validateTime } from "./validateTime.js";
import { singleItemValueManager } from "../internals/utils/valueManagers.js";

/**
 * Validation props used by the Date Time Picker and Date Time Field components.
 */

/**
 * Validation props as received by the validateDateTime method.
 */

/**
 * Name of the props that should be defaulted before being passed to the validateDateTime method.
 */

export const validateDateTime = ({
  adapter,
  value,
  timezone,
  props
}) => {
  const dateValidationResult = validateDate({
    adapter,
    value,
    timezone,
    props
  });
  if (dateValidationResult !== null) {
    return dateValidationResult;
  }
  return validateTime({
    adapter,
    value,
    timezone,
    props
  });
};
validateDateTime.valueManager = singleItemValueManager;