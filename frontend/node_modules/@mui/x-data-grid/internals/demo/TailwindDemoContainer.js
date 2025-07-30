"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TailwindDemoContainer = TailwindDemoContainer;
var React = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("@mui/material/Box"));
var _CircularProgress = _interopRequireDefault(require("@mui/material/CircularProgress"));
var _jsxRuntime = require("react/jsx-runtime");
/**
 * WARNING: This is an internal component used in documentation to inject the Tailwind script.
 * Please do not use it in your application.
 */
function TailwindDemoContainer(props) {
  const {
    children,
    documentBody
  } = props;
  const [isLoaded, setIsLoaded] = React.useState(false);
  React.useEffect(() => {
    const body = documentBody ?? document.body;
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@tailwindcss/browser@4';
    let mounted = true;
    const cleanup = () => {
      mounted = false;
      script.remove();
      const head = body?.ownerDocument?.head;
      if (!head) {
        return;
      }
      const styles = head.querySelectorAll('style:not([data-emotion])');
      styles.forEach(style => {
        const styleText = style.textContent?.substring(0, 100);
        const isTailwindStylesheet = styleText?.includes('tailwind');
        if (isTailwindStylesheet) {
          style.remove();
        }
      });
    };
    script.onload = () => {
      if (!mounted) {
        cleanup();
        return;
      }
      setIsLoaded(true);
    };
    body.appendChild(script);
    return cleanup;
  }, [documentBody]);
  return isLoaded ? children : /*#__PURE__*/(0, _jsxRuntime.jsx)(_Box.default, {
    sx: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'
    },
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_CircularProgress.default, {})
  });
}