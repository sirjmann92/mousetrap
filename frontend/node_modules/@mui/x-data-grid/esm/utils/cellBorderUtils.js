import { PinnedColumnPosition } from "../internals/constants.js";
export const shouldCellShowRightBorder = (pinnedPosition, indexInSection, sectionLength, showCellVerticalBorderRootProp, gridHasFiller) => {
  const isSectionLastCell = indexInSection === sectionLength - 1;
  if (pinnedPosition === PinnedColumnPosition.LEFT && isSectionLastCell) {
    return true;
  }
  if (showCellVerticalBorderRootProp) {
    if (pinnedPosition === PinnedColumnPosition.LEFT) {
      return true;
    }
    if (pinnedPosition === PinnedColumnPosition.RIGHT) {
      return !isSectionLastCell;
    }
    // pinnedPosition === undefined, middle section
    return !isSectionLastCell || gridHasFiller;
  }
  return false;
};
export const shouldCellShowLeftBorder = (pinnedPosition, indexInSection) => {
  return pinnedPosition === PinnedColumnPosition.RIGHT && indexInSection === 0;
};