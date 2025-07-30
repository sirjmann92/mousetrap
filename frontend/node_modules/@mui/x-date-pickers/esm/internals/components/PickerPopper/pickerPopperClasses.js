import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getPickerPopperUtilityClass(slot) {
  return generateUtilityClass('MuiPickerPopper', slot);
}
export const pickerPopperClasses = generateUtilityClasses('MuiPickerPopper', ['root', 'paper']);