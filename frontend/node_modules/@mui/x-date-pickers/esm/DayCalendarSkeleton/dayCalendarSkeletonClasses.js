import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export const getDayCalendarSkeletonUtilityClass = slot => generateUtilityClass('MuiDayCalendarSkeleton', slot);
export const dayCalendarSkeletonClasses = generateUtilityClasses('MuiDayCalendarSkeleton', ['root', 'week', 'daySkeleton']);