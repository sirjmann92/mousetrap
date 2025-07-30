"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridProps = exports.propsStateInitializer = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
const propsStateInitializer = (state, props) => {
  return (0, _extends2.default)({}, state, {
    props: {
      listView: props.listView,
      getRowId: props.getRowId
    }
  });
};
exports.propsStateInitializer = propsStateInitializer;
const useGridProps = (apiRef, props) => {
  React.useEffect(() => {
    apiRef.current.setState(state => (0, _extends2.default)({}, state, {
      props: {
        listView: props.listView,
        getRowId: props.getRowId
      }
    }));
  }, [apiRef, props.listView, props.getRowId]);
};
exports.useGridProps = useGridProps;