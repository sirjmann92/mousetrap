import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getMonthCalendarUtilityClass(slot) {
  return generateUtilityClass('MuiMonthCalendar', slot);
}
export const monthCalendarClasses = generateUtilityClasses('MuiMonthCalendar', ['root', 'button', 'disabled', 'selected']);