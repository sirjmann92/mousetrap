"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarContext = void 0;
exports.ToolbarContextProvider = ToolbarContextProvider;
exports.useToolbarContext = useToolbarContext;
var React = _interopRequireWildcard(require("react"));
var _jsxRuntime = require("react/jsx-runtime");
const ToolbarContext = exports.ToolbarContext = /*#__PURE__*/React.createContext(undefined);
if (process.env.NODE_ENV !== "production") ToolbarContext.displayName = "ToolbarContext";
function useToolbarContext() {
  const context = React.useContext(ToolbarContext);
  if (context === undefined) {
    throw new Error('MUI X: Missing context. Toolbar subcomponents must be placed within a <Toolbar /> component.');
  }
  return context;
}
function ToolbarContextProvider({
  children
}) {
  const [focusableItemId, setFocusableItemId] = React.useState(null);
  const focusableItemIdRef = React.useRef(focusableItemId);
  const [items, setItems] = React.useState([]);
  const getSortedItems = React.useCallback(() => items.sort(sortByDocumentPosition), [items]);
  const findEnabledItem = React.useCallback((startIndex, step, wrap = true) => {
    let index = startIndex;
    const sortedItems = getSortedItems();
    const itemCount = sortedItems.length;

    // Look for enabled items in the specified direction
    for (let i = 0; i < itemCount; i += 1) {
      index += step;

      // Handle wrapping around the ends
      if (index >= itemCount) {
        if (!wrap) {
          return -1;
        }
        index = 0;
      } else if (index < 0) {
        if (!wrap) {
          return -1;
        }
        index = itemCount - 1;
      }

      // Return if we found an enabled item
      if (!sortedItems[index].ref.current?.disabled && sortedItems[index].ref.current?.ariaDisabled !== 'true') {
        return index;
      }
    }

    // If we've checked all items and found none enabled
    return -1;
  }, [getSortedItems]);
  const registerItem = React.useCallback((id, itemRef) => {
    setItems(prevItems => [...prevItems, {
      id,
      ref: itemRef
    }]);
  }, []);
  const unregisterItem = React.useCallback(id => {
    setItems(prevItems => prevItems.filter(i => i.id !== id));
  }, []);
  const onItemKeyDown = React.useCallback(event => {
    if (!focusableItemId) {
      return;
    }
    const sortedItems = getSortedItems();
    const focusableItemIndex = sortedItems.findIndex(item => item.id === focusableItemId);
    let newIndex = -1;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      newIndex = findEnabledItem(focusableItemIndex, 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      newIndex = findEnabledItem(focusableItemIndex, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      newIndex = findEnabledItem(-1, 1, false);
    } else if (event.key === 'End') {
      event.preventDefault();
      newIndex = findEnabledItem(sortedItems.length, -1, false);
    }

    // TODO: Check why this is necessary
    if (newIndex >= 0 && newIndex < sortedItems.length) {
      const item = sortedItems[newIndex];
      setFocusableItemId(item.id);
      item.ref.current?.focus();
    }
  }, [getSortedItems, focusableItemId, findEnabledItem]);
  const onItemFocus = React.useCallback(id => {
    if (focusableItemId !== id) {
      setFocusableItemId(id);
    }
  }, [focusableItemId, setFocusableItemId]);
  const onItemDisabled = React.useCallback(id => {
    const sortedItems = getSortedItems();
    const currentIndex = sortedItems.findIndex(item => item.id === id);
    const newIndex = findEnabledItem(currentIndex, 1);
    if (newIndex >= 0 && newIndex < sortedItems.length) {
      const item = sortedItems[newIndex];
      setFocusableItemId(item.id);
      item.ref.current?.focus();
    }
  }, [getSortedItems, findEnabledItem]);
  React.useEffect(() => {
    focusableItemIdRef.current = focusableItemId;
  }, [focusableItemId]);
  React.useEffect(() => {
    const sortedItems = getSortedItems();
    if (sortedItems.length > 0) {
      // Set initial focusable item
      if (!focusableItemIdRef.current) {
        setFocusableItemId(sortedItems[0].id);
        return;
      }
      const focusableItemIndex = sortedItems.findIndex(item => item.id === focusableItemIdRef.current);
      if (!sortedItems[focusableItemIndex]) {
        // Last item has been removed from the items array
        const item = sortedItems[sortedItems.length - 1];
        if (item) {
          setFocusableItemId(item.id);
          item.ref.current?.focus();
        }
      } else if (focusableItemIndex === -1) {
        // Focused item has been removed from the items array
        const item = sortedItems[focusableItemIndex];
        if (item) {
          setFocusableItemId(item.id);
          item.ref.current?.focus();
        }
      }
    }
  }, [getSortedItems, findEnabledItem]);
  const contextValue = React.useMemo(() => ({
    focusableItemId,
    registerItem,
    unregisterItem,
    onItemKeyDown,
    onItemFocus,
    onItemDisabled
  }), [focusableItemId, registerItem, unregisterItem, onItemKeyDown, onItemFocus, onItemDisabled]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(ToolbarContext.Provider, {
    value: contextValue,
    children: children
  });
}

/* eslint-disable no-bitwise */
function sortByDocumentPosition(a, b) {
  if (!a.ref.current || !b.ref.current) {
    return 0;
  }
  const position = a.ref.current.compareDocumentPosition(b.ref.current);
  if (!position) {
    return 0;
  }
  if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
    return -1;
  }
  if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
    return 1;
  }
  return 0;
}