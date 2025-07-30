import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export const getDateCalendarUtilityClass = slot => generateUtilityClass('MuiDateCalendar', slot);
export const dateCalendarClasses = generateUtilityClasses('MuiDateCalendar', ['root', 'viewTransitionContainer']);