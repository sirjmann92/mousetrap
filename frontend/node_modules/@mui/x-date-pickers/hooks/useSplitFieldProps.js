"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSplitFieldProps = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _extractValidationProps = require("../validation/extractValidationProps");
const SHARED_FIELD_INTERNAL_PROP_NAMES = ['value', 'defaultValue', 'referenceDate', 'format', 'formatDensity', 'onChange', 'timezone', 'onError', 'shouldRespectLeadingZeros', 'selectedSections', 'onSelectedSectionsChange', 'unstableFieldRef', 'unstableStartFieldRef', 'unstableEndFieldRef', 'enableAccessibleFieldDOMStructure', 'disabled', 'readOnly', 'dateSeparator', 'autoFocus', 'focused'];
/**
 * Split the props received by the field component into:
 * - `internalProps` which are used by the various hooks called by the field component.
 * - `forwardedProps` which are passed to the underlying component.
 * Note that some forwarded props might be used by the hooks as well.
 * For instance, hooks like `useDateField` need props like `onKeyDown` to merge the default event handler and the one provided by the application.
 * @template TProps, TValueType
 * @param {TProps} props The props received by the field component.
 * @param {TValueType} valueType The type of the field value ('date', 'time', or 'date-time').
 */
const useSplitFieldProps = (props, valueType) => {
  return React.useMemo(() => {
    const forwardedProps = (0, _extends2.default)({}, props);
    const internalProps = {};
    const extractProp = propName => {
      if (forwardedProps.hasOwnProperty(propName)) {
        // @ts-ignore
        internalProps[propName] = forwardedProps[propName];
        delete forwardedProps[propName];
      }
    };
    SHARED_FIELD_INTERNAL_PROP_NAMES.forEach(extractProp);
    if (valueType === 'date') {
      _extractValidationProps.DATE_VALIDATION_PROP_NAMES.forEach(extractProp);
    } else if (valueType === 'time') {
      _extractValidationProps.TIME_VALIDATION_PROP_NAMES.forEach(extractProp);
    } else if (valueType === 'date-time') {
      _extractValidationProps.DATE_VALIDATION_PROP_NAMES.forEach(extractProp);
      _extractValidationProps.TIME_VALIDATION_PROP_NAMES.forEach(extractProp);
      _extractValidationProps.DATE_TIME_VALIDATION_PROP_NAMES.forEach(extractProp);
    }
    return {
      forwardedProps,
      internalProps
    };
  }, [props, valueType]);
};

/**
 * Extract the internal props from the props received by the field component.
 * This makes sure that the internal props not defined in the props are not present in the result.
 */
exports.useSplitFieldProps = useSplitFieldProps;