import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getPickersDayUtilityClass(slot) {
  return generateUtilityClass('MuiPickersDay', slot);
}
export const pickersDayClasses = generateUtilityClasses('MuiPickersDay', ['root', 'dayWithMargin', 'dayOutsideMonth', 'hiddenDaySpacingFiller', 'today', 'selected', 'disabled']);