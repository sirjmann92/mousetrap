"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTimeField = void 0;
var _useField = require("../internals/hooks/useField");
var _managers = require("../managers");
const useTimeField = props => {
  const manager = (0, _managers.useTimeManager)(props);
  return (0, _useField.useField)({
    manager,
    props
  });
};
exports.useTimeField = useTimeField;