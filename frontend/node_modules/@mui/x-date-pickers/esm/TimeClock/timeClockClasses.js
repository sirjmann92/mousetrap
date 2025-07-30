import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getTimeClockUtilityClass(slot) {
  return generateUtilityClass('MuiTimeClock', slot);
}
export const timeClockClasses = generateUtilityClasses('MuiTimeClock', ['root', 'arrowSwitcher']);