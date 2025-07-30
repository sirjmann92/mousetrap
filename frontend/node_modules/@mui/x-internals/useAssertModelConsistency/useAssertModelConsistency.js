"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAssertModelConsistency = void 0;
var React = _interopRequireWildcard(require("react"));
var _warning = require("../warning");
/**
 * Make sure a controlled prop is used correctly.
 * Logs errors if the prop either:
 *
 * - switch between controlled and uncontrolled
 * - modify it's default value
 * @param parameters
 */
function useAssertModelConsistencyOutsideOfProduction(parameters) {
  const {
    componentName,
    propName,
    controlled,
    defaultValue,
    warningPrefix = 'MUI X'
  } = parameters;
  const [{
    initialDefaultValue,
    isControlled
  }] = React.useState({
    initialDefaultValue: defaultValue,
    isControlled: controlled !== undefined
  });
  if (isControlled !== (controlled !== undefined)) {
    (0, _warning.warnOnce)([`${warningPrefix}: A component is changing the ${isControlled ? '' : 'un'}controlled ${propName} state of ${componentName} to be ${isControlled ? 'un' : ''}controlled.`, 'Elements should not switch from uncontrolled to controlled (or vice versa).', `Decide between using a controlled or uncontrolled ${propName} ` + 'element for the lifetime of the component.', "The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.", 'More info: https://fb.me/react-controlled-components'], 'error');
  }
  if (JSON.stringify(initialDefaultValue) !== JSON.stringify(defaultValue)) {
    (0, _warning.warnOnce)([`${warningPrefix}: A component is changing the default ${propName} state of an uncontrolled ${componentName} after being initialized. ` + `To suppress this warning opt to use a controlled ${componentName}.`], 'error');
  }
}
const useAssertModelConsistency = exports.useAssertModelConsistency = process.env.NODE_ENV === 'production' ? () => {} : useAssertModelConsistencyOutsideOfProduction;