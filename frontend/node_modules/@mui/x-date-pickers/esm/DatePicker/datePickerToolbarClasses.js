import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getDatePickerToolbarUtilityClass(slot) {
  return generateUtilityClass('MuiDatePickerToolbar', slot);
}
export const datePickerToolbarClasses = generateUtilityClasses('MuiDatePickerToolbar', ['root', 'title']);