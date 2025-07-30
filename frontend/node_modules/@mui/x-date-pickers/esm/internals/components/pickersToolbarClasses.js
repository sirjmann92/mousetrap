import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getPickersToolbarUtilityClass(slot) {
  return generateUtilityClass('MuiPickersToolbar', slot);
}
export const pickersToolbarClasses = generateUtilityClasses('MuiPickersToolbar', ['root', 'title', 'content']);