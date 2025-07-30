import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export const getPickersCalendarHeaderUtilityClass = slot => generateUtilityClass('MuiPickersCalendarHeader', slot);
export const pickersCalendarHeaderClasses = generateUtilityClasses('MuiPickersCalendarHeader', ['root', 'labelContainer', 'label', 'switchViewButton', 'switchViewIcon']);