"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _useComponentRenderer = require("./useComponentRenderer");
Object.keys(_useComponentRenderer).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _useComponentRenderer[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _useComponentRenderer[key];
    }
  });
});