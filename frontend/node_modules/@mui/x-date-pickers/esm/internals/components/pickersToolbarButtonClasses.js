import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getPickersToolbarButtonUtilityClass(slot) {
  return generateUtilityClass('MuiPickersToolbarButton', slot);
}
export const pickersToolbarButtonClasses = generateUtilityClasses('MuiPickersToolbarButton', ['root']);