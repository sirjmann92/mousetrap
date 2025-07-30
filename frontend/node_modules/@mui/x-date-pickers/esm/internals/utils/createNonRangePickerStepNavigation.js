import { createStepNavigation } from "./createStepNavigation.js";
export function createNonRangePickerStepNavigation(parameters) {
  const {
    steps
  } = parameters;
  return createStepNavigation({
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