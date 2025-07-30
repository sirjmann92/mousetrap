import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getPickerDay2UtilityClass(slot) {
  return generateUtilityClass('MuiPickerDay2', slot);
}
export const pickerDay2Classes = generateUtilityClasses('MuiPickerDay2', ['root', 'dayOutsideMonth', 'today', 'selected', 'disabled', 'fillerCell']);