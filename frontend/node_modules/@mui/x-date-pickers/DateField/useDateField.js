"use strict";
'use client';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useDateField = void 0;
var _useField = require("../internals/hooks/useField");
var _managers = require("../managers");
const useDateField = props => {
  const manager = (0, _managers.useDateManager)(props);
  return (0, _useField.useField)({
    manager,
    props
  });
};
exports.useDateField = useDateField;