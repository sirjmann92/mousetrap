"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridToolbarQuickFilter = GridToolbarQuickFilter;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _system = require("@mui/system");
var _clsx = _interopRequireDefault(require("clsx"));
var _constants = require("../../constants");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _quickFilter = require("../quickFilter");
var _toolbarV = require("../toolbarV8");
var _cssVariables = require("../../constants/cssVariables");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["quickFilterParser", "quickFilterFormatter", "debounceMs", "className", "slotProps"],
  _excluded2 = ["ref", "slotProps"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['toolbarQuickFilter'],
    trigger: ['toolbarQuickFilterTrigger'],
    control: ['toolbarQuickFilterControl']
  };
  return (0, _composeClasses.default)(slots, _constants.getDataGridUtilityClass, classes);
};
const GridQuickFilterRoot = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'ToolbarQuickFilter'
})({
  display: 'grid',
  alignItems: 'center'
});
const GridQuickFilterTrigger = (0, _system.styled)(_toolbarV.ToolbarButton, {
  name: 'MuiDataGrid',
  slot: 'ToolbarQuickFilterTrigger'
})(({
  ownerState
}) => ({
  gridArea: '1 / 1',
  width: 'min-content',
  height: 'min-content',
  zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1,
  pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: _cssVariables.vars.transition(['opacity'])
}));

// TODO: Use NotRendered from /utils/assert
// Currently causes react-docgen to fail
const GridQuickFilterTextField = (0, _system.styled)(_props => {
  throw new Error('Failed assertion: should not be rendered');
}, {
  name: 'MuiDataGrid',
  slot: 'ToolbarQuickFilterControl'
})(({
  ownerState
}) => ({
  gridArea: '1 / 1',
  overflowX: 'clip',
  width: ownerState.expanded ? 260 : 'var(--trigger-width)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: _cssVariables.vars.transition(['width', 'opacity'])
}));

/**
 * @deprecated Use the {@link https://mui.com/x/react-data-grid/components/quick-filter/ Quick Filter} component instead. This component will be removed in a future major release.
 */
function GridToolbarQuickFilter(props) {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const ownerState = {
    classes: rootProps.classes,
    expanded: false
  };
  const classes = useUtilityClasses(ownerState);
  const {
      quickFilterParser,
      quickFilterFormatter,
      debounceMs,
      className,
      slotProps
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_quickFilter.QuickFilter, {
    parser: quickFilterParser,
    formatter: quickFilterFormatter,
    debounceMs: debounceMs,
    render: (quickFilterProps, state) => {
      const currentOwnerState = (0, _extends2.default)({}, ownerState, {
        expanded: state.expanded
      });
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)(GridQuickFilterRoot, (0, _extends2.default)({}, quickFilterProps, {
        className: (0, _clsx.default)(classes.root, className),
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_quickFilter.QuickFilterTrigger, {
          render: triggerProps => /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseTooltip, {
            title: apiRef.current.getLocaleText('toolbarQuickFilterLabel'),
            enterDelay: 0 // Prevents tooltip lagging behind transitioning trigger element
            ,
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(GridQuickFilterTrigger, (0, _extends2.default)({
              className: classes.trigger
            }, triggerProps, {
              ownerState: currentOwnerState,
              color: "default",
              "aria-disabled": state.expanded,
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.quickFilterIcon, {
                fontSize: "small"
              })
            }))
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_quickFilter.QuickFilterControl, {
          render: _ref => {
            let {
                ref,
                slotProps: controlSlotProps
              } = _ref,
              controlProps = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded2);
            return /*#__PURE__*/(0, _jsxRuntime.jsx)(GridQuickFilterTextField, (0, _extends2.default)({
              as: rootProps.slots.baseTextField,
              className: classes.control,
              ownerState: currentOwnerState,
              inputRef: ref,
              "aria-label": apiRef.current.getLocaleText('toolbarQuickFilterLabel'),
              placeholder: apiRef.current.getLocaleText('toolbarQuickFilterPlaceholder'),
              size: "small",
              slotProps: (0, _extends2.default)({
                input: (0, _extends2.default)({
                  startAdornment: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.quickFilterIcon, {
                    fontSize: "small"
                  }),
                  endAdornment: controlProps.value ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_quickFilter.QuickFilterClear, {
                    render: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseIconButton, {
                      size: "small",
                      edge: "end",
                      "aria-label": apiRef.current.getLocaleText('toolbarQuickFilterDeleteIconLabel'),
                      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.quickFilterClearIcon, {
                        fontSize: "small"
                      })
                    })
                  }) : null
                }, controlSlotProps?.input)
              }, controlSlotProps)
            }, rootProps.slotProps?.baseTextField, controlProps, slotProps?.root, other));
          }
        })]
      }));
    }
  });
}
process.env.NODE_ENV !== "production" ? GridToolbarQuickFilter.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: _propTypes.default.string,
  /**
   * The debounce time in milliseconds.
   * @default 150
   */
  debounceMs: _propTypes.default.number,
  /**
   * Function responsible for formatting values of quick filter in a string when the model is modified
   * @param {any[]} values The new values passed to the quick filter model
   * @returns {string} The string to display in the text field
   * @default (values: string[]) => values.join(' ')
   */
  quickFilterFormatter: _propTypes.default.func,
  /**
   * Function responsible for parsing text input in an array of independent values for quick filtering.
   * @param {string} input The value entered by the user
   * @returns {any[]} The array of value on which quick filter is applied
   * @default (searchText: string) => searchText
   *   .split(' ')
   *   .filter((word) => word !== '')
   */
  quickFilterParser: _propTypes.default.func,
  slotProps: _propTypes.default.object
} : void 0;

/**
 * Demos:
 * - [Filtering - overview](https://mui.com/x/react-data-grid/filtering/)
 * - [Filtering - quick filter](https://mui.com/x/react-data-grid/filtering/quick-filter/)
 *
 * API:
 * - [GridToolbarQuickFilter API](https://mui.com/x/api/data-grid/grid-toolbar-quick-filter/)
 */