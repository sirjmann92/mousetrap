"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listViewStateInitializer = void 0;
exports.useGridListView = useGridListView;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _warning = require("@mui/x-internals/warning");
var _dimensions = require("../dimensions");
var _useGridEvent = require("../../utils/useGridEvent");
const listViewStateInitializer = (state, props, apiRef) => (0, _extends2.default)({}, state, {
  listViewColumn: props.listViewColumn ? (0, _extends2.default)({}, props.listViewColumn, {
    computedWidth: getListColumnWidth(apiRef)
  }) : undefined
});
exports.listViewStateInitializer = listViewStateInitializer;
function useGridListView(apiRef, props) {
  /*
   * EVENTS
   */
  const updateListColumnWidth = () => {
    apiRef.current.setState(state => {
      if (!state.listViewColumn) {
        return state;
      }
      return (0, _extends2.default)({}, state, {
        listViewColumn: (0, _extends2.default)({}, state.listViewColumn, {
          computedWidth: getListColumnWidth(apiRef)
        })
      });
    });
  };
  const prevInnerWidth = React.useRef(null);
  const handleGridSizeChange = viewportInnerSize => {
    if (prevInnerWidth.current !== viewportInnerSize.width) {
      prevInnerWidth.current = viewportInnerSize.width;
      updateListColumnWidth();
    }
  };
  (0, _useGridEvent.useGridEvent)(apiRef, 'viewportInnerSizeChange', handleGridSizeChange);
  (0, _useGridEvent.useGridEvent)(apiRef, 'columnVisibilityModelChange', updateListColumnWidth);

  /*
   * EFFECTS
   */
  (0, _useEnhancedEffect.default)(() => {
    const listColumn = props.listViewColumn;
    if (listColumn) {
      apiRef.current.setState(state => {
        return (0, _extends2.default)({}, state, {
          listViewColumn: (0, _extends2.default)({}, listColumn, {
            computedWidth: getListColumnWidth(apiRef)
          })
        });
      });
    }
  }, [apiRef, props.listViewColumn]);
  React.useEffect(() => {
    if (props.listView && !props.listViewColumn) {
      (0, _warning.warnOnce)(['MUI X: The `listViewColumn` prop must be set if `listView` is enabled.', 'To fix, pass a column definition to the `listViewColumn` prop, e.g. `{ field: "example", renderCell: (params) => <div>{params.row.id}</div> }`.', 'For more details, see https://mui.com/x/react-data-grid/list-view/']);
    }
  }, [props.listView, props.listViewColumn]);
}
function getListColumnWidth(apiRef) {
  return (0, _dimensions.gridDimensionsSelector)(apiRef).viewportInnerSize.width;
}