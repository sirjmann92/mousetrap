import { rtlFlipSide } from "../../utils/rtlFlipSide.js";
export function attachPinnedStyle(style, isRtl, pinnedPosition, pinnedOffset) {
  const side = rtlFlipSide(pinnedPosition, isRtl);
  if (!side || pinnedOffset === undefined) {
    return style;
  }
  style[side] = pinnedOffset;
  return style;
}