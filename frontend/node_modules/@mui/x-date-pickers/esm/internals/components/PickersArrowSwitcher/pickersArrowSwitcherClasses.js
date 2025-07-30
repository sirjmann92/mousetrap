import generateUtilityClass from '@mui/utils/generateUtilityClass';
import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
export function getPickersArrowSwitcherUtilityClass(slot) {
  return generateUtilityClass('MuiPickersArrowSwitcher', slot);
}
export const pickersArrowSwitcherClasses = generateUtilityClasses('MuiPickersArrowSwitcher', ['root', 'spacer', 'button', 'previousIconButton', 'nextIconButton', 'leftArrowIcon', 'rightArrowIcon']);