import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export const getPickersSlideTransitionUtilityClass = slot => generateUtilityClass('MuiPickersSlideTransition', slot);
export const pickersSlideTransitionClasses = generateUtilityClasses('MuiPickersSlideTransition', ['root', 'slideEnter-left', 'slideEnter-right', 'slideEnterActive', 'slideExit', 'slideExitActiveLeft-left', 'slideExitActiveLeft-right']);