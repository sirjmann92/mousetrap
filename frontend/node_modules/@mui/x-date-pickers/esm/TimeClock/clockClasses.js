import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getClockUtilityClass(slot) {
  return generateUtilityClass('MuiClock', slot);
}
export const clockClasses = generateUtilityClasses('MuiClock', ['root', 'clock', 'wrapper', 'squareMask', 'pin', 'amButton', 'pmButton', 'meridiemText', 'selected']);