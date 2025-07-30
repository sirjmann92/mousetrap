"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unwrapPrivateAPI = unwrapPrivateAPI;
exports.useGridApiInitialization = useGridApiInitialization;
var React = _interopRequireWildcard(require("react"));
var _EventManager = require("@mui/x-internals/EventManager");
var _store = require("@mui/x-internals/store");
var _useGridApiMethod = require("../utils/useGridApiMethod");
var _signature = require("../../constants/signature");
const SYMBOL_API_PRIVATE = Symbol('mui.api_private');
const isSyntheticEvent = event => {
  return event.isPropagationStopped !== undefined;
};
function unwrapPrivateAPI(publicApi) {
  return publicApi[SYMBOL_API_PRIVATE];
}
let globalId = 0;
function createPrivateAPI(publicApiRef) {
  const existingPrivateApi = publicApiRef.current?.[SYMBOL_API_PRIVATE];
  if (existingPrivateApi) {
    return existingPrivateApi;
  }
  const state = {};
  const privateApi = {
    state,
    store: _store.Store.create(state),
    instanceId: {
      id: globalId
    }
  };
  globalId += 1;
  privateApi.getPublicApi = () => publicApiRef.current;
  privateApi.register = (visibility, methods) => {
    Object.keys(methods).forEach(methodName => {
      const method = methods[methodName];
      const currentPrivateMethod = privateApi[methodName];
      if (currentPrivateMethod?.spying === true) {
        currentPrivateMethod.target = method;
      } else {
        privateApi[methodName] = method;
      }
      if (visibility === 'public') {
        const publicApi = publicApiRef.current;
        const currentPublicMethod = publicApi[methodName];
        if (currentPublicMethod?.spying === true) {
          currentPublicMethod.target = method;
        } else {
          publicApi[methodName] = method;
        }
      }
    });
  };
  privateApi.register('private', {
    caches: {},
    eventManager: new _EventManager.EventManager()
  });
  return privateApi;
}
function createPublicAPI(privateApiRef) {
  const publicApi = {
    get state() {
      return privateApiRef.current.state;
    },
    get store() {
      return privateApiRef.current.store;
    },
    get instanceId() {
      return privateApiRef.current.instanceId;
    },
    [SYMBOL_API_PRIVATE]: privateApiRef.current
  };
  return publicApi;
}
function useGridApiInitialization(inputApiRef, props) {
  const publicApiRef = React.useRef(null);
  const privateApiRef = React.useRef(null);
  if (!privateApiRef.current) {
    privateApiRef.current = createPrivateAPI(publicApiRef);
  }
  if (!publicApiRef.current) {
    publicApiRef.current = createPublicAPI(privateApiRef);
  }
  const publishEvent = React.useCallback((...args) => {
    const [name, params, event = {}] = args;
    event.defaultMuiPrevented = false;
    if (isSyntheticEvent(event) && event.isPropagationStopped()) {
      return;
    }
    const details = props.signature === _signature.GridSignature.DataGridPro || props.signature === _signature.GridSignature.DataGridPremium ? {
      api: privateApiRef.current.getPublicApi()
    } : {};
    privateApiRef.current.eventManager.emit(name, params, event, details);
  }, [privateApiRef, props.signature]);
  const subscribeEvent = React.useCallback((event, handler, options) => {
    privateApiRef.current.eventManager.on(event, handler, options);
    const api = privateApiRef.current;
    return () => {
      api.eventManager.removeListener(event, handler);
    };
  }, [privateApiRef]);
  (0, _useGridApiMethod.useGridApiMethod)(privateApiRef, {
    subscribeEvent,
    publishEvent
  }, 'public');
  if (inputApiRef && !inputApiRef.current?.state) {
    inputApiRef.current = publicApiRef.current;
  }
  React.useImperativeHandle(inputApiRef, () => publicApiRef.current, [publicApiRef]);
  React.useEffect(() => {
    const api = privateApiRef.current;
    return () => {
      api.publishEvent('unmount');
    };
  }, [privateApiRef]);
  return privateApiRef;
}