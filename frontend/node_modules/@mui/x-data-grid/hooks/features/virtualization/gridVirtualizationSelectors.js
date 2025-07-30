"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridVirtualizationSelector = exports.gridVirtualizationRowEnabledSelector = exports.gridVirtualizationEnabledSelector = exports.gridVirtualizationColumnEnabledSelector = exports.gridRenderContextSelector = exports.gridRenderContextColumnsSelector = void 0;
var _createSelector = require("../../../utils/createSelector");
/**
 * Get the columns state
 * @category Virtualization
 */
const gridVirtualizationSelector = exports.gridVirtualizationSelector = (0, _createSelector.createRootSelector)(state => state.virtualization);

/**
 * Get the enabled state for virtualization
 * @category Virtualization
 * @deprecated Use `gridVirtualizationColumnEnabledSelector` and `gridVirtualizationRowEnabledSelector`
 */
const gridVirtualizationEnabledSelector = exports.gridVirtualizationEnabledSelector = (0, _createSelector.createSelector)(gridVirtualizationSelector, state => state.enabled);

/**
 * Get the enabled state for column virtualization
 * @category Virtualization
 */
const gridVirtualizationColumnEnabledSelector = exports.gridVirtualizationColumnEnabledSelector = (0, _createSelector.createSelector)(gridVirtualizationSelector, state => state.enabledForColumns);

/**
 * Get the enabled state for row virtualization
 * @category Virtualization
 */
const gridVirtualizationRowEnabledSelector = exports.gridVirtualizationRowEnabledSelector = (0, _createSelector.createSelector)(gridVirtualizationSelector, state => state.enabledForRows);

/**
 * Get the render context
 * @category Virtualization
 * @ignore - do not document.
 */
const gridRenderContextSelector = exports.gridRenderContextSelector = (0, _createSelector.createSelector)(gridVirtualizationSelector, state => state.renderContext);
const firstColumnIndexSelector = (0, _createSelector.createRootSelector)(state => state.virtualization.renderContext.firstColumnIndex);
const lastColumnIndexSelector = (0, _createSelector.createRootSelector)(state => state.virtualization.renderContext.lastColumnIndex);

/**
 * Get the render context, with only columns filled in.
 * This is cached, so it can be used to only re-render when the column interval changes.
 * @category Virtualization
 * @ignore - do not document.
 */
const gridRenderContextColumnsSelector = exports.gridRenderContextColumnsSelector = (0, _createSelector.createSelectorMemoized)(firstColumnIndexSelector, lastColumnIndexSelector, (firstColumnIndex, lastColumnIndex) => ({
  firstColumnIndex,
  lastColumnIndex
}));