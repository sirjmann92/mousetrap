import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getDateTimePickerToolbarUtilityClass(slot) {
  return generateUtilityClass('MuiDateTimePickerToolbar', slot);
}
export const dateTimePickerToolbarClasses = generateUtilityClasses('MuiDateTimePickerToolbar', ['root', 'dateContainer', 'timeContainer', 'timeDigitsContainer', 'separator', 'timeLabelReverse', 'ampmSelection', 'ampmLandscape', 'ampmLabel']);