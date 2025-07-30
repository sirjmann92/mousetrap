"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuickFilter = QuickFilter;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _debounce = _interopRequireDefault(require("@mui/utils/debounce"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _isDeepEqual = require("@mui/x-internals/isDeepEqual");
var _useComponentRenderer = require("@mui/x-internals/useComponentRenderer");
var _QuickFilterContext = require("./QuickFilterContext");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _useGridSelector = require("../../hooks/utils/useGridSelector");
var _filter = require("../../hooks/features/filter");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["render", "className", "parser", "formatter", "debounceMs", "defaultExpanded", "expanded", "onExpandedChange"];
const DEFAULT_PARSER = searchText => searchText.split(' ').filter(word => word !== '');
const DEFAULT_FORMATTER = values => values.join(' ');

/**
 * The top level Quick Filter component that provides context to child components.
 * It renders a `<div />` element.
 *
 * Demos:
 *
 * - [Quick Filter](https://mui.com/x/react-data-grid/components/quick-filter/)
 *
 * API:
 *
 * - [QuickFilter API](https://mui.com/x/api/data-grid/quick-filter/)
 */
function QuickFilter(props) {
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const {
      render,
      className,
      parser = DEFAULT_PARSER,
      formatter = DEFAULT_FORMATTER,
      debounceMs = rootProps.filterDebounceMs,
      defaultExpanded,
      expanded,
      onExpandedChange
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const controlRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const quickFilterValues = (0, _useGridSelector.useGridSelector)(apiRef, _filter.gridQuickFilterValuesSelector);
  const [value, setValue] = React.useState(formatter(quickFilterValues ?? []));
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded ?? value.length > 0);
  const expandedValue = expanded ?? internalExpanded;
  const state = React.useMemo(() => ({
    value,
    expanded: expandedValue
  }), [value, expandedValue]);
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const ref = React.useRef(null);
  const controlId = (0, _useId.default)();
  const handleExpandedChange = React.useCallback(newExpanded => {
    if (onExpandedChange) {
      onExpandedChange(newExpanded);
    }
    if (expanded === undefined) {
      setInternalExpanded(newExpanded);
    }
  }, [onExpandedChange, expanded]);
  const prevQuickFilterValuesRef = React.useRef(quickFilterValues);
  React.useEffect(() => {
    if (!(0, _isDeepEqual.isDeepEqual)(prevQuickFilterValuesRef.current, quickFilterValues)) {
      // The model of quick filter value has been updated
      prevQuickFilterValuesRef.current = quickFilterValues;

      // Update the input value if needed to match the new model
      setValue(prevSearchValue => (0, _isDeepEqual.isDeepEqual)(parser(prevSearchValue), quickFilterValues) ? prevSearchValue : formatter(quickFilterValues ?? []));
    }
  }, [quickFilterValues, formatter, parser]);
  const isFirstRender = React.useRef(true);
  const previousExpandedValue = React.useRef(expandedValue);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Ensure the expanded state has actually changed before focusing
    if (previousExpandedValue.current !== expandedValue) {
      if (expandedValue) {
        // Ensures the focus does not interupt CSS transitions and animations on the control
        requestAnimationFrame(() => {
          controlRef.current?.focus({
            preventScroll: true
          });
        });
      } else {
        triggerRef.current?.focus({
          preventScroll: true
        });
      }
      previousExpandedValue.current = expandedValue;
    }
  }, [expandedValue]);
  const setQuickFilterValueDebounced = React.useMemo(() => (0, _debounce.default)(newValue => {
    const newQuickFilterValues = parser(newValue);
    prevQuickFilterValuesRef.current = newQuickFilterValues;
    apiRef.current.setQuickFilterValues(newQuickFilterValues);
  }, debounceMs), [apiRef, debounceMs, parser]);
  React.useEffect(() => setQuickFilterValueDebounced.clear, [setQuickFilterValueDebounced]);
  const handleValueChange = React.useCallback(event => {
    const newValue = event.target.value;
    setValue(newValue);
    setQuickFilterValueDebounced(newValue);
  }, [setQuickFilterValueDebounced]);
  const handleClearValue = React.useCallback(() => {
    setValue('');
    apiRef.current.setQuickFilterValues([]);
    controlRef.current?.focus();
  }, [apiRef, controlRef]);
  const contextValue = React.useMemo(() => ({
    controlRef,
    triggerRef,
    state,
    controlId,
    clearValue: handleClearValue,
    onValueChange: handleValueChange,
    onExpandedChange: handleExpandedChange
  }), [controlId, state, handleValueChange, handleClearValue, handleExpandedChange]);
  (0, _useEnhancedEffect.default)(() => {
    if (ref.current && triggerRef.current) {
      ref.current.style.setProperty('--trigger-width', `${triggerRef.current?.offsetWidth}px`);
    }
  }, []);
  const element = (0, _useComponentRenderer.useComponentRenderer)('div', render, (0, _extends2.default)({
    className: resolvedClassName
  }, other, {
    ref
  }), state);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_QuickFilterContext.QuickFilterContext.Provider, {
    value: contextValue,
    children: element
  });
}
process.env.NODE_ENV !== "production" ? QuickFilter.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  className: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string]),
  /**
   * The debounce time in milliseconds.
   * @default 150
   */
  debounceMs: _propTypes.default.number,
  /**
   * The default expanded state of the quick filter control.
   * @default false
   */
  defaultExpanded: _propTypes.default.bool,
  /**
   * The expanded state of the quick filter control.
   */
  expanded: _propTypes.default.bool,
  /**
   * Function responsible for formatting values of quick filter in a string when the model is modified
   * @param {any[]} values The new values passed to the quick filter model
   * @returns {string} The string to display in the text field
   * @default (values: string[]) => values.join(' ')
   */
  formatter: _propTypes.default.func,
  /**
   * Callback function that is called when the quick filter input is expanded or collapsed.
   * @param {boolean} expanded The new expanded state of the quick filter control
   */
  onExpandedChange: _propTypes.default.func,
  /**
   * Function responsible for parsing text input in an array of independent values for quick filtering.
   * @param {string} input The value entered by the user
   * @returns {any[]} The array of value on which quick filter is applied
   * @default (searchText: string) => searchText.split(' ').filter((word) => word !== '')
   */
  parser: _propTypes.default.func,
  /**
   * A function to customize rendering of the component.
   */
  render: _propTypes.default.oneOfType([_propTypes.default.element, _propTypes.default.func])
} : void 0;