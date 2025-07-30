"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridEvents = useGridEvents;
var _useGridEvent = require("../../utils/useGridEvent");
/**
 * @requires useGridFocus (event) - can be after, async only
 * @requires useGridColumns (event) - can be after, async only
 */
function useGridEvents(apiRef, props) {
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'columnHeaderClick', props.onColumnHeaderClick);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'columnHeaderContextMenu', props.onColumnHeaderContextMenu);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'columnHeaderDoubleClick', props.onColumnHeaderDoubleClick);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'columnHeaderOver', props.onColumnHeaderOver);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'columnHeaderOut', props.onColumnHeaderOut);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'columnHeaderEnter', props.onColumnHeaderEnter);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'columnHeaderLeave', props.onColumnHeaderLeave);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'cellClick', props.onCellClick);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'cellDoubleClick', props.onCellDoubleClick);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'cellKeyDown', props.onCellKeyDown);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'preferencePanelClose', props.onPreferencePanelClose);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'preferencePanelOpen', props.onPreferencePanelOpen);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'menuOpen', props.onMenuOpen);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'menuClose', props.onMenuClose);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'rowDoubleClick', props.onRowDoubleClick);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'rowClick', props.onRowClick);
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'stateChange', props.onStateChange);
}