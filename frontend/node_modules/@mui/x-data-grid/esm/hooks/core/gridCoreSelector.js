import { createRootSelector } from "../../utils/createSelector.js";
/**
 * Get the theme state
 * @category Core
 */
export const gridIsRtlSelector = createRootSelector(state => state.isRtl);