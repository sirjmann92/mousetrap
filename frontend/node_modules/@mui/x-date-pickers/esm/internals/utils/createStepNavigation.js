import _extends from "@babel/runtime/helpers/esm/extends";
export const DEFAULT_STEP_NAVIGATION = {
  hasNextStep: false,
  hasSeveralSteps: false,
  goToNextStep: () => {},
  areViewsInSameStep: () => true
};

/**
 * Create an object that determines whether there is a next step and allows to go to the next step.
 * @param {CreateStepNavigationParameters<TStep>} parameters The parameters of the createStepNavigation function
 * @returns {CreateStepNavigationReturnValue} The return value of the createStepNavigation function
 */
export function createStepNavigation(parameters) {
  const {
    steps,
    isViewMatchingStep,
    onStepChange
  } = parameters;
  return parametersBis => {
    if (steps == null) {
      return DEFAULT_STEP_NAVIGATION;
    }
    const currentStepIndex = steps.findIndex(step => isViewMatchingStep(parametersBis.view, step));
    const nextStep = currentStepIndex === -1 || currentStepIndex === steps.length - 1 ? null : steps[currentStepIndex + 1];
    return {
      hasNextStep: nextStep != null,
      hasSeveralSteps: steps.length > 1,
      goToNextStep: () => {
        if (nextStep == null) {
          return;
        }
        onStepChange(_extends({}, parametersBis, {
          step: nextStep
        }));
      },
      areViewsInSameStep: (viewA, viewB) => {
        const stepA = steps.find(step => isViewMatchingStep(viewA, step));
        const stepB = steps.find(step => isViewMatchingStep(viewB, step));
        return stepA === stepB;
      }
    };
  };
}