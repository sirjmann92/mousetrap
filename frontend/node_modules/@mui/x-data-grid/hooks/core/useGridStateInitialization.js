"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridStateInitialization = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _utils = require("../utils");
var _utils2 = require("../../utils/utils");
const useGridStateInitialization = apiRef => {
  const controlStateMapRef = React.useRef({});
  const registerControlState = React.useCallback(controlStateItem => {
    controlStateMapRef.current[controlStateItem.stateId] = controlStateItem;
  }, []);
  const setState = React.useCallback((state, reason) => {
    let newState;
    if ((0, _utils2.isFunction)(state)) {
      newState = state(apiRef.current.state);
    } else {
      newState = state;
    }
    if (apiRef.current.state === newState) {
      return false;
    }
    const apiRefWithNewState = {
      current: {
        state: newState
      }
    };
    let ignoreSetState = false;

    // Apply the control state constraints
    const updatedControlStateIds = [];
    Object.keys(controlStateMapRef.current).forEach(stateId => {
      const controlState = controlStateMapRef.current[stateId];
      const oldSubState = controlState.stateSelector(apiRef);
      const newSubState = controlState.stateSelector(apiRefWithNewState);
      if (newSubState === oldSubState) {
        return;
      }
      updatedControlStateIds.push({
        stateId: controlState.stateId,
        hasPropChanged: newSubState !== controlState.propModel
      });

      // The state is controlled, the prop should always win
      if (controlState.propModel !== undefined && newSubState !== controlState.propModel) {
        ignoreSetState = true;
      }
    });
    if (updatedControlStateIds.length > 1) {
      // Each hook modify its own state, and it should not leak
      // Events are here to forward to other hooks and apply changes.
      // You are trying to update several states in a no isolated way.
      throw new Error(`You're not allowed to update several sub-state in one transaction. You already updated ${updatedControlStateIds[0].stateId}, therefore, you're not allowed to update ${updatedControlStateIds.map(el => el.stateId).join(', ')} in the same transaction.`);
    }
    if (!ignoreSetState) {
      // We always assign it as we mutate rows for perf reason.
      apiRef.current.state = newState;
      apiRef.current.publishEvent('stateChange', newState);
      apiRef.current.store.update(newState);
    }
    if (updatedControlStateIds.length === 1) {
      const {
        stateId,
        hasPropChanged
      } = updatedControlStateIds[0];
      const controlState = controlStateMapRef.current[stateId];
      const model = controlState.stateSelector(apiRefWithNewState);
      if (controlState.propOnChange && hasPropChanged) {
        controlState.propOnChange(model, {
          reason,
          api: apiRef.current
        });
      }
      if (!ignoreSetState) {
        apiRef.current.publishEvent(controlState.changeEvent, model, {
          reason
        });
      }
    }
    return !ignoreSetState;
  }, [apiRef]);
  const updateControlState = React.useCallback((key, state, reason) => {
    return apiRef.current.setState(previousState => {
      return (0, _extends2.default)({}, previousState, {
        [key]: state(previousState[key])
      });
    }, reason);
  }, [apiRef]);
  const publicStateApi = {
    setState
  };
  const privateStateApi = {
    updateControlState,
    registerControlState
  };
  (0, _utils.useGridApiMethod)(apiRef, publicStateApi, 'public');
  (0, _utils.useGridApiMethod)(apiRef, privateStateApi, 'private');
};
exports.useGridStateInitialization = useGridStateInitialization;