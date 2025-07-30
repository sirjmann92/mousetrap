"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Toolbar = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _system = require("@mui/system");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _clsx = _interopRequireDefault(require("clsx"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useComponentRenderer = require("@mui/x-internals/useComponentRenderer");
var _cssVariables = require("../../constants/cssVariables");
var _gridClasses = require("../../constants/gridClasses");
var _ToolbarContext = require("./ToolbarContext");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _utils = require("./utils");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["render", "className"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['toolbar']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const ToolbarRoot = (0, _system.styled)('div', {
  name: 'MuiDataGrid',
  slot: 'Toolbar'
})({
  flex: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',
  gap: _cssVariables.vars.spacing(0.25),
  padding: _cssVariables.vars.spacing(0.75),
  minHeight: 52,
  boxSizing: 'border-box',
  borderBottom: `1px solid ${_cssVariables.vars.colors.border.base}`
});

/**
 * The top level Toolbar component that provides context to child components.
 * It renders a styled `<div />` element.
 *
 * Demos:
 *
 * - [Toolbar](https://mui.com/x/react-data-grid/components/toolbar/)
 *
 * API:
 *
 * - [Toolbar API](https://mui.com/x/api/data-grid/toolbar/)
 */
const Toolbar = exports.Toolbar = (0, _forwardRef.forwardRef)(function Toolbar(props, ref) {
  const {
      render,
      className
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const classes = useUtilityClasses(rootProps);
  const [focusableItemId, setFocusableItemId] = React.useState(null);
  const [items, setItems] = React.useState([]);
  const getSortedItems = React.useCallback(() => items.sort(_utils.sortByDocumentPosition), [items]);
  const findEnabledItem = React.useCallback((startIndex, step, wrap = true) => {
    let index = startIndex;
    const sortedItems = getSortedItems();
    const itemCount = sortedItems.length;

    // Look for enabled items in the specified direction
    for (let i = 0; i < itemCount; i += 1) {
      index += step;

      // Handle wrapping around the ends
      if (index >= itemCount) {
        if (!wrap) {
          return -1;
        }
        index = 0;
      } else if (index < 0) {
        if (!wrap) {
          return -1;
        }
        index = itemCount - 1;
      }

      // Return if we found an enabled item
      if (!sortedItems[index].ref.current?.disabled && sortedItems[index].ref.current?.ariaDisabled !== 'true') {
        return index;
      }
    }

    // If we've checked all items and found none enabled
    return -1;
  }, [getSortedItems]);
  const registerItem = React.useCallback((id, itemRef) => {
    setItems(prevItems => [...prevItems, {
      id,
      ref: itemRef
    }]);
  }, []);
  const unregisterItem = React.useCallback(id => {
    setItems(prevItems => prevItems.filter(i => i.id !== id));
  }, []);
  const onItemKeyDown = React.useCallback(event => {
    if (!focusableItemId) {
      return;
    }
    const sortedItems = getSortedItems();
    const focusableItemIndex = sortedItems.findIndex(item => item.id === focusableItemId);
    let newIndex = -1;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      newIndex = findEnabledItem(focusableItemIndex, 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      newIndex = findEnabledItem(focusableItemIndex, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      newIndex = findEnabledItem(-1, 1, false);
    } else if (event.key === 'End') {
      event.preventDefault();
      newIndex = findEnabledItem(sortedItems.length, -1, false);
    }

    // TODO: Check why this is necessary
    if (newIndex >= 0 && newIndex < sortedItems.length) {
      const item = sortedItems[newIndex];
      setFocusableItemId(item.id);
      item.ref.current?.focus();
    }
  }, [getSortedItems, focusableItemId, findEnabledItem]);
  const onItemFocus = React.useCallback(id => {
    if (focusableItemId !== id) {
      setFocusableItemId(id);
    }
  }, [focusableItemId, setFocusableItemId]);
  const onItemDisabled = React.useCallback(id => {
    const sortedItems = getSortedItems();
    const currentIndex = sortedItems.findIndex(item => item.id === id);
    const newIndex = findEnabledItem(currentIndex, 1);
    if (newIndex >= 0 && newIndex < sortedItems.length) {
      const item = sortedItems[newIndex];
      setFocusableItemId(item.id);
      item.ref.current?.focus();
    }
  }, [getSortedItems, findEnabledItem]);
  React.useEffect(() => {
    const sortedItems = getSortedItems();
    if (sortedItems.length > 0) {
      // Set initial focusable item
      if (!focusableItemId) {
        setFocusableItemId(sortedItems[0].id);
        return;
      }
      const focusableItemIndex = sortedItems.findIndex(item => item.id === focusableItemId);
      if (!sortedItems[focusableItemIndex]) {
        // Last item has been removed from the items array
        const item = sortedItems[sortedItems.length - 1];
        if (item) {
          setFocusableItemId(item.id);
          item.ref.current?.focus();
        }
      } else if (focusableItemIndex === -1) {
        // Focused item has been removed from the items array
        const item = sortedItems[focusableItemIndex];
        if (item) {
          setFocusableItemId(item.id);
          item.ref.current?.focus();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSortedItems, findEnabledItem]);
  const contextValue = React.useMemo(() => ({
    focusableItemId,
    registerItem,
    unregisterItem,
    onItemKeyDown,
    onItemFocus,
    onItemDisabled
  }), [focusableItemId, registerItem, unregisterItem, onItemKeyDown, onItemFocus, onItemDisabled]);
  const element = (0, _useComponentRenderer.useComponentRenderer)(ToolbarRoot, render, (0, _extends2.default)({
    role: 'toolbar',
    'aria-orientation': 'horizontal',
    'aria-label': rootProps.label || undefined,
    className: (0, _clsx.default)(classes.root, className)
  }, other, {
    ref
  }));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_ToolbarContext.ToolbarContext.Provider, {
    value: contextValue,
    children: element
  });
});
if (process.env.NODE_ENV !== "production") Toolbar.displayName = "Toolbar";
process.env.NODE_ENV !== "production" ? Toolbar.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * A function to customize rendering of the component.
   */
  render: _propTypes.default.oneOfType([_propTypes.default.element, _propTypes.default.func])
} : void 0;