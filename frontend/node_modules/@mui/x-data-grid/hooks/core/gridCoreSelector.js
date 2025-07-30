"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridIsRtlSelector = void 0;
var _createSelector = require("../../utils/createSelector");
/**
 * Get the theme state
 * @category Core
 */
const gridIsRtlSelector = exports.gridIsRtlSelector = (0, _createSelector.createRootSelector)(state => state.isRtl);