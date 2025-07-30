"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shouldCellShowRightBorder = exports.shouldCellShowLeftBorder = void 0;
var _constants = require("../internals/constants");
const shouldCellShowRightBorder = (pinnedPosition, indexInSection, sectionLength, showCellVerticalBorderRootProp, gridHasFiller) => {
  const isSectionLastCell = indexInSection === sectionLength - 1;
  if (pinnedPosition === _constants.PinnedColumnPosition.LEFT && isSectionLastCell) {
    return true;
  }
  if (showCellVerticalBorderRootProp) {
    if (pinnedPosition === _constants.PinnedColumnPosition.LEFT) {
      return true;
    }
    if (pinnedPosition === _constants.PinnedColumnPosition.RIGHT) {
      return !isSectionLastCell;
    }
    // pinnedPosition === undefined, middle section
    return !isSectionLastCell || gridHasFiller;
  }
  return false;
};
exports.shouldCellShowRightBorder = shouldCellShowRightBorder;
const shouldCellShowLeftBorder = (pinnedPosition, indexInSection) => {
  return pinnedPosition === _constants.PinnedColumnPosition.RIGHT && indexInSection === 0;
};
exports.shouldCellShowLeftBorder = shouldCellShowLeftBorder;