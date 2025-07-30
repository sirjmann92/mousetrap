"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.syncSelectionToDOM = syncSelectionToDOM;
var _utils = require("../../utils/utils");
function syncSelectionToDOM(parameters) {
  const {
    focused,
    domGetters,
    stateResponse: {
      // States and derived states
      parsedSelectedSections,
      state
    }
  } = parameters;
  if (!domGetters.isReady()) {
    return;
  }
  const selection = document.getSelection();
  if (!selection) {
    return;
  }
  if (parsedSelectedSections == null) {
    // If the selection contains an element inside the field, we reset it.
    if (selection.rangeCount > 0 && domGetters.getRoot().contains(selection.getRangeAt(0).startContainer)) {
      selection.removeAllRanges();
    }
    if (focused) {
      domGetters.getRoot().blur();
    }
    return;
  }

  // On multi input range pickers we want to update selection range only for the active input
  if (!domGetters.getRoot().contains((0, _utils.getActiveElement)(document))) {
    return;
  }
  const range = new window.Range();
  let target;
  if (parsedSelectedSections === 'all') {
    target = domGetters.getRoot();
  } else {
    const section = state.sections[parsedSelectedSections];
    if (section.type === 'empty') {
      target = domGetters.getSectionContainer(parsedSelectedSections);
    } else {
      target = domGetters.getSectionContent(parsedSelectedSections);
    }
  }
  range.selectNodeContents(target);
  target.focus();
  selection.removeAllRanges();
  selection.addRange(range);
}