"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rtlFlipSide = void 0;
var _constants = require("../internals/constants");
const rtlFlipSide = (position, isRtl) => {
  if (!position) {
    return undefined;
  }
  if (!isRtl) {
    if (position === _constants.PinnedColumnPosition.LEFT) {
      return 'left';
    }
    if (position === _constants.PinnedColumnPosition.RIGHT) {
      return 'right';
    }
  } else {
    if (position === _constants.PinnedColumnPosition.LEFT) {
      return 'right';
    }
    if (position === _constants.PinnedColumnPosition.RIGHT) {
      return 'left';
    }
  }
  return undefined;
};
exports.rtlFlipSide = rtlFlipSide;