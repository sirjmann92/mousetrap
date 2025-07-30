"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _rafThrottle = require("./rafThrottle");
Object.keys(_rafThrottle).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _rafThrottle[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _rafThrottle[key];
    }
  });
});