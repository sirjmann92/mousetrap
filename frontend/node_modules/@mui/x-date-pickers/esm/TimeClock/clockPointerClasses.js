import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getClockPointerUtilityClass(slot) {
  return generateUtilityClass('MuiClockPointer', slot);
}
export const clockPointerClasses = generateUtilityClasses('MuiClockPointer', ['root', 'thumb']);