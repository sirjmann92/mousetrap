"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridPreferencePanelStateSelector = exports.gridPreferencePanelSelectorWithLabel = void 0;
var _createSelector = require("../../../utils/createSelector");
const gridPreferencePanelStateSelector = exports.gridPreferencePanelStateSelector = (0, _createSelector.createRootSelector)(state => state.preferencePanel);
const gridPreferencePanelSelectorWithLabel = exports.gridPreferencePanelSelectorWithLabel = (0, _createSelector.createSelector)(gridPreferencePanelStateSelector, (panel, labelId) => {
  if (panel.open && panel.labelId === labelId) {
    return true;
  }
  return false;
});