import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export const getDayCalendarUtilityClass = slot => generateUtilityClass('MuiDayCalendar', slot);
export const dayCalendarClasses = generateUtilityClasses('MuiDayCalendar', ['root', 'header', 'weekDayLabel', 'loadingContainer', 'slideTransition', 'monthContainer', 'weekContainer', 'weekNumberLabel', 'weekNumber']);