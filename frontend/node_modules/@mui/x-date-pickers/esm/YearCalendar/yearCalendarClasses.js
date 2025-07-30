import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getYearCalendarUtilityClass(slot) {
  return generateUtilityClass('MuiYearCalendar', slot);
}
export const yearCalendarClasses = generateUtilityClasses('MuiYearCalendar', ['root', 'button', 'disabled', 'selected']);