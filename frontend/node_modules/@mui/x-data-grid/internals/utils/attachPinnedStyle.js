"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attachPinnedStyle = attachPinnedStyle;
var _rtlFlipSide = require("../../utils/rtlFlipSide");
function attachPinnedStyle(style, isRtl, pinnedPosition, pinnedOffset) {
  const side = (0, _rtlFlipSide.rtlFlipSide)(pinnedPosition, isRtl);
  if (!side || pinnedOffset === undefined) {
    return style;
  }
  style[side] = pinnedOffset;
  return style;
}