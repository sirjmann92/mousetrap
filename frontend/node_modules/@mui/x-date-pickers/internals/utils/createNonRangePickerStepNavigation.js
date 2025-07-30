"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNonRangePickerStepNavigation = createNonRangePickerStepNavigation;
var _createStepNavigation = require("./createStepNavigation");
function createNonRangePickerStepNavigation(parameters) {
  const {
    steps
  } = parameters;
  return (0, _createStepNavigation.createStepNavigation)({
    steps,
    isViewMatchingStep: (view, step) => {
      return step.views == null || step.views.includes(view);
    },
    onStepChange: ({
      step,
      defaultView,
      setView,
      view,
      views
    }) => {
      const targetView = step.views == null ? defaultView : step.views.find(viewBis => views.includes(viewBis));
      if (targetView !== view) {
        setView(targetView);
      }
    }
  });
}