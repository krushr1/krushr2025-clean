import {
  toast,
  useWorkspaceContextStore
} from "/chunks/chunk-26AQZRFX.js";
import {
  Anchor,
  Arrow,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CompactTaskModal,
  Content,
  DismissableLayer,
  Portal,
  RichTextEditor,
  Root2,
  VISUALLY_HIDDEN_STYLES,
  constructNow,
  createPopperScope,
  enUS,
  endOfDay,
  endOfMonth,
  format,
  getDefaultOptions,
  getTimezoneOffsetInMilliseconds,
  minutesInDay,
  minutesInMonth,
  toDate,
  useControllableState,
  useId
} from "/chunks/chunk-PAGTJ65N.js";
import {
  FloatingInput
} from "/chunks/chunk-4VNX5AHK.js";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "/chunks/chunk-53N6ZYFC.js";
import {
  useOptimisticAction
} from "/chunks/chunk-XG5DCYXO.js";
import {
  Button,
  cva,
  useOptimisticDelete,
  useToast
} from "/chunks/chunk-KDAPYUH3.js";
import {
  trpc
} from "/chunks/chunk-GEIPPW2F.js";
import {
  clamp,
  useDirection
} from "/chunks/chunk-XQK55YGT.js";
import {
  Presence,
  Primitive,
  composeEventHandlers,
  createContext2,
  createContextScope,
  dispatchDiscreteCustomEvent,
  useCallbackRef,
  useLayoutEffect2
} from "/chunks/chunk-QHXVCZRG.js";
import {
  composeRefs,
  createSlot,
  require_react_dom,
  useComposedRefs
} from "/chunks/chunk-O4RKJJFS.js";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleAlert,
  CircleCheck,
  Clock,
  Download,
  Ellipsis,
  EllipsisVertical,
  Eye,
  File,
  FileArchive,
  FileImage,
  FileText,
  FileVideo,
  Funnel,
  GripVertical,
  Image,
  LoaderCircle,
  MessageCircle,
  MessageSquare,
  Paperclip,
  Pen,
  Plus,
  Send,
  Settings,
  SquareCheckBig,
  SquarePen,
  Trash2,
  Upload,
  User,
  X,
  __toESM,
  cn,
  formatDate,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-CR5PFQOW.js";

// src/components/kanban/KanbanBoard.tsx
var import_react12 = __toESM(require_react(), 1);

// ../node_modules/@dnd-kit/core/dist/core.esm.js
var import_react3 = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());

// ../node_modules/@dnd-kit/utilities/dist/utilities.esm.js
var import_react = __toESM(require_react());
function useCombinedRefs() {
  for (var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++) {
    refs[_key] = arguments[_key];
  }
  return (0, import_react.useMemo)(
    () => (node) => {
      refs.forEach((ref) => ref(node));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
var canUseDOM = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
function isWindow(element) {
  const elementString = Object.prototype.toString.call(element);
  return elementString === "[object Window]" || // In Electron context the Window object serializes to [object global]
  elementString === "[object global]";
}
function isNode(node) {
  return "nodeType" in node;
}
function getWindow(target) {
  var _target$ownerDocument, _target$ownerDocument2;
  if (!target) {
    return window;
  }
  if (isWindow(target)) {
    return target;
  }
  if (!isNode(target)) {
    return window;
  }
  return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
}
function isDocument(node) {
  const {
    Document
  } = getWindow(node);
  return node instanceof Document;
}
function isHTMLElement(node) {
  if (isWindow(node)) {
    return false;
  }
  return node instanceof getWindow(node).HTMLElement;
}
function isSVGElement(node) {
  return node instanceof getWindow(node).SVGElement;
}
function getOwnerDocument(target) {
  if (!target) {
    return document;
  }
  if (isWindow(target)) {
    return target.document;
  }
  if (!isNode(target)) {
    return document;
  }
  if (isDocument(target)) {
    return target;
  }
  if (isHTMLElement(target) || isSVGElement(target)) {
    return target.ownerDocument;
  }
  return document;
}
var useIsomorphicLayoutEffect = canUseDOM ? import_react.useLayoutEffect : import_react.useEffect;
function useEvent(handler) {
  const handlerRef = (0, import_react.useRef)(handler);
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  });
  return (0, import_react.useCallback)(function() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return handlerRef.current == null ? void 0 : handlerRef.current(...args);
  }, []);
}
function useInterval() {
  const intervalRef = (0, import_react.useRef)(null);
  const set = (0, import_react.useCallback)((listener, duration) => {
    intervalRef.current = setInterval(listener, duration);
  }, []);
  const clear = (0, import_react.useCallback)(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  return [set, clear];
}
function useLatestValue(value, dependencies) {
  if (dependencies === void 0) {
    dependencies = [value];
  }
  const valueRef = (0, import_react.useRef)(value);
  useIsomorphicLayoutEffect(() => {
    if (valueRef.current !== value) {
      valueRef.current = value;
    }
  }, dependencies);
  return valueRef;
}
function useLazyMemo(callback, dependencies) {
  const valueRef = (0, import_react.useRef)();
  return (0, import_react.useMemo)(
    () => {
      const newValue = callback(valueRef.current);
      valueRef.current = newValue;
      return newValue;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies]
  );
}
function useNodeRef(onChange) {
  const onChangeHandler = useEvent(onChange);
  const node = (0, import_react.useRef)(null);
  const setNodeRef = (0, import_react.useCallback)(
    (element) => {
      if (element !== node.current) {
        onChangeHandler == null ? void 0 : onChangeHandler(element, node.current);
      }
      node.current = element;
    },
    //eslint-disable-next-line
    []
  );
  return [node, setNodeRef];
}
function usePrevious(value) {
  const ref = (0, import_react.useRef)();
  (0, import_react.useEffect)(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
var ids = {};
function useUniqueId(prefix, value) {
  return (0, import_react.useMemo)(() => {
    if (value) {
      return value;
    }
    const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
    ids[prefix] = id;
    return prefix + "-" + id;
  }, [prefix, value]);
}
function createAdjustmentFn(modifier) {
  return function(object) {
    for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      adjustments[_key - 1] = arguments[_key];
    }
    return adjustments.reduce((accumulator, adjustment) => {
      const entries = Object.entries(adjustment);
      for (const [key2, valueAdjustment] of entries) {
        const value = accumulator[key2];
        if (value != null) {
          accumulator[key2] = value + modifier * valueAdjustment;
        }
      }
      return accumulator;
    }, {
      ...object
    });
  };
}
var add = /* @__PURE__ */ createAdjustmentFn(1);
var subtract = /* @__PURE__ */ createAdjustmentFn(-1);
function hasViewportRelativeCoordinates(event) {
  return "clientX" in event && "clientY" in event;
}
function isKeyboardEvent(event) {
  if (!event) {
    return false;
  }
  const {
    KeyboardEvent
  } = getWindow(event.target);
  return KeyboardEvent && event instanceof KeyboardEvent;
}
function isTouchEvent(event) {
  if (!event) {
    return false;
  }
  const {
    TouchEvent
  } = getWindow(event.target);
  return TouchEvent && event instanceof TouchEvent;
}
function getEventCoordinates(event) {
  if (isTouchEvent(event)) {
    if (event.touches && event.touches.length) {
      const {
        clientX: x,
        clientY: y
      } = event.touches[0];
      return {
        x,
        y
      };
    } else if (event.changedTouches && event.changedTouches.length) {
      const {
        clientX: x,
        clientY: y
      } = event.changedTouches[0];
      return {
        x,
        y
      };
    }
  }
  if (hasViewportRelativeCoordinates(event)) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  return null;
}
var CSS = /* @__PURE__ */ Object.freeze({
  Translate: {
    toString(transform) {
      if (!transform) {
        return;
      }
      const {
        x,
        y
      } = transform;
      return "translate3d(" + (x ? Math.round(x) : 0) + "px, " + (y ? Math.round(y) : 0) + "px, 0)";
    }
  },
  Scale: {
    toString(transform) {
      if (!transform) {
        return;
      }
      const {
        scaleX,
        scaleY
      } = transform;
      return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
    }
  },
  Transform: {
    toString(transform) {
      if (!transform) {
        return;
      }
      return [CSS.Translate.toString(transform), CSS.Scale.toString(transform)].join(" ");
    }
  },
  Transition: {
    toString(_ref) {
      let {
        property,
        duration,
        easing
      } = _ref;
      return property + " " + duration + "ms " + easing;
    }
  }
});
var SELECTOR = "a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";
function findFirstFocusableNode(element) {
  if (element.matches(SELECTOR)) {
    return element;
  }
  return element.querySelector(SELECTOR);
}

// ../node_modules/@dnd-kit/accessibility/dist/accessibility.esm.js
var import_react2 = __toESM(require_react());
var hiddenStyles = {
  display: "none"
};
function HiddenText(_ref) {
  let {
    id,
    value
  } = _ref;
  return import_react2.default.createElement("div", {
    id,
    style: hiddenStyles
  }, value);
}
function LiveRegion(_ref) {
  let {
    id,
    announcement,
    ariaLiveType = "assertive"
  } = _ref;
  const visuallyHidden = {
    position: "fixed",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    margin: -1,
    border: 0,
    padding: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    clipPath: "inset(100%)",
    whiteSpace: "nowrap"
  };
  return import_react2.default.createElement("div", {
    id,
    style: visuallyHidden,
    role: "status",
    "aria-live": ariaLiveType,
    "aria-atomic": true
  }, announcement);
}
function useAnnouncement() {
  const [announcement, setAnnouncement] = (0, import_react2.useState)("");
  const announce = (0, import_react2.useCallback)((value) => {
    if (value != null) {
      setAnnouncement(value);
    }
  }, []);
  return {
    announce,
    announcement
  };
}

// ../node_modules/@dnd-kit/core/dist/core.esm.js
var DndMonitorContext = /* @__PURE__ */ (0, import_react3.createContext)(null);
function useDndMonitor(listener) {
  const registerListener = (0, import_react3.useContext)(DndMonitorContext);
  (0, import_react3.useEffect)(() => {
    if (!registerListener) {
      throw new Error("useDndMonitor must be used within a children of <DndContext>");
    }
    const unsubscribe = registerListener(listener);
    return unsubscribe;
  }, [listener, registerListener]);
}
function useDndMonitorProvider() {
  const [listeners] = (0, import_react3.useState)(() => /* @__PURE__ */ new Set());
  const registerListener = (0, import_react3.useCallback)((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [listeners]);
  const dispatch = (0, import_react3.useCallback)((_ref) => {
    let {
      type,
      event
    } = _ref;
    listeners.forEach((listener) => {
      var _listener$type;
      return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
    });
  }, [listeners]);
  return [dispatch, registerListener];
}
var defaultScreenReaderInstructions = {
  draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "
};
var defaultAnnouncements = {
  onDragStart(_ref) {
    let {
      active
    } = _ref;
    return "Picked up draggable item " + active.id + ".";
  },
  onDragOver(_ref2) {
    let {
      active,
      over
    } = _ref2;
    if (over) {
      return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
    }
    return "Draggable item " + active.id + " is no longer over a droppable area.";
  },
  onDragEnd(_ref3) {
    let {
      active,
      over
    } = _ref3;
    if (over) {
      return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
    }
    return "Draggable item " + active.id + " was dropped.";
  },
  onDragCancel(_ref4) {
    let {
      active
    } = _ref4;
    return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
  }
};
function Accessibility(_ref) {
  let {
    announcements = defaultAnnouncements,
    container,
    hiddenTextDescribedById,
    screenReaderInstructions = defaultScreenReaderInstructions
  } = _ref;
  const {
    announce,
    announcement
  } = useAnnouncement();
  const liveRegionId = useUniqueId("DndLiveRegion");
  const [mounted, setMounted] = (0, import_react3.useState)(false);
  (0, import_react3.useEffect)(() => {
    setMounted(true);
  }, []);
  useDndMonitor((0, import_react3.useMemo)(() => ({
    onDragStart(_ref2) {
      let {
        active
      } = _ref2;
      announce(announcements.onDragStart({
        active
      }));
    },
    onDragMove(_ref3) {
      let {
        active,
        over
      } = _ref3;
      if (announcements.onDragMove) {
        announce(announcements.onDragMove({
          active,
          over
        }));
      }
    },
    onDragOver(_ref4) {
      let {
        active,
        over
      } = _ref4;
      announce(announcements.onDragOver({
        active,
        over
      }));
    },
    onDragEnd(_ref5) {
      let {
        active,
        over
      } = _ref5;
      announce(announcements.onDragEnd({
        active,
        over
      }));
    },
    onDragCancel(_ref6) {
      let {
        active,
        over
      } = _ref6;
      announce(announcements.onDragCancel({
        active,
        over
      }));
    }
  }), [announce, announcements]));
  if (!mounted) {
    return null;
  }
  const markup = import_react3.default.createElement(import_react3.default.Fragment, null, import_react3.default.createElement(HiddenText, {
    id: hiddenTextDescribedById,
    value: screenReaderInstructions.draggable
  }), import_react3.default.createElement(LiveRegion, {
    id: liveRegionId,
    announcement
  }));
  return container ? (0, import_react_dom.createPortal)(markup, container) : markup;
}
var Action;
(function(Action2) {
  Action2["DragStart"] = "dragStart";
  Action2["DragMove"] = "dragMove";
  Action2["DragEnd"] = "dragEnd";
  Action2["DragCancel"] = "dragCancel";
  Action2["DragOver"] = "dragOver";
  Action2["RegisterDroppable"] = "registerDroppable";
  Action2["SetDroppableDisabled"] = "setDroppableDisabled";
  Action2["UnregisterDroppable"] = "unregisterDroppable";
})(Action || (Action = {}));
function noop() {
}
function useSensor(sensor, options) {
  return (0, import_react3.useMemo)(
    () => ({
      sensor,
      options: options != null ? options : {}
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sensor, options]
  );
}
function useSensors() {
  for (var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++) {
    sensors[_key] = arguments[_key];
  }
  return (0, import_react3.useMemo)(
    () => [...sensors].filter((sensor) => sensor != null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...sensors]
  );
}
var defaultCoordinates = /* @__PURE__ */ Object.freeze({
  x: 0,
  y: 0
});
function distanceBetween(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
function getRelativeTransformOrigin(event, rect) {
  const eventCoordinates = getEventCoordinates(event);
  if (!eventCoordinates) {
    return "0 0";
  }
  const transformOrigin = {
    x: (eventCoordinates.x - rect.left) / rect.width * 100,
    y: (eventCoordinates.y - rect.top) / rect.height * 100
  };
  return transformOrigin.x + "% " + transformOrigin.y + "%";
}
function sortCollisionsAsc(_ref, _ref2) {
  let {
    data: {
      value: a
    }
  } = _ref;
  let {
    data: {
      value: b
    }
  } = _ref2;
  return a - b;
}
function sortCollisionsDesc(_ref3, _ref4) {
  let {
    data: {
      value: a
    }
  } = _ref3;
  let {
    data: {
      value: b
    }
  } = _ref4;
  return b - a;
}
function cornersOfRectangle(_ref5) {
  let {
    left,
    top,
    height,
    width
  } = _ref5;
  return [{
    x: left,
    y: top
  }, {
    x: left + width,
    y: top
  }, {
    x: left,
    y: top + height
  }, {
    x: left + width,
    y: top + height
  }];
}
function getFirstCollision(collisions, property) {
  if (!collisions || collisions.length === 0) {
    return null;
  }
  const [firstCollision] = collisions;
  return property ? firstCollision[property] : firstCollision;
}
function centerOfRectangle(rect, left, top) {
  if (left === void 0) {
    left = rect.left;
  }
  if (top === void 0) {
    top = rect.top;
  }
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5
  };
}
var closestCenter = (_ref) => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const centerRect = centerOfRectangle(collisionRect, collisionRect.left, collisionRect.top);
  const collisions = [];
  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);
    if (rect) {
      const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);
      collisions.push({
        id,
        data: {
          droppableContainer,
          value: distBetween
        }
      });
    }
  }
  return collisions.sort(sortCollisionsAsc);
};
var closestCorners = (_ref) => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const corners = cornersOfRectangle(collisionRect);
  const collisions = [];
  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);
    if (rect) {
      const rectCorners = cornersOfRectangle(rect);
      const distances = corners.reduce((accumulator, corner, index) => {
        return accumulator + distanceBetween(rectCorners[index], corner);
      }, 0);
      const effectiveDistance = Number((distances / 4).toFixed(4));
      collisions.push({
        id,
        data: {
          droppableContainer,
          value: effectiveDistance
        }
      });
    }
  }
  return collisions.sort(sortCollisionsAsc);
};
function getIntersectionRatio(entry, target) {
  const top = Math.max(target.top, entry.top);
  const left = Math.max(target.left, entry.left);
  const right = Math.min(target.left + target.width, entry.left + entry.width);
  const bottom = Math.min(target.top + target.height, entry.top + entry.height);
  const width = right - left;
  const height = bottom - top;
  if (left < right && top < bottom) {
    const targetArea = target.width * target.height;
    const entryArea = entry.width * entry.height;
    const intersectionArea = width * height;
    const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
    return Number(intersectionRatio.toFixed(4));
  }
  return 0;
}
var rectIntersection = (_ref) => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const collisions = [];
  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);
    if (rect) {
      const intersectionRatio = getIntersectionRatio(rect, collisionRect);
      if (intersectionRatio > 0) {
        collisions.push({
          id,
          data: {
            droppableContainer,
            value: intersectionRatio
          }
        });
      }
    }
  }
  return collisions.sort(sortCollisionsDesc);
};
function adjustScale(transform, rect1, rect2) {
  return {
    ...transform,
    scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
    scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
  };
}
function getRectDelta(rect1, rect2) {
  return rect1 && rect2 ? {
    x: rect1.left - rect2.left,
    y: rect1.top - rect2.top
  } : defaultCoordinates;
}
function createRectAdjustmentFn(modifier) {
  return function adjustClientRect(rect) {
    for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      adjustments[_key - 1] = arguments[_key];
    }
    return adjustments.reduce((acc, adjustment) => ({
      ...acc,
      top: acc.top + modifier * adjustment.y,
      bottom: acc.bottom + modifier * adjustment.y,
      left: acc.left + modifier * adjustment.x,
      right: acc.right + modifier * adjustment.x
    }), {
      ...rect
    });
  };
}
var getAdjustedRect = /* @__PURE__ */ createRectAdjustmentFn(1);
function parseTransform(transform) {
  if (transform.startsWith("matrix3d(")) {
    const transformArray = transform.slice(9, -1).split(/, /);
    return {
      x: +transformArray[12],
      y: +transformArray[13],
      scaleX: +transformArray[0],
      scaleY: +transformArray[5]
    };
  } else if (transform.startsWith("matrix(")) {
    const transformArray = transform.slice(7, -1).split(/, /);
    return {
      x: +transformArray[4],
      y: +transformArray[5],
      scaleX: +transformArray[0],
      scaleY: +transformArray[3]
    };
  }
  return null;
}
function inverseTransform(rect, transform, transformOrigin) {
  const parsedTransform = parseTransform(transform);
  if (!parsedTransform) {
    return rect;
  }
  const {
    scaleX,
    scaleY,
    x: translateX,
    y: translateY
  } = parsedTransform;
  const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
  const y = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(" ") + 1));
  const w = scaleX ? rect.width / scaleX : rect.width;
  const h = scaleY ? rect.height / scaleY : rect.height;
  return {
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x
  };
}
var defaultOptions = {
  ignoreTransform: false
};
function getClientRect(element, options) {
  if (options === void 0) {
    options = defaultOptions;
  }
  let rect = element.getBoundingClientRect();
  if (options.ignoreTransform) {
    const {
      transform,
      transformOrigin
    } = getWindow(element).getComputedStyle(element);
    if (transform) {
      rect = inverseTransform(rect, transform, transformOrigin);
    }
  }
  const {
    top,
    left,
    width,
    height,
    bottom,
    right
  } = rect;
  return {
    top,
    left,
    width,
    height,
    bottom,
    right
  };
}
function getTransformAgnosticClientRect(element) {
  return getClientRect(element, {
    ignoreTransform: true
  });
}
function getWindowClientRect(element) {
  const width = element.innerWidth;
  const height = element.innerHeight;
  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height
  };
}
function isFixed(node, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = getWindow(node).getComputedStyle(node);
  }
  return computedStyle.position === "fixed";
}
function isScrollable(element, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = getWindow(element).getComputedStyle(element);
  }
  const overflowRegex = /(auto|scroll|overlay)/;
  const properties2 = ["overflow", "overflowX", "overflowY"];
  return properties2.some((property) => {
    const value = computedStyle[property];
    return typeof value === "string" ? overflowRegex.test(value) : false;
  });
}
function getScrollableAncestors(element, limit) {
  const scrollParents = [];
  function findScrollableAncestors(node) {
    if (limit != null && scrollParents.length >= limit) {
      return scrollParents;
    }
    if (!node) {
      return scrollParents;
    }
    if (isDocument(node) && node.scrollingElement != null && !scrollParents.includes(node.scrollingElement)) {
      scrollParents.push(node.scrollingElement);
      return scrollParents;
    }
    if (!isHTMLElement(node) || isSVGElement(node)) {
      return scrollParents;
    }
    if (scrollParents.includes(node)) {
      return scrollParents;
    }
    const computedStyle = getWindow(element).getComputedStyle(node);
    if (node !== element) {
      if (isScrollable(node, computedStyle)) {
        scrollParents.push(node);
      }
    }
    if (isFixed(node, computedStyle)) {
      return scrollParents;
    }
    return findScrollableAncestors(node.parentNode);
  }
  if (!element) {
    return scrollParents;
  }
  return findScrollableAncestors(element);
}
function getFirstScrollableAncestor(node) {
  const [firstScrollableAncestor] = getScrollableAncestors(node, 1);
  return firstScrollableAncestor != null ? firstScrollableAncestor : null;
}
function getScrollableElement(element) {
  if (!canUseDOM || !element) {
    return null;
  }
  if (isWindow(element)) {
    return element;
  }
  if (!isNode(element)) {
    return null;
  }
  if (isDocument(element) || element === getOwnerDocument(element).scrollingElement) {
    return window;
  }
  if (isHTMLElement(element)) {
    return element;
  }
  return null;
}
function getScrollXCoordinate(element) {
  if (isWindow(element)) {
    return element.scrollX;
  }
  return element.scrollLeft;
}
function getScrollYCoordinate(element) {
  if (isWindow(element)) {
    return element.scrollY;
  }
  return element.scrollTop;
}
function getScrollCoordinates(element) {
  return {
    x: getScrollXCoordinate(element),
    y: getScrollYCoordinate(element)
  };
}
var Direction;
(function(Direction2) {
  Direction2[Direction2["Forward"] = 1] = "Forward";
  Direction2[Direction2["Backward"] = -1] = "Backward";
})(Direction || (Direction = {}));
function isDocumentScrollingElement(element) {
  if (!canUseDOM || !element) {
    return false;
  }
  return element === document.scrollingElement;
}
function getScrollPosition(scrollingContainer) {
  const minScroll = {
    x: 0,
    y: 0
  };
  const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
    height: window.innerHeight,
    width: window.innerWidth
  } : {
    height: scrollingContainer.clientHeight,
    width: scrollingContainer.clientWidth
  };
  const maxScroll = {
    x: scrollingContainer.scrollWidth - dimensions.width,
    y: scrollingContainer.scrollHeight - dimensions.height
  };
  const isTop = scrollingContainer.scrollTop <= minScroll.y;
  const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
  const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
  const isRight = scrollingContainer.scrollLeft >= maxScroll.x;
  return {
    isTop,
    isLeft,
    isBottom,
    isRight,
    maxScroll,
    minScroll
  };
}
var defaultThreshold = {
  x: 0.2,
  y: 0.2
};
function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref, acceleration, thresholdPercentage) {
  let {
    top,
    left,
    right,
    bottom
  } = _ref;
  if (acceleration === void 0) {
    acceleration = 10;
  }
  if (thresholdPercentage === void 0) {
    thresholdPercentage = defaultThreshold;
  }
  const {
    isTop,
    isBottom,
    isLeft,
    isRight
  } = getScrollPosition(scrollContainer);
  const direction = {
    x: 0,
    y: 0
  };
  const speed = {
    x: 0,
    y: 0
  };
  const threshold = {
    height: scrollContainerRect.height * thresholdPercentage.y,
    width: scrollContainerRect.width * thresholdPercentage.x
  };
  if (!isTop && top <= scrollContainerRect.top + threshold.height) {
    direction.y = Direction.Backward;
    speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
  } else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
    direction.y = Direction.Forward;
    speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
  }
  if (!isRight && right >= scrollContainerRect.right - threshold.width) {
    direction.x = Direction.Forward;
    speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
  } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
    direction.x = Direction.Backward;
    speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
  }
  return {
    direction,
    speed
  };
}
function getScrollElementRect(element) {
  if (element === document.scrollingElement) {
    const {
      innerWidth,
      innerHeight
    } = window;
    return {
      top: 0,
      left: 0,
      right: innerWidth,
      bottom: innerHeight,
      width: innerWidth,
      height: innerHeight
    };
  }
  const {
    top,
    left,
    right,
    bottom
  } = element.getBoundingClientRect();
  return {
    top,
    left,
    right,
    bottom,
    width: element.clientWidth,
    height: element.clientHeight
  };
}
function getScrollOffsets(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return add(acc, getScrollCoordinates(node));
  }, defaultCoordinates);
}
function getScrollXOffset(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return acc + getScrollXCoordinate(node);
  }, 0);
}
function getScrollYOffset(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return acc + getScrollYCoordinate(node);
  }, 0);
}
function scrollIntoViewIfNeeded(element, measure) {
  if (measure === void 0) {
    measure = getClientRect;
  }
  if (!element) {
    return;
  }
  const {
    top,
    left,
    bottom,
    right
  } = measure(element);
  const firstScrollableAncestor = getFirstScrollableAncestor(element);
  if (!firstScrollableAncestor) {
    return;
  }
  if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) {
    element.scrollIntoView({
      block: "center",
      inline: "center"
    });
  }
}
var properties = [["x", ["left", "right"], getScrollXOffset], ["y", ["top", "bottom"], getScrollYOffset]];
var Rect = class {
  constructor(rect, element) {
    this.rect = void 0;
    this.width = void 0;
    this.height = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.right = void 0;
    this.left = void 0;
    const scrollableAncestors = getScrollableAncestors(element);
    const scrollOffsets = getScrollOffsets(scrollableAncestors);
    this.rect = {
      ...rect
    };
    this.width = rect.width;
    this.height = rect.height;
    for (const [axis, keys, getScrollOffset] of properties) {
      for (const key2 of keys) {
        Object.defineProperty(this, key2, {
          get: () => {
            const currentOffsets = getScrollOffset(scrollableAncestors);
            const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
            return this.rect[key2] + scrollOffsetsDeltla;
          },
          enumerable: true
        });
      }
    }
    Object.defineProperty(this, "rect", {
      enumerable: false
    });
  }
};
var Listeners = class {
  constructor(target) {
    this.target = void 0;
    this.listeners = [];
    this.removeAll = () => {
      this.listeners.forEach((listener) => {
        var _this$target;
        return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
      });
    };
    this.target = target;
  }
  add(eventName, handler, options) {
    var _this$target2;
    (_this$target2 = this.target) == null ? void 0 : _this$target2.addEventListener(eventName, handler, options);
    this.listeners.push([eventName, handler, options]);
  }
};
function getEventListenerTarget(target) {
  const {
    EventTarget
  } = getWindow(target);
  return target instanceof EventTarget ? target : getOwnerDocument(target);
}
function hasExceededDistance(delta, measurement) {
  const dx = Math.abs(delta.x);
  const dy = Math.abs(delta.y);
  if (typeof measurement === "number") {
    return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
  }
  if ("x" in measurement && "y" in measurement) {
    return dx > measurement.x && dy > measurement.y;
  }
  if ("x" in measurement) {
    return dx > measurement.x;
  }
  if ("y" in measurement) {
    return dy > measurement.y;
  }
  return false;
}
var EventName;
(function(EventName2) {
  EventName2["Click"] = "click";
  EventName2["DragStart"] = "dragstart";
  EventName2["Keydown"] = "keydown";
  EventName2["ContextMenu"] = "contextmenu";
  EventName2["Resize"] = "resize";
  EventName2["SelectionChange"] = "selectionchange";
  EventName2["VisibilityChange"] = "visibilitychange";
})(EventName || (EventName = {}));
function preventDefault(event) {
  event.preventDefault();
}
function stopPropagation(event) {
  event.stopPropagation();
}
var KeyboardCode;
(function(KeyboardCode2) {
  KeyboardCode2["Space"] = "Space";
  KeyboardCode2["Down"] = "ArrowDown";
  KeyboardCode2["Right"] = "ArrowRight";
  KeyboardCode2["Left"] = "ArrowLeft";
  KeyboardCode2["Up"] = "ArrowUp";
  KeyboardCode2["Esc"] = "Escape";
  KeyboardCode2["Enter"] = "Enter";
  KeyboardCode2["Tab"] = "Tab";
})(KeyboardCode || (KeyboardCode = {}));
var defaultKeyboardCodes = {
  start: [KeyboardCode.Space, KeyboardCode.Enter],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab]
};
var defaultKeyboardCoordinateGetter = (event, _ref) => {
  let {
    currentCoordinates
  } = _ref;
  switch (event.code) {
    case KeyboardCode.Right:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x + 25
      };
    case KeyboardCode.Left:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x - 25
      };
    case KeyboardCode.Down:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y + 25
      };
    case KeyboardCode.Up:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y - 25
      };
  }
  return void 0;
};
var KeyboardSensor = class {
  constructor(props) {
    this.props = void 0;
    this.autoScrollEnabled = false;
    this.referenceCoordinates = void 0;
    this.listeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    const {
      event: {
        target
      }
    } = props;
    this.props = props;
    this.listeners = new Listeners(getOwnerDocument(target));
    this.windowListeners = new Listeners(getWindow(target));
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.attach();
  }
  attach() {
    this.handleStart();
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
  }
  handleStart() {
    const {
      activeNode,
      onStart
    } = this.props;
    const node = activeNode.node.current;
    if (node) {
      scrollIntoViewIfNeeded(node);
    }
    onStart(defaultCoordinates);
  }
  handleKeyDown(event) {
    if (isKeyboardEvent(event)) {
      const {
        active,
        context,
        options
      } = this.props;
      const {
        keyboardCodes = defaultKeyboardCodes,
        coordinateGetter = defaultKeyboardCoordinateGetter,
        scrollBehavior = "smooth"
      } = options;
      const {
        code
      } = event;
      if (keyboardCodes.end.includes(code)) {
        this.handleEnd(event);
        return;
      }
      if (keyboardCodes.cancel.includes(code)) {
        this.handleCancel(event);
        return;
      }
      const {
        collisionRect
      } = context.current;
      const currentCoordinates = collisionRect ? {
        x: collisionRect.left,
        y: collisionRect.top
      } : defaultCoordinates;
      if (!this.referenceCoordinates) {
        this.referenceCoordinates = currentCoordinates;
      }
      const newCoordinates = coordinateGetter(event, {
        active,
        context: context.current,
        currentCoordinates
      });
      if (newCoordinates) {
        const coordinatesDelta = subtract(newCoordinates, currentCoordinates);
        const scrollDelta = {
          x: 0,
          y: 0
        };
        const {
          scrollableAncestors
        } = context.current;
        for (const scrollContainer of scrollableAncestors) {
          const direction = event.code;
          const {
            isTop,
            isRight,
            isLeft,
            isBottom,
            maxScroll,
            minScroll
          } = getScrollPosition(scrollContainer);
          const scrollElementRect = getScrollElementRect(scrollContainer);
          const clampedCoordinates = {
            x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
            y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
          };
          const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
          const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;
          if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
            const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
            const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;
            if (canScrollToNewCoordinates && !coordinatesDelta.y) {
              scrollContainer.scrollTo({
                left: newScrollCoordinates,
                behavior: scrollBehavior
              });
              return;
            }
            if (canScrollToNewCoordinates) {
              scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
            } else {
              scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
            }
            if (scrollDelta.x) {
              scrollContainer.scrollBy({
                left: -scrollDelta.x,
                behavior: scrollBehavior
              });
            }
            break;
          } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
            const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
            const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;
            if (canScrollToNewCoordinates && !coordinatesDelta.x) {
              scrollContainer.scrollTo({
                top: newScrollCoordinates,
                behavior: scrollBehavior
              });
              return;
            }
            if (canScrollToNewCoordinates) {
              scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
            } else {
              scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
            }
            if (scrollDelta.y) {
              scrollContainer.scrollBy({
                top: -scrollDelta.y,
                behavior: scrollBehavior
              });
            }
            break;
          }
        }
        this.handleMove(event, add(subtract(newCoordinates, this.referenceCoordinates), scrollDelta));
      }
    }
  }
  handleMove(event, coordinates) {
    const {
      onMove
    } = this.props;
    event.preventDefault();
    onMove(coordinates);
  }
  handleEnd(event) {
    const {
      onEnd
    } = this.props;
    event.preventDefault();
    this.detach();
    onEnd();
  }
  handleCancel(event) {
    const {
      onCancel
    } = this.props;
    event.preventDefault();
    this.detach();
    onCancel();
  }
  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
  }
};
KeyboardSensor.activators = [{
  eventName: "onKeyDown",
  handler: (event, _ref, _ref2) => {
    let {
      keyboardCodes = defaultKeyboardCodes,
      onActivation
    } = _ref;
    let {
      active
    } = _ref2;
    const {
      code
    } = event.nativeEvent;
    if (keyboardCodes.start.includes(code)) {
      const activator = active.activatorNode.current;
      if (activator && event.target !== activator) {
        return false;
      }
      event.preventDefault();
      onActivation == null ? void 0 : onActivation({
        event: event.nativeEvent
      });
      return true;
    }
    return false;
  }
}];
function isDistanceConstraint(constraint) {
  return Boolean(constraint && "distance" in constraint);
}
function isDelayConstraint(constraint) {
  return Boolean(constraint && "delay" in constraint);
}
var AbstractPointerSensor = class {
  constructor(props, events2, listenerTarget) {
    var _getEventCoordinates;
    if (listenerTarget === void 0) {
      listenerTarget = getEventListenerTarget(props.event.target);
    }
    this.props = void 0;
    this.events = void 0;
    this.autoScrollEnabled = true;
    this.document = void 0;
    this.activated = false;
    this.initialCoordinates = void 0;
    this.timeoutId = null;
    this.listeners = void 0;
    this.documentListeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    this.events = events2;
    const {
      event
    } = props;
    const {
      target
    } = event;
    this.props = props;
    this.events = events2;
    this.document = getOwnerDocument(target);
    this.documentListeners = new Listeners(this.document);
    this.listeners = new Listeners(listenerTarget);
    this.windowListeners = new Listeners(getWindow(target));
    this.initialCoordinates = (_getEventCoordinates = getEventCoordinates(event)) != null ? _getEventCoordinates : defaultCoordinates;
    this.handleStart = this.handleStart.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.removeTextSelection = this.removeTextSelection.bind(this);
    this.attach();
  }
  attach() {
    const {
      events: events2,
      props: {
        options: {
          activationConstraint,
          bypassActivationConstraint
        }
      }
    } = this;
    this.listeners.add(events2.move.name, this.handleMove, {
      passive: false
    });
    this.listeners.add(events2.end.name, this.handleEnd);
    if (events2.cancel) {
      this.listeners.add(events2.cancel.name, this.handleCancel);
    }
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.DragStart, preventDefault);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    this.windowListeners.add(EventName.ContextMenu, preventDefault);
    this.documentListeners.add(EventName.Keydown, this.handleKeydown);
    if (activationConstraint) {
      if (bypassActivationConstraint != null && bypassActivationConstraint({
        event: this.props.event,
        activeNode: this.props.activeNode,
        options: this.props.options
      })) {
        return this.handleStart();
      }
      if (isDelayConstraint(activationConstraint)) {
        this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
        this.handlePending(activationConstraint);
        return;
      }
      if (isDistanceConstraint(activationConstraint)) {
        this.handlePending(activationConstraint);
        return;
      }
    }
    this.handleStart();
  }
  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
    setTimeout(this.documentListeners.removeAll, 50);
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
  handlePending(constraint, offset) {
    const {
      active,
      onPending
    } = this.props;
    onPending(active, constraint, this.initialCoordinates, offset);
  }
  handleStart() {
    const {
      initialCoordinates
    } = this;
    const {
      onStart
    } = this.props;
    if (initialCoordinates) {
      this.activated = true;
      this.documentListeners.add(EventName.Click, stopPropagation, {
        capture: true
      });
      this.removeTextSelection();
      this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
      onStart(initialCoordinates);
    }
  }
  handleMove(event) {
    var _getEventCoordinates2;
    const {
      activated,
      initialCoordinates,
      props
    } = this;
    const {
      onMove,
      options: {
        activationConstraint
      }
    } = props;
    if (!initialCoordinates) {
      return;
    }
    const coordinates = (_getEventCoordinates2 = getEventCoordinates(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
    const delta = subtract(initialCoordinates, coordinates);
    if (!activated && activationConstraint) {
      if (isDistanceConstraint(activationConstraint)) {
        if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }
        if (hasExceededDistance(delta, activationConstraint.distance)) {
          return this.handleStart();
        }
      }
      if (isDelayConstraint(activationConstraint)) {
        if (hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }
      }
      this.handlePending(activationConstraint, delta);
      return;
    }
    if (event.cancelable) {
      event.preventDefault();
    }
    onMove(coordinates);
  }
  handleEnd() {
    const {
      onAbort,
      onEnd
    } = this.props;
    this.detach();
    if (!this.activated) {
      onAbort(this.props.active);
    }
    onEnd();
  }
  handleCancel() {
    const {
      onAbort,
      onCancel
    } = this.props;
    this.detach();
    if (!this.activated) {
      onAbort(this.props.active);
    }
    onCancel();
  }
  handleKeydown(event) {
    if (event.code === KeyboardCode.Esc) {
      this.handleCancel();
    }
  }
  removeTextSelection() {
    var _this$document$getSel;
    (_this$document$getSel = this.document.getSelection()) == null ? void 0 : _this$document$getSel.removeAllRanges();
  }
};
var events = {
  cancel: {
    name: "pointercancel"
  },
  move: {
    name: "pointermove"
  },
  end: {
    name: "pointerup"
  }
};
var PointerSensor = class extends AbstractPointerSensor {
  constructor(props) {
    const {
      event
    } = props;
    const listenerTarget = getOwnerDocument(event.target);
    super(props, events, listenerTarget);
  }
};
PointerSensor.activators = [{
  eventName: "onPointerDown",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    if (!event.isPrimary || event.button !== 0) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
var events$1 = {
  move: {
    name: "mousemove"
  },
  end: {
    name: "mouseup"
  }
};
var MouseButton;
(function(MouseButton2) {
  MouseButton2[MouseButton2["RightClick"] = 2] = "RightClick";
})(MouseButton || (MouseButton = {}));
var MouseSensor = class extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$1, getOwnerDocument(props.event.target));
  }
};
MouseSensor.activators = [{
  eventName: "onMouseDown",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    if (event.button === MouseButton.RightClick) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
var events$2 = {
  cancel: {
    name: "touchcancel"
  },
  move: {
    name: "touchmove"
  },
  end: {
    name: "touchend"
  }
};
var TouchSensor = class extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$2);
  }
  static setup() {
    window.addEventListener(events$2.move.name, noop2, {
      capture: false,
      passive: false
    });
    return function teardown() {
      window.removeEventListener(events$2.move.name, noop2);
    };
    function noop2() {
    }
  }
};
TouchSensor.activators = [{
  eventName: "onTouchStart",
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    const {
      touches
    } = event;
    if (touches.length > 1) {
      return false;
    }
    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];
var AutoScrollActivator;
(function(AutoScrollActivator2) {
  AutoScrollActivator2[AutoScrollActivator2["Pointer"] = 0] = "Pointer";
  AutoScrollActivator2[AutoScrollActivator2["DraggableRect"] = 1] = "DraggableRect";
})(AutoScrollActivator || (AutoScrollActivator = {}));
var TraversalOrder;
(function(TraversalOrder2) {
  TraversalOrder2[TraversalOrder2["TreeOrder"] = 0] = "TreeOrder";
  TraversalOrder2[TraversalOrder2["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
})(TraversalOrder || (TraversalOrder = {}));
function useAutoScroller(_ref) {
  let {
    acceleration,
    activator = AutoScrollActivator.Pointer,
    canScroll,
    draggingRect,
    enabled,
    interval = 5,
    order = TraversalOrder.TreeOrder,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects,
    delta,
    threshold
  } = _ref;
  const scrollIntent = useScrollIntent({
    delta,
    disabled: !enabled
  });
  const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
  const scrollSpeed = (0, import_react3.useRef)({
    x: 0,
    y: 0
  });
  const scrollDirection = (0, import_react3.useRef)({
    x: 0,
    y: 0
  });
  const rect = (0, import_react3.useMemo)(() => {
    switch (activator) {
      case AutoScrollActivator.Pointer:
        return pointerCoordinates ? {
          top: pointerCoordinates.y,
          bottom: pointerCoordinates.y,
          left: pointerCoordinates.x,
          right: pointerCoordinates.x
        } : null;
      case AutoScrollActivator.DraggableRect:
        return draggingRect;
    }
  }, [activator, draggingRect, pointerCoordinates]);
  const scrollContainerRef = (0, import_react3.useRef)(null);
  const autoScroll = (0, import_react3.useCallback)(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }
    const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
    const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
    scrollContainer.scrollBy(scrollLeft, scrollTop);
  }, []);
  const sortedScrollableAncestors = (0, import_react3.useMemo)(() => order === TraversalOrder.TreeOrder ? [...scrollableAncestors].reverse() : scrollableAncestors, [order, scrollableAncestors]);
  (0, import_react3.useEffect)(
    () => {
      if (!enabled || !scrollableAncestors.length || !rect) {
        clearAutoScrollInterval();
        return;
      }
      for (const scrollContainer of sortedScrollableAncestors) {
        if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) {
          continue;
        }
        const index = scrollableAncestors.indexOf(scrollContainer);
        const scrollContainerRect = scrollableAncestorRects[index];
        if (!scrollContainerRect) {
          continue;
        }
        const {
          direction,
          speed
        } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);
        for (const axis of ["x", "y"]) {
          if (!scrollIntent[axis][direction[axis]]) {
            speed[axis] = 0;
            direction[axis] = 0;
          }
        }
        if (speed.x > 0 || speed.y > 0) {
          clearAutoScrollInterval();
          scrollContainerRef.current = scrollContainer;
          setAutoScrollInterval(autoScroll, interval);
          scrollSpeed.current = speed;
          scrollDirection.current = direction;
          return;
        }
      }
      scrollSpeed.current = {
        x: 0,
        y: 0
      };
      scrollDirection.current = {
        x: 0,
        y: 0
      };
      clearAutoScrollInterval();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      acceleration,
      autoScroll,
      canScroll,
      clearAutoScrollInterval,
      enabled,
      interval,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(rect),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(scrollIntent),
      setAutoScrollInterval,
      scrollableAncestors,
      sortedScrollableAncestors,
      scrollableAncestorRects,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(threshold)
    ]
  );
}
var defaultScrollIntent = {
  x: {
    [Direction.Backward]: false,
    [Direction.Forward]: false
  },
  y: {
    [Direction.Backward]: false,
    [Direction.Forward]: false
  }
};
function useScrollIntent(_ref2) {
  let {
    delta,
    disabled
  } = _ref2;
  const previousDelta = usePrevious(delta);
  return useLazyMemo((previousIntent) => {
    if (disabled || !previousDelta || !previousIntent) {
      return defaultScrollIntent;
    }
    const direction = {
      x: Math.sign(delta.x - previousDelta.x),
      y: Math.sign(delta.y - previousDelta.y)
    };
    return {
      x: {
        [Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
        [Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
      },
      y: {
        [Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
        [Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
      }
    };
  }, [disabled, delta, previousDelta]);
}
function useCachedNode(draggableNodes, id) {
  const draggableNode = id != null ? draggableNodes.get(id) : void 0;
  const node = draggableNode ? draggableNode.node.current : null;
  return useLazyMemo((cachedNode) => {
    var _ref;
    if (id == null) {
      return null;
    }
    return (_ref = node != null ? node : cachedNode) != null ? _ref : null;
  }, [node, id]);
}
function useCombineActivators(sensors, getSyntheticHandler) {
  return (0, import_react3.useMemo)(() => sensors.reduce((accumulator, sensor) => {
    const {
      sensor: Sensor
    } = sensor;
    const sensorActivators = Sensor.activators.map((activator) => ({
      eventName: activator.eventName,
      handler: getSyntheticHandler(activator.handler, sensor)
    }));
    return [...accumulator, ...sensorActivators];
  }, []), [sensors, getSyntheticHandler]);
}
var MeasuringStrategy;
(function(MeasuringStrategy2) {
  MeasuringStrategy2[MeasuringStrategy2["Always"] = 0] = "Always";
  MeasuringStrategy2[MeasuringStrategy2["BeforeDragging"] = 1] = "BeforeDragging";
  MeasuringStrategy2[MeasuringStrategy2["WhileDragging"] = 2] = "WhileDragging";
})(MeasuringStrategy || (MeasuringStrategy = {}));
var MeasuringFrequency;
(function(MeasuringFrequency2) {
  MeasuringFrequency2["Optimized"] = "optimized";
})(MeasuringFrequency || (MeasuringFrequency = {}));
var defaultValue = /* @__PURE__ */ new Map();
function useDroppableMeasuring(containers, _ref) {
  let {
    dragging,
    dependencies,
    config
  } = _ref;
  const [queue, setQueue] = (0, import_react3.useState)(null);
  const {
    frequency,
    measure,
    strategy
  } = config;
  const containersRef = (0, import_react3.useRef)(containers);
  const disabled = isDisabled();
  const disabledRef = useLatestValue(disabled);
  const measureDroppableContainers = (0, import_react3.useCallback)(function(ids2) {
    if (ids2 === void 0) {
      ids2 = [];
    }
    if (disabledRef.current) {
      return;
    }
    setQueue((value) => {
      if (value === null) {
        return ids2;
      }
      return value.concat(ids2.filter((id) => !value.includes(id)));
    });
  }, [disabledRef]);
  const timeoutId = (0, import_react3.useRef)(null);
  const droppableRects = useLazyMemo((previousValue) => {
    if (disabled && !dragging) {
      return defaultValue;
    }
    if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
      const map = /* @__PURE__ */ new Map();
      for (let container of containers) {
        if (!container) {
          continue;
        }
        if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
          map.set(container.id, container.rect.current);
          continue;
        }
        const node = container.node.current;
        const rect = node ? new Rect(measure(node), node) : null;
        container.rect.current = rect;
        if (rect) {
          map.set(container.id, rect);
        }
      }
      return map;
    }
    return previousValue;
  }, [containers, queue, dragging, disabled, measure]);
  (0, import_react3.useEffect)(() => {
    containersRef.current = containers;
  }, [containers]);
  (0, import_react3.useEffect)(
    () => {
      if (disabled) {
        return;
      }
      measureDroppableContainers();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragging, disabled]
  );
  (0, import_react3.useEffect)(
    () => {
      if (queue && queue.length > 0) {
        setQueue(null);
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(queue)]
  );
  (0, import_react3.useEffect)(
    () => {
      if (disabled || typeof frequency !== "number" || timeoutId.current !== null) {
        return;
      }
      timeoutId.current = setTimeout(() => {
        measureDroppableContainers();
        timeoutId.current = null;
      }, frequency);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frequency, disabled, measureDroppableContainers, ...dependencies]
  );
  return {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled: queue != null
  };
  function isDisabled() {
    switch (strategy) {
      case MeasuringStrategy.Always:
        return false;
      case MeasuringStrategy.BeforeDragging:
        return dragging;
      default:
        return !dragging;
    }
  }
}
function useInitialValue(value, computeFn) {
  return useLazyMemo((previousValue) => {
    if (!value) {
      return null;
    }
    if (previousValue) {
      return previousValue;
    }
    return typeof computeFn === "function" ? computeFn(value) : value;
  }, [computeFn, value]);
}
function useInitialRect(node, measure) {
  return useInitialValue(node, measure);
}
function useMutationObserver(_ref) {
  let {
    callback,
    disabled
  } = _ref;
  const handleMutations = useEvent(callback);
  const mutationObserver = (0, import_react3.useMemo)(() => {
    if (disabled || typeof window === "undefined" || typeof window.MutationObserver === "undefined") {
      return void 0;
    }
    const {
      MutationObserver: MutationObserver2
    } = window;
    return new MutationObserver2(handleMutations);
  }, [handleMutations, disabled]);
  (0, import_react3.useEffect)(() => {
    return () => mutationObserver == null ? void 0 : mutationObserver.disconnect();
  }, [mutationObserver]);
  return mutationObserver;
}
function useResizeObserver(_ref) {
  let {
    callback,
    disabled
  } = _ref;
  const handleResize = useEvent(callback);
  const resizeObserver = (0, import_react3.useMemo)(
    () => {
      if (disabled || typeof window === "undefined" || typeof window.ResizeObserver === "undefined") {
        return void 0;
      }
      const {
        ResizeObserver
      } = window;
      return new ResizeObserver(handleResize);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled]
  );
  (0, import_react3.useEffect)(() => {
    return () => resizeObserver == null ? void 0 : resizeObserver.disconnect();
  }, [resizeObserver]);
  return resizeObserver;
}
function defaultMeasure(element) {
  return new Rect(getClientRect(element), element);
}
function useRect(element, measure, fallbackRect) {
  if (measure === void 0) {
    measure = defaultMeasure;
  }
  const [rect, setRect] = (0, import_react3.useState)(null);
  function measureRect() {
    setRect((currentRect) => {
      if (!element) {
        return null;
      }
      if (element.isConnected === false) {
        var _ref;
        return (_ref = currentRect != null ? currentRect : fallbackRect) != null ? _ref : null;
      }
      const newRect = measure(element);
      if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
        return currentRect;
      }
      return newRect;
    });
  }
  const mutationObserver = useMutationObserver({
    callback(records) {
      if (!element) {
        return;
      }
      for (const record of records) {
        const {
          type,
          target
        } = record;
        if (type === "childList" && target instanceof HTMLElement && target.contains(element)) {
          measureRect();
          break;
        }
      }
    }
  });
  const resizeObserver = useResizeObserver({
    callback: measureRect
  });
  useIsomorphicLayoutEffect(() => {
    measureRect();
    if (element) {
      resizeObserver == null ? void 0 : resizeObserver.observe(element);
      mutationObserver == null ? void 0 : mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      resizeObserver == null ? void 0 : resizeObserver.disconnect();
      mutationObserver == null ? void 0 : mutationObserver.disconnect();
    }
  }, [element]);
  return rect;
}
function useRectDelta(rect) {
  const initialRect = useInitialValue(rect);
  return getRectDelta(rect, initialRect);
}
var defaultValue$1 = [];
function useScrollableAncestors(node) {
  const previousNode = (0, import_react3.useRef)(node);
  const ancestors = useLazyMemo((previousValue) => {
    if (!node) {
      return defaultValue$1;
    }
    if (previousValue && previousValue !== defaultValue$1 && node && previousNode.current && node.parentNode === previousNode.current.parentNode) {
      return previousValue;
    }
    return getScrollableAncestors(node);
  }, [node]);
  (0, import_react3.useEffect)(() => {
    previousNode.current = node;
  }, [node]);
  return ancestors;
}
function useScrollOffsets(elements) {
  const [scrollCoordinates, setScrollCoordinates] = (0, import_react3.useState)(null);
  const prevElements = (0, import_react3.useRef)(elements);
  const handleScroll2 = (0, import_react3.useCallback)((event) => {
    const scrollingElement = getScrollableElement(event.target);
    if (!scrollingElement) {
      return;
    }
    setScrollCoordinates((scrollCoordinates2) => {
      if (!scrollCoordinates2) {
        return null;
      }
      scrollCoordinates2.set(scrollingElement, getScrollCoordinates(scrollingElement));
      return new Map(scrollCoordinates2);
    });
  }, []);
  (0, import_react3.useEffect)(() => {
    const previousElements = prevElements.current;
    if (elements !== previousElements) {
      cleanup(previousElements);
      const entries = elements.map((element) => {
        const scrollableElement = getScrollableElement(element);
        if (scrollableElement) {
          scrollableElement.addEventListener("scroll", handleScroll2, {
            passive: true
          });
          return [scrollableElement, getScrollCoordinates(scrollableElement)];
        }
        return null;
      }).filter((entry) => entry != null);
      setScrollCoordinates(entries.length ? new Map(entries) : null);
      prevElements.current = elements;
    }
    return () => {
      cleanup(elements);
      cleanup(previousElements);
    };
    function cleanup(elements2) {
      elements2.forEach((element) => {
        const scrollableElement = getScrollableElement(element);
        scrollableElement == null ? void 0 : scrollableElement.removeEventListener("scroll", handleScroll2);
      });
    }
  }, [handleScroll2, elements]);
  return (0, import_react3.useMemo)(() => {
    if (elements.length) {
      return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates) => add(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
    }
    return defaultCoordinates;
  }, [elements, scrollCoordinates]);
}
function useScrollOffsetsDelta(scrollOffsets, dependencies) {
  if (dependencies === void 0) {
    dependencies = [];
  }
  const initialScrollOffsets = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(
    () => {
      initialScrollOffsets.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  );
  (0, import_react3.useEffect)(() => {
    const hasScrollOffsets = scrollOffsets !== defaultCoordinates;
    if (hasScrollOffsets && !initialScrollOffsets.current) {
      initialScrollOffsets.current = scrollOffsets;
    }
    if (!hasScrollOffsets && initialScrollOffsets.current) {
      initialScrollOffsets.current = null;
    }
  }, [scrollOffsets]);
  return initialScrollOffsets.current ? subtract(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
}
function useSensorSetup(sensors) {
  (0, import_react3.useEffect)(
    () => {
      if (!canUseDOM) {
        return;
      }
      const teardownFns = sensors.map((_ref) => {
        let {
          sensor
        } = _ref;
        return sensor.setup == null ? void 0 : sensor.setup();
      });
      return () => {
        for (const teardown of teardownFns) {
          teardown == null ? void 0 : teardown();
        }
      };
    },
    // TO-DO: Sensors length could theoretically change which would not be a valid dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    sensors.map((_ref2) => {
      let {
        sensor
      } = _ref2;
      return sensor;
    })
  );
}
function useSyntheticListeners(listeners, id) {
  return (0, import_react3.useMemo)(() => {
    return listeners.reduce((acc, _ref) => {
      let {
        eventName,
        handler
      } = _ref;
      acc[eventName] = (event) => {
        handler(event, id);
      };
      return acc;
    }, {});
  }, [listeners, id]);
}
function useWindowRect(element) {
  return (0, import_react3.useMemo)(() => element ? getWindowClientRect(element) : null, [element]);
}
var defaultValue$2 = [];
function useRects(elements, measure) {
  if (measure === void 0) {
    measure = getClientRect;
  }
  const [firstElement] = elements;
  const windowRect = useWindowRect(firstElement ? getWindow(firstElement) : null);
  const [rects, setRects] = (0, import_react3.useState)(defaultValue$2);
  function measureRects() {
    setRects(() => {
      if (!elements.length) {
        return defaultValue$2;
      }
      return elements.map((element) => isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
    });
  }
  const resizeObserver = useResizeObserver({
    callback: measureRects
  });
  useIsomorphicLayoutEffect(() => {
    resizeObserver == null ? void 0 : resizeObserver.disconnect();
    measureRects();
    elements.forEach((element) => resizeObserver == null ? void 0 : resizeObserver.observe(element));
  }, [elements]);
  return rects;
}
function getMeasurableNode(node) {
  if (!node) {
    return null;
  }
  if (node.children.length > 1) {
    return node;
  }
  const firstChild = node.children[0];
  return isHTMLElement(firstChild) ? firstChild : node;
}
function useDragOverlayMeasuring(_ref) {
  let {
    measure
  } = _ref;
  const [rect, setRect] = (0, import_react3.useState)(null);
  const handleResize = (0, import_react3.useCallback)((entries) => {
    for (const {
      target
    } of entries) {
      if (isHTMLElement(target)) {
        setRect((rect2) => {
          const newRect = measure(target);
          return rect2 ? {
            ...rect2,
            width: newRect.width,
            height: newRect.height
          } : newRect;
        });
        break;
      }
    }
  }, [measure]);
  const resizeObserver = useResizeObserver({
    callback: handleResize
  });
  const handleNodeChange = (0, import_react3.useCallback)((element) => {
    const node = getMeasurableNode(element);
    resizeObserver == null ? void 0 : resizeObserver.disconnect();
    if (node) {
      resizeObserver == null ? void 0 : resizeObserver.observe(node);
    }
    setRect(node ? measure(node) : null);
  }, [measure, resizeObserver]);
  const [nodeRef, setRef] = useNodeRef(handleNodeChange);
  return (0, import_react3.useMemo)(() => ({
    nodeRef,
    rect,
    setRef
  }), [rect, nodeRef, setRef]);
}
var defaultSensors = [{
  sensor: PointerSensor,
  options: {}
}, {
  sensor: KeyboardSensor,
  options: {}
}];
var defaultData = {
  current: {}
};
var defaultMeasuringConfiguration = {
  draggable: {
    measure: getTransformAgnosticClientRect
  },
  droppable: {
    measure: getTransformAgnosticClientRect,
    strategy: MeasuringStrategy.WhileDragging,
    frequency: MeasuringFrequency.Optimized
  },
  dragOverlay: {
    measure: getClientRect
  }
};
var DroppableContainersMap = class extends Map {
  get(id) {
    var _super$get;
    return id != null ? (_super$get = super.get(id)) != null ? _super$get : void 0 : void 0;
  }
  toArray() {
    return Array.from(this.values());
  }
  getEnabled() {
    return this.toArray().filter((_ref) => {
      let {
        disabled
      } = _ref;
      return !disabled;
    });
  }
  getNodeFor(id) {
    var _this$get$node$curren, _this$get;
    return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : void 0;
  }
};
var defaultPublicContext = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: /* @__PURE__ */ new Map(),
  droppableRects: /* @__PURE__ */ new Map(),
  droppableContainers: /* @__PURE__ */ new DroppableContainersMap(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null
    },
    rect: null,
    setRef: noop
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  measuringConfiguration: defaultMeasuringConfiguration,
  measureDroppableContainers: noop,
  windowRect: null,
  measuringScheduled: false
};
var defaultInternalContext = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: ""
  },
  dispatch: noop,
  draggableNodes: /* @__PURE__ */ new Map(),
  over: null,
  measureDroppableContainers: noop
};
var InternalContext = /* @__PURE__ */ (0, import_react3.createContext)(defaultInternalContext);
var PublicContext = /* @__PURE__ */ (0, import_react3.createContext)(defaultPublicContext);
function getInitialState() {
  return {
    draggable: {
      active: null,
      initialCoordinates: {
        x: 0,
        y: 0
      },
      nodes: /* @__PURE__ */ new Map(),
      translate: {
        x: 0,
        y: 0
      }
    },
    droppable: {
      containers: new DroppableContainersMap()
    }
  };
}
function reducer(state, action) {
  switch (action.type) {
    case Action.DragStart:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          initialCoordinates: action.initialCoordinates,
          active: action.active
        }
      };
    case Action.DragMove:
      if (state.draggable.active == null) {
        return state;
      }
      return {
        ...state,
        draggable: {
          ...state.draggable,
          translate: {
            x: action.coordinates.x - state.draggable.initialCoordinates.x,
            y: action.coordinates.y - state.draggable.initialCoordinates.y
          }
        }
      };
    case Action.DragEnd:
    case Action.DragCancel:
      return {
        ...state,
        draggable: {
          ...state.draggable,
          active: null,
          initialCoordinates: {
            x: 0,
            y: 0
          },
          translate: {
            x: 0,
            y: 0
          }
        }
      };
    case Action.RegisterDroppable: {
      const {
        element
      } = action;
      const {
        id
      } = element;
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, element);
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    case Action.SetDroppableDisabled: {
      const {
        id,
        key: key2,
        disabled
      } = action;
      const element = state.droppable.containers.get(id);
      if (!element || key2 !== element.key) {
        return state;
      }
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.set(id, {
        ...element,
        disabled
      });
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    case Action.UnregisterDroppable: {
      const {
        id,
        key: key2
      } = action;
      const element = state.droppable.containers.get(id);
      if (!element || key2 !== element.key) {
        return state;
      }
      const containers = new DroppableContainersMap(state.droppable.containers);
      containers.delete(id);
      return {
        ...state,
        droppable: {
          ...state.droppable,
          containers
        }
      };
    }
    default: {
      return state;
    }
  }
}
function RestoreFocus(_ref) {
  let {
    disabled
  } = _ref;
  const {
    active,
    activatorEvent,
    draggableNodes
  } = (0, import_react3.useContext)(InternalContext);
  const previousActivatorEvent = usePrevious(activatorEvent);
  const previousActiveId = usePrevious(active == null ? void 0 : active.id);
  (0, import_react3.useEffect)(() => {
    if (disabled) {
      return;
    }
    if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
      if (!isKeyboardEvent(previousActivatorEvent)) {
        return;
      }
      if (document.activeElement === previousActivatorEvent.target) {
        return;
      }
      const draggableNode = draggableNodes.get(previousActiveId);
      if (!draggableNode) {
        return;
      }
      const {
        activatorNode,
        node
      } = draggableNode;
      if (!activatorNode.current && !node.current) {
        return;
      }
      requestAnimationFrame(() => {
        for (const element of [activatorNode.current, node.current]) {
          if (!element) {
            continue;
          }
          const focusableNode = findFirstFocusableNode(element);
          if (focusableNode) {
            focusableNode.focus();
            break;
          }
        }
      });
    }
  }, [activatorEvent, disabled, draggableNodes, previousActiveId, previousActivatorEvent]);
  return null;
}
function applyModifiers(modifiers, _ref) {
  let {
    transform,
    ...args
  } = _ref;
  return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier) => {
    return modifier({
      transform: accumulator,
      ...args
    });
  }, transform) : transform;
}
function useMeasuringConfiguration(config) {
  return (0, import_react3.useMemo)(
    () => ({
      draggable: {
        ...defaultMeasuringConfiguration.draggable,
        ...config == null ? void 0 : config.draggable
      },
      droppable: {
        ...defaultMeasuringConfiguration.droppable,
        ...config == null ? void 0 : config.droppable
      },
      dragOverlay: {
        ...defaultMeasuringConfiguration.dragOverlay,
        ...config == null ? void 0 : config.dragOverlay
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config == null ? void 0 : config.draggable, config == null ? void 0 : config.droppable, config == null ? void 0 : config.dragOverlay]
  );
}
function useLayoutShiftScrollCompensation(_ref) {
  let {
    activeNode,
    measure,
    initialRect,
    config = true
  } = _ref;
  const initialized = (0, import_react3.useRef)(false);
  const {
    x,
    y
  } = typeof config === "boolean" ? {
    x: config,
    y: config
  } : config;
  useIsomorphicLayoutEffect(() => {
    const disabled = !x && !y;
    if (disabled || !activeNode) {
      initialized.current = false;
      return;
    }
    if (initialized.current || !initialRect) {
      return;
    }
    const node = activeNode == null ? void 0 : activeNode.node.current;
    if (!node || node.isConnected === false) {
      return;
    }
    const rect = measure(node);
    const rectDelta = getRectDelta(rect, initialRect);
    if (!x) {
      rectDelta.x = 0;
    }
    if (!y) {
      rectDelta.y = 0;
    }
    initialized.current = true;
    if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
      const firstScrollableAncestor = getFirstScrollableAncestor(node);
      if (firstScrollableAncestor) {
        firstScrollableAncestor.scrollBy({
          top: rectDelta.y,
          left: rectDelta.x
        });
      }
    }
  }, [activeNode, x, y, initialRect, measure]);
}
var ActiveDraggableContext = /* @__PURE__ */ (0, import_react3.createContext)({
  ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1
});
var Status;
(function(Status2) {
  Status2[Status2["Uninitialized"] = 0] = "Uninitialized";
  Status2[Status2["Initializing"] = 1] = "Initializing";
  Status2[Status2["Initialized"] = 2] = "Initialized";
})(Status || (Status = {}));
var DndContext = /* @__PURE__ */ (0, import_react3.memo)(function DndContext2(_ref) {
  var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;
  let {
    id,
    accessibility,
    autoScroll = true,
    children,
    sensors = defaultSensors,
    collisionDetection = rectIntersection,
    measuring,
    modifiers,
    ...props
  } = _ref;
  const store = (0, import_react3.useReducer)(reducer, void 0, getInitialState);
  const [state, dispatch] = store;
  const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
  const [status, setStatus] = (0, import_react3.useState)(Status.Uninitialized);
  const isInitialized = status === Status.Initialized;
  const {
    draggable: {
      active: activeId,
      nodes: draggableNodes,
      translate
    },
    droppable: {
      containers: droppableContainers
    }
  } = state;
  const node = activeId != null ? draggableNodes.get(activeId) : null;
  const activeRects = (0, import_react3.useRef)({
    initial: null,
    translated: null
  });
  const active = (0, import_react3.useMemo)(() => {
    var _node$data;
    return activeId != null ? {
      id: activeId,
      // It's possible for the active node to unmount while dragging
      data: (_node$data = node == null ? void 0 : node.data) != null ? _node$data : defaultData,
      rect: activeRects
    } : null;
  }, [activeId, node]);
  const activeRef = (0, import_react3.useRef)(null);
  const [activeSensor, setActiveSensor] = (0, import_react3.useState)(null);
  const [activatorEvent, setActivatorEvent] = (0, import_react3.useState)(null);
  const latestProps = useLatestValue(props, Object.values(props));
  const draggableDescribedById = useUniqueId("DndDescribedBy", id);
  const enabledDroppableContainers = (0, import_react3.useMemo)(() => droppableContainers.getEnabled(), [droppableContainers]);
  const measuringConfiguration = useMeasuringConfiguration(measuring);
  const {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled
  } = useDroppableMeasuring(enabledDroppableContainers, {
    dragging: isInitialized,
    dependencies: [translate.x, translate.y],
    config: measuringConfiguration.droppable
  });
  const activeNode = useCachedNode(draggableNodes, activeId);
  const activationCoordinates = (0, import_react3.useMemo)(() => activatorEvent ? getEventCoordinates(activatorEvent) : null, [activatorEvent]);
  const autoScrollOptions = getAutoScrollerOptions();
  const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
  useLayoutShiftScrollCompensation({
    activeNode: activeId != null ? draggableNodes.get(activeId) : null,
    config: autoScrollOptions.layoutShiftCompensation,
    initialRect: initialActiveNodeRect,
    measure: measuringConfiguration.draggable.measure
  });
  const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
  const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
  const sensorContext = (0, import_react3.useRef)({
    activatorEvent: null,
    active: null,
    activeNode,
    collisionRect: null,
    collisions: null,
    droppableRects,
    draggableNodes,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null
  });
  const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
  const dragOverlay = useDragOverlayMeasuring({
    measure: measuringConfiguration.dragOverlay.measure
  });
  const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
  const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
  const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect);
  const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect);
  const windowRect = useWindowRect(draggingNode ? getWindow(draggingNode) : null);
  const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
  const scrollableAncestorRects = useRects(scrollableAncestors);
  const modifiedTranslate = applyModifiers(modifiers, {
    transform: {
      x: translate.x - nodeRectDelta.x,
      y: translate.y - nodeRectDelta.y,
      scaleX: 1,
      scaleY: 1
    },
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggingNodeRect,
    over: sensorContext.current.over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect
  });
  const pointerCoordinates = activationCoordinates ? add(activationCoordinates, translate) : null;
  const scrollOffsets = useScrollOffsets(scrollableAncestors);
  const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
  const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [activeNodeRect]);
  const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);
  const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
  const collisions = active && collisionRect ? collisionDetection({
    active,
    collisionRect,
    droppableRects,
    droppableContainers: enabledDroppableContainers,
    pointerCoordinates
  }) : null;
  const overId = getFirstCollision(collisions, "id");
  const [over, setOver] = (0, import_react3.useState)(null);
  const appliedTranslate = usesDragOverlay ? modifiedTranslate : add(modifiedTranslate, activeNodeScrollDelta);
  const transform = adjustScale(appliedTranslate, (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
  const activeSensorRef = (0, import_react3.useRef)(null);
  const instantiateSensor = (0, import_react3.useCallback)(
    (event, _ref2) => {
      let {
        sensor: Sensor,
        options
      } = _ref2;
      if (activeRef.current == null) {
        return;
      }
      const activeNode2 = draggableNodes.get(activeRef.current);
      if (!activeNode2) {
        return;
      }
      const activatorEvent2 = event.nativeEvent;
      const sensorInstance = new Sensor({
        active: activeRef.current,
        activeNode: activeNode2,
        event: activatorEvent2,
        options,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: sensorContext,
        onAbort(id2) {
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragAbort
          } = latestProps.current;
          const event2 = {
            id: id2
          };
          onDragAbort == null ? void 0 : onDragAbort(event2);
          dispatchMonitorEvent({
            type: "onDragAbort",
            event: event2
          });
        },
        onPending(id2, constraint, initialCoordinates, offset) {
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragPending
          } = latestProps.current;
          const event2 = {
            id: id2,
            constraint,
            initialCoordinates,
            offset
          };
          onDragPending == null ? void 0 : onDragPending(event2);
          dispatchMonitorEvent({
            type: "onDragPending",
            event: event2
          });
        },
        onStart(initialCoordinates) {
          const id2 = activeRef.current;
          if (id2 == null) {
            return;
          }
          const draggableNode = draggableNodes.get(id2);
          if (!draggableNode) {
            return;
          }
          const {
            onDragStart
          } = latestProps.current;
          const event2 = {
            activatorEvent: activatorEvent2,
            active: {
              id: id2,
              data: draggableNode.data,
              rect: activeRects
            }
          };
          (0, import_react_dom.unstable_batchedUpdates)(() => {
            onDragStart == null ? void 0 : onDragStart(event2);
            setStatus(Status.Initializing);
            dispatch({
              type: Action.DragStart,
              initialCoordinates,
              active: id2
            });
            dispatchMonitorEvent({
              type: "onDragStart",
              event: event2
            });
            setActiveSensor(activeSensorRef.current);
            setActivatorEvent(activatorEvent2);
          });
        },
        onMove(coordinates) {
          dispatch({
            type: Action.DragMove,
            coordinates
          });
        },
        onEnd: createHandler(Action.DragEnd),
        onCancel: createHandler(Action.DragCancel)
      });
      activeSensorRef.current = sensorInstance;
      function createHandler(type) {
        return async function handler() {
          const {
            active: active2,
            collisions: collisions2,
            over: over2,
            scrollAdjustedTranslate: scrollAdjustedTranslate2
          } = sensorContext.current;
          let event2 = null;
          if (active2 && scrollAdjustedTranslate2) {
            const {
              cancelDrop
            } = latestProps.current;
            event2 = {
              activatorEvent: activatorEvent2,
              active: active2,
              collisions: collisions2,
              delta: scrollAdjustedTranslate2,
              over: over2
            };
            if (type === Action.DragEnd && typeof cancelDrop === "function") {
              const shouldCancel = await Promise.resolve(cancelDrop(event2));
              if (shouldCancel) {
                type = Action.DragCancel;
              }
            }
          }
          activeRef.current = null;
          (0, import_react_dom.unstable_batchedUpdates)(() => {
            dispatch({
              type
            });
            setStatus(Status.Uninitialized);
            setOver(null);
            setActiveSensor(null);
            setActivatorEvent(null);
            activeSensorRef.current = null;
            const eventName = type === Action.DragEnd ? "onDragEnd" : "onDragCancel";
            if (event2) {
              const handler2 = latestProps.current[eventName];
              handler2 == null ? void 0 : handler2(event2);
              dispatchMonitorEvent({
                type: eventName,
                event: event2
              });
            }
          });
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes]
  );
  const bindActivatorToSensorInstantiator = (0, import_react3.useCallback)((handler, sensor) => {
    return (event, active2) => {
      const nativeEvent = event.nativeEvent;
      const activeDraggableNode = draggableNodes.get(active2);
      if (
        // Another sensor is already instantiating
        activeRef.current !== null || // No active draggable
        !activeDraggableNode || // Event has already been captured
        nativeEvent.dndKit || nativeEvent.defaultPrevented
      ) {
        return;
      }
      const activationContext = {
        active: activeDraggableNode
      };
      const shouldActivate = handler(event, sensor.options, activationContext);
      if (shouldActivate === true) {
        nativeEvent.dndKit = {
          capturedBy: sensor.sensor
        };
        activeRef.current = active2;
        instantiateSensor(event, sensor);
      }
    };
  }, [draggableNodes, instantiateSensor]);
  const activators = useCombineActivators(sensors, bindActivatorToSensorInstantiator);
  useSensorSetup(sensors);
  useIsomorphicLayoutEffect(() => {
    if (activeNodeRect && status === Status.Initializing) {
      setStatus(Status.Initialized);
    }
  }, [activeNodeRect, status]);
  (0, import_react3.useEffect)(
    () => {
      const {
        onDragMove
      } = latestProps.current;
      const {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        over: over2
      } = sensorContext.current;
      if (!active2 || !activatorEvent2) {
        return;
      }
      const event = {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        delta: {
          x: scrollAdjustedTranslate.x,
          y: scrollAdjustedTranslate.y
        },
        over: over2
      };
      (0, import_react_dom.unstable_batchedUpdates)(() => {
        onDragMove == null ? void 0 : onDragMove(event);
        dispatchMonitorEvent({
          type: "onDragMove",
          event
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]
  );
  (0, import_react3.useEffect)(
    () => {
      const {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        droppableContainers: droppableContainers2,
        scrollAdjustedTranslate: scrollAdjustedTranslate2
      } = sensorContext.current;
      if (!active2 || activeRef.current == null || !activatorEvent2 || !scrollAdjustedTranslate2) {
        return;
      }
      const {
        onDragOver
      } = latestProps.current;
      const overContainer = droppableContainers2.get(overId);
      const over2 = overContainer && overContainer.rect.current ? {
        id: overContainer.id,
        rect: overContainer.rect.current,
        data: overContainer.data,
        disabled: overContainer.disabled
      } : null;
      const event = {
        active: active2,
        activatorEvent: activatorEvent2,
        collisions: collisions2,
        delta: {
          x: scrollAdjustedTranslate2.x,
          y: scrollAdjustedTranslate2.y
        },
        over: over2
      };
      (0, import_react_dom.unstable_batchedUpdates)(() => {
        setOver(over2);
        onDragOver == null ? void 0 : onDragOver(event);
        dispatchMonitorEvent({
          type: "onDragOver",
          event
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [overId]
  );
  useIsomorphicLayoutEffect(() => {
    sensorContext.current = {
      activatorEvent,
      active,
      activeNode,
      collisionRect,
      collisions,
      droppableRects,
      draggableNodes,
      draggingNode,
      draggingNodeRect,
      droppableContainers,
      over,
      scrollableAncestors,
      scrollAdjustedTranslate
    };
    activeRects.current = {
      initial: draggingNodeRect,
      translated: collisionRect
    };
  }, [active, activeNode, collisions, collisionRect, draggableNodes, draggingNode, draggingNodeRect, droppableRects, droppableContainers, over, scrollableAncestors, scrollAdjustedTranslate]);
  useAutoScroller({
    ...autoScrollOptions,
    delta: translate,
    draggingRect: collisionRect,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects
  });
  const publicContext = (0, import_react3.useMemo)(() => {
    const context = {
      active,
      activeNode,
      activeNodeRect,
      activatorEvent,
      collisions,
      containerNodeRect,
      dragOverlay,
      draggableNodes,
      droppableContainers,
      droppableRects,
      over,
      measureDroppableContainers,
      scrollableAncestors,
      scrollableAncestorRects,
      measuringConfiguration,
      measuringScheduled,
      windowRect
    };
    return context;
  }, [active, activeNode, activeNodeRect, activatorEvent, collisions, containerNodeRect, dragOverlay, draggableNodes, droppableContainers, droppableRects, over, measureDroppableContainers, scrollableAncestors, scrollableAncestorRects, measuringConfiguration, measuringScheduled, windowRect]);
  const internalContext = (0, import_react3.useMemo)(() => {
    const context = {
      activatorEvent,
      activators,
      active,
      activeNodeRect,
      ariaDescribedById: {
        draggable: draggableDescribedById
      },
      dispatch,
      draggableNodes,
      over,
      measureDroppableContainers
    };
    return context;
  }, [activatorEvent, activators, active, activeNodeRect, dispatch, draggableDescribedById, draggableNodes, over, measureDroppableContainers]);
  return import_react3.default.createElement(DndMonitorContext.Provider, {
    value: registerMonitorListener
  }, import_react3.default.createElement(InternalContext.Provider, {
    value: internalContext
  }, import_react3.default.createElement(PublicContext.Provider, {
    value: publicContext
  }, import_react3.default.createElement(ActiveDraggableContext.Provider, {
    value: transform
  }, children)), import_react3.default.createElement(RestoreFocus, {
    disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false
  })), import_react3.default.createElement(Accessibility, {
    ...accessibility,
    hiddenTextDescribedById: draggableDescribedById
  }));
  function getAutoScrollerOptions() {
    const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
    const autoScrollGloballyDisabled = typeof autoScroll === "object" ? autoScroll.enabled === false : autoScroll === false;
    const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;
    if (typeof autoScroll === "object") {
      return {
        ...autoScroll,
        enabled
      };
    }
    return {
      enabled
    };
  }
});
var NullContext = /* @__PURE__ */ (0, import_react3.createContext)(null);
var defaultRole = "button";
var ID_PREFIX = "Draggable";
function useDraggable(_ref) {
  let {
    id,
    data,
    disabled = false,
    attributes
  } = _ref;
  const key2 = useUniqueId(ID_PREFIX);
  const {
    activators,
    activatorEvent,
    active,
    activeNodeRect,
    ariaDescribedById,
    draggableNodes,
    over
  } = (0, import_react3.useContext)(InternalContext);
  const {
    role = defaultRole,
    roleDescription = "draggable",
    tabIndex = 0
  } = attributes != null ? attributes : {};
  const isDragging = (active == null ? void 0 : active.id) === id;
  const transform = (0, import_react3.useContext)(isDragging ? ActiveDraggableContext : NullContext);
  const [node, setNodeRef] = useNodeRef();
  const [activatorNode, setActivatorNodeRef] = useNodeRef();
  const listeners = useSyntheticListeners(activators, id);
  const dataRef = useLatestValue(data);
  useIsomorphicLayoutEffect(
    () => {
      draggableNodes.set(id, {
        id,
        key: key2,
        node,
        activatorNode,
        data: dataRef
      });
      return () => {
        const node2 = draggableNodes.get(id);
        if (node2 && node2.key === key2) {
          draggableNodes.delete(id);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draggableNodes, id]
  );
  const memoizedAttributes = (0, import_react3.useMemo)(() => ({
    role,
    tabIndex,
    "aria-disabled": disabled,
    "aria-pressed": isDragging && role === defaultRole ? true : void 0,
    "aria-roledescription": roleDescription,
    "aria-describedby": ariaDescribedById.draggable
  }), [disabled, role, tabIndex, isDragging, roleDescription, ariaDescribedById.draggable]);
  return {
    active,
    activatorEvent,
    activeNodeRect,
    attributes: memoizedAttributes,
    isDragging,
    listeners: disabled ? void 0 : listeners,
    node,
    over,
    setNodeRef,
    setActivatorNodeRef,
    transform
  };
}
function useDndContext() {
  return (0, import_react3.useContext)(PublicContext);
}
var ID_PREFIX$1 = "Droppable";
var defaultResizeObserverConfig = {
  timeout: 25
};
function useDroppable(_ref) {
  let {
    data,
    disabled = false,
    id,
    resizeObserverConfig
  } = _ref;
  const key2 = useUniqueId(ID_PREFIX$1);
  const {
    active,
    dispatch,
    over,
    measureDroppableContainers
  } = (0, import_react3.useContext)(InternalContext);
  const previous = (0, import_react3.useRef)({
    disabled
  });
  const resizeObserverConnected = (0, import_react3.useRef)(false);
  const rect = (0, import_react3.useRef)(null);
  const callbackId = (0, import_react3.useRef)(null);
  const {
    disabled: resizeObserverDisabled,
    updateMeasurementsFor,
    timeout: resizeObserverTimeout
  } = {
    ...defaultResizeObserverConfig,
    ...resizeObserverConfig
  };
  const ids2 = useLatestValue(updateMeasurementsFor != null ? updateMeasurementsFor : id);
  const handleResize = (0, import_react3.useCallback)(
    () => {
      if (!resizeObserverConnected.current) {
        resizeObserverConnected.current = true;
        return;
      }
      if (callbackId.current != null) {
        clearTimeout(callbackId.current);
      }
      callbackId.current = setTimeout(() => {
        measureDroppableContainers(Array.isArray(ids2.current) ? ids2.current : [ids2.current]);
        callbackId.current = null;
      }, resizeObserverTimeout);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [resizeObserverTimeout]
  );
  const resizeObserver = useResizeObserver({
    callback: handleResize,
    disabled: resizeObserverDisabled || !active
  });
  const handleNodeChange = (0, import_react3.useCallback)((newElement, previousElement) => {
    if (!resizeObserver) {
      return;
    }
    if (previousElement) {
      resizeObserver.unobserve(previousElement);
      resizeObserverConnected.current = false;
    }
    if (newElement) {
      resizeObserver.observe(newElement);
    }
  }, [resizeObserver]);
  const [nodeRef, setNodeRef] = useNodeRef(handleNodeChange);
  const dataRef = useLatestValue(data);
  (0, import_react3.useEffect)(() => {
    if (!resizeObserver || !nodeRef.current) {
      return;
    }
    resizeObserver.disconnect();
    resizeObserverConnected.current = false;
    resizeObserver.observe(nodeRef.current);
  }, [nodeRef, resizeObserver]);
  (0, import_react3.useEffect)(
    () => {
      dispatch({
        type: Action.RegisterDroppable,
        element: {
          id,
          key: key2,
          disabled,
          node: nodeRef,
          rect,
          data: dataRef
        }
      });
      return () => dispatch({
        type: Action.UnregisterDroppable,
        key: key2,
        id
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );
  (0, import_react3.useEffect)(() => {
    if (disabled !== previous.current.disabled) {
      dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key: key2,
        disabled
      });
      previous.current.disabled = disabled;
    }
  }, [id, key2, disabled, dispatch]);
  return {
    active,
    rect,
    isOver: (over == null ? void 0 : over.id) === id,
    node: nodeRef,
    over,
    setNodeRef
  };
}
function AnimationManager(_ref) {
  let {
    animation,
    children
  } = _ref;
  const [clonedChildren, setClonedChildren] = (0, import_react3.useState)(null);
  const [element, setElement] = (0, import_react3.useState)(null);
  const previousChildren = usePrevious(children);
  if (!children && !clonedChildren && previousChildren) {
    setClonedChildren(previousChildren);
  }
  useIsomorphicLayoutEffect(() => {
    if (!element) {
      return;
    }
    const key2 = clonedChildren == null ? void 0 : clonedChildren.key;
    const id = clonedChildren == null ? void 0 : clonedChildren.props.id;
    if (key2 == null || id == null) {
      setClonedChildren(null);
      return;
    }
    Promise.resolve(animation(id, element)).then(() => {
      setClonedChildren(null);
    });
  }, [animation, clonedChildren, element]);
  return import_react3.default.createElement(import_react3.default.Fragment, null, children, clonedChildren ? (0, import_react3.cloneElement)(clonedChildren, {
    ref: setElement
  }) : null);
}
var defaultTransform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1
};
function NullifiedContextProvider(_ref) {
  let {
    children
  } = _ref;
  return import_react3.default.createElement(InternalContext.Provider, {
    value: defaultInternalContext
  }, import_react3.default.createElement(ActiveDraggableContext.Provider, {
    value: defaultTransform
  }, children));
}
var baseStyles = {
  position: "fixed",
  touchAction: "none"
};
var defaultTransition = (activatorEvent) => {
  const isKeyboardActivator = isKeyboardEvent(activatorEvent);
  return isKeyboardActivator ? "transform 250ms ease" : void 0;
};
var PositionedOverlay = /* @__PURE__ */ (0, import_react3.forwardRef)((_ref, ref) => {
  let {
    as,
    activatorEvent,
    adjustScale: adjustScale2,
    children,
    className,
    rect,
    style,
    transform,
    transition = defaultTransition
  } = _ref;
  if (!rect) {
    return null;
  }
  const scaleAdjustedTransform = adjustScale2 ? transform : {
    ...transform,
    scaleX: 1,
    scaleY: 1
  };
  const styles = {
    ...baseStyles,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    transform: CSS.Transform.toString(scaleAdjustedTransform),
    transformOrigin: adjustScale2 && activatorEvent ? getRelativeTransformOrigin(activatorEvent, rect) : void 0,
    transition: typeof transition === "function" ? transition(activatorEvent) : transition,
    ...style
  };
  return import_react3.default.createElement(as, {
    className,
    style: styles,
    ref
  }, children);
});
var defaultDropAnimationSideEffects = (options) => (_ref) => {
  let {
    active,
    dragOverlay
  } = _ref;
  const originalStyles = {};
  const {
    styles,
    className
  } = options;
  if (styles != null && styles.active) {
    for (const [key2, value] of Object.entries(styles.active)) {
      if (value === void 0) {
        continue;
      }
      originalStyles[key2] = active.node.style.getPropertyValue(key2);
      active.node.style.setProperty(key2, value);
    }
  }
  if (styles != null && styles.dragOverlay) {
    for (const [key2, value] of Object.entries(styles.dragOverlay)) {
      if (value === void 0) {
        continue;
      }
      dragOverlay.node.style.setProperty(key2, value);
    }
  }
  if (className != null && className.active) {
    active.node.classList.add(className.active);
  }
  if (className != null && className.dragOverlay) {
    dragOverlay.node.classList.add(className.dragOverlay);
  }
  return function cleanup() {
    for (const [key2, value] of Object.entries(originalStyles)) {
      active.node.style.setProperty(key2, value);
    }
    if (className != null && className.active) {
      active.node.classList.remove(className.active);
    }
  };
};
var defaultKeyframeResolver = (_ref2) => {
  let {
    transform: {
      initial,
      final
    }
  } = _ref2;
  return [{
    transform: CSS.Transform.toString(initial)
  }, {
    transform: CSS.Transform.toString(final)
  }];
};
var defaultDropAnimationConfiguration = {
  duration: 250,
  easing: "ease",
  keyframes: defaultKeyframeResolver,
  sideEffects: /* @__PURE__ */ defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0"
      }
    }
  })
};
function useDropAnimation(_ref3) {
  let {
    config,
    draggableNodes,
    droppableContainers,
    measuringConfiguration
  } = _ref3;
  return useEvent((id, node) => {
    if (config === null) {
      return;
    }
    const activeDraggable = draggableNodes.get(id);
    if (!activeDraggable) {
      return;
    }
    const activeNode = activeDraggable.node.current;
    if (!activeNode) {
      return;
    }
    const measurableNode = getMeasurableNode(node);
    if (!measurableNode) {
      return;
    }
    const {
      transform
    } = getWindow(node).getComputedStyle(node);
    const parsedTransform = parseTransform(transform);
    if (!parsedTransform) {
      return;
    }
    const animation = typeof config === "function" ? config : createDefaultDropAnimation(config);
    scrollIntoViewIfNeeded(activeNode, measuringConfiguration.draggable.measure);
    return animation({
      active: {
        id,
        data: activeDraggable.data,
        node: activeNode,
        rect: measuringConfiguration.draggable.measure(activeNode)
      },
      draggableNodes,
      dragOverlay: {
        node,
        rect: measuringConfiguration.dragOverlay.measure(measurableNode)
      },
      droppableContainers,
      measuringConfiguration,
      transform: parsedTransform
    });
  });
}
function createDefaultDropAnimation(options) {
  const {
    duration,
    easing,
    sideEffects,
    keyframes
  } = {
    ...defaultDropAnimationConfiguration,
    ...options
  };
  return (_ref4) => {
    let {
      active,
      dragOverlay,
      transform,
      ...rest
    } = _ref4;
    if (!duration) {
      return;
    }
    const delta = {
      x: dragOverlay.rect.left - active.rect.left,
      y: dragOverlay.rect.top - active.rect.top
    };
    const scale = {
      scaleX: transform.scaleX !== 1 ? active.rect.width * transform.scaleX / dragOverlay.rect.width : 1,
      scaleY: transform.scaleY !== 1 ? active.rect.height * transform.scaleY / dragOverlay.rect.height : 1
    };
    const finalTransform = {
      x: transform.x - delta.x,
      y: transform.y - delta.y,
      ...scale
    };
    const animationKeyframes = keyframes({
      ...rest,
      active,
      dragOverlay,
      transform: {
        initial: transform,
        final: finalTransform
      }
    });
    const [firstKeyframe] = animationKeyframes;
    const lastKeyframe = animationKeyframes[animationKeyframes.length - 1];
    if (JSON.stringify(firstKeyframe) === JSON.stringify(lastKeyframe)) {
      return;
    }
    const cleanup = sideEffects == null ? void 0 : sideEffects({
      active,
      dragOverlay,
      ...rest
    });
    const animation = dragOverlay.node.animate(animationKeyframes, {
      duration,
      easing,
      fill: "forwards"
    });
    return new Promise((resolve) => {
      animation.onfinish = () => {
        cleanup == null ? void 0 : cleanup();
        resolve();
      };
    });
  };
}
var key = 0;
function useKey(id) {
  return (0, import_react3.useMemo)(() => {
    if (id == null) {
      return;
    }
    key++;
    return key;
  }, [id]);
}
var DragOverlay = /* @__PURE__ */ import_react3.default.memo((_ref) => {
  let {
    adjustScale: adjustScale2 = false,
    children,
    dropAnimation: dropAnimationConfig,
    style,
    transition,
    modifiers,
    wrapperElement = "div",
    className,
    zIndex = 999
  } = _ref;
  const {
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggableNodes,
    droppableContainers,
    dragOverlay,
    over,
    measuringConfiguration,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect
  } = useDndContext();
  const transform = (0, import_react3.useContext)(ActiveDraggableContext);
  const key2 = useKey(active == null ? void 0 : active.id);
  const modifiedTransform = applyModifiers(modifiers, {
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggingNodeRect: dragOverlay.rect,
    over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    transform,
    windowRect
  });
  const initialRect = useInitialValue(activeNodeRect);
  const dropAnimation = useDropAnimation({
    config: dropAnimationConfig,
    draggableNodes,
    droppableContainers,
    measuringConfiguration
  });
  const ref = initialRect ? dragOverlay.setRef : void 0;
  return import_react3.default.createElement(NullifiedContextProvider, null, import_react3.default.createElement(AnimationManager, {
    animation: dropAnimation
  }, active && key2 ? import_react3.default.createElement(PositionedOverlay, {
    key: key2,
    id: active.id,
    ref,
    as: wrapperElement,
    activatorEvent,
    adjustScale: adjustScale2,
    className,
    transition,
    rect: initialRect,
    style: {
      zIndex,
      ...style
    },
    transform: modifiedTransform
  }, children) : null));
});

// ../node_modules/@dnd-kit/sortable/dist/sortable.esm.js
var import_react4 = __toESM(require_react());
function arrayMove(array, from, to) {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}
function getSortedRects(items, rects) {
  return items.reduce((accumulator, id, index) => {
    const rect = rects.get(id);
    if (rect) {
      accumulator[index] = rect;
    }
    return accumulator;
  }, Array(items.length));
}
function isValidIndex(index) {
  return index !== null && index >= 0;
}
function itemsEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
function normalizeDisabled(disabled) {
  if (typeof disabled === "boolean") {
    return {
      draggable: disabled,
      droppable: disabled
    };
  }
  return disabled;
}
var defaultScale = {
  scaleX: 1,
  scaleY: 1
};
var horizontalListSortingStrategy = (_ref) => {
  var _rects$activeIndex;
  let {
    rects,
    activeNodeRect: fallbackActiveRect,
    activeIndex,
    overIndex,
    index
  } = _ref;
  const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
  if (!activeNodeRect) {
    return null;
  }
  const itemGap = getItemGap(rects, index, activeIndex);
  if (index === activeIndex) {
    const newIndexRect = rects[overIndex];
    if (!newIndexRect) {
      return null;
    }
    return {
      x: activeIndex < overIndex ? newIndexRect.left + newIndexRect.width - (activeNodeRect.left + activeNodeRect.width) : newIndexRect.left - activeNodeRect.left,
      y: 0,
      ...defaultScale
    };
  }
  if (index > activeIndex && index <= overIndex) {
    return {
      x: -activeNodeRect.width - itemGap,
      y: 0,
      ...defaultScale
    };
  }
  if (index < activeIndex && index >= overIndex) {
    return {
      x: activeNodeRect.width + itemGap,
      y: 0,
      ...defaultScale
    };
  }
  return {
    x: 0,
    y: 0,
    ...defaultScale
  };
};
function getItemGap(rects, index, activeIndex) {
  const currentRect = rects[index];
  const previousRect = rects[index - 1];
  const nextRect = rects[index + 1];
  if (!currentRect || !previousRect && !nextRect) {
    return 0;
  }
  if (activeIndex < index) {
    return previousRect ? currentRect.left - (previousRect.left + previousRect.width) : nextRect.left - (currentRect.left + currentRect.width);
  }
  return nextRect ? nextRect.left - (currentRect.left + currentRect.width) : currentRect.left - (previousRect.left + previousRect.width);
}
var rectSortingStrategy = (_ref) => {
  let {
    rects,
    activeIndex,
    overIndex,
    index
  } = _ref;
  const newRects = arrayMove(rects, overIndex, activeIndex);
  const oldRect = rects[index];
  const newRect = newRects[index];
  if (!newRect || !oldRect) {
    return null;
  }
  return {
    x: newRect.left - oldRect.left,
    y: newRect.top - oldRect.top,
    scaleX: newRect.width / oldRect.width,
    scaleY: newRect.height / oldRect.height
  };
};
var defaultScale$1 = {
  scaleX: 1,
  scaleY: 1
};
var verticalListSortingStrategy = (_ref) => {
  var _rects$activeIndex;
  let {
    activeIndex,
    activeNodeRect: fallbackActiveRect,
    index,
    rects,
    overIndex
  } = _ref;
  const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;
  if (!activeNodeRect) {
    return null;
  }
  if (index === activeIndex) {
    const overIndexRect = rects[overIndex];
    if (!overIndexRect) {
      return null;
    }
    return {
      x: 0,
      y: activeIndex < overIndex ? overIndexRect.top + overIndexRect.height - (activeNodeRect.top + activeNodeRect.height) : overIndexRect.top - activeNodeRect.top,
      ...defaultScale$1
    };
  }
  const itemGap = getItemGap$1(rects, index, activeIndex);
  if (index > activeIndex && index <= overIndex) {
    return {
      x: 0,
      y: -activeNodeRect.height - itemGap,
      ...defaultScale$1
    };
  }
  if (index < activeIndex && index >= overIndex) {
    return {
      x: 0,
      y: activeNodeRect.height + itemGap,
      ...defaultScale$1
    };
  }
  return {
    x: 0,
    y: 0,
    ...defaultScale$1
  };
};
function getItemGap$1(clientRects, index, activeIndex) {
  const currentRect = clientRects[index];
  const previousRect = clientRects[index - 1];
  const nextRect = clientRects[index + 1];
  if (!currentRect) {
    return 0;
  }
  if (activeIndex < index) {
    return previousRect ? currentRect.top - (previousRect.top + previousRect.height) : nextRect ? nextRect.top - (currentRect.top + currentRect.height) : 0;
  }
  return nextRect ? nextRect.top - (currentRect.top + currentRect.height) : previousRect ? currentRect.top - (previousRect.top + previousRect.height) : 0;
}
var ID_PREFIX2 = "Sortable";
var Context = /* @__PURE__ */ import_react4.default.createContext({
  activeIndex: -1,
  containerId: ID_PREFIX2,
  disableTransforms: false,
  items: [],
  overIndex: -1,
  useDragOverlay: false,
  sortedRects: [],
  strategy: rectSortingStrategy,
  disabled: {
    draggable: false,
    droppable: false
  }
});
function SortableContext(_ref) {
  let {
    children,
    id,
    items: userDefinedItems,
    strategy = rectSortingStrategy,
    disabled: disabledProp = false
  } = _ref;
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    measureDroppableContainers
  } = useDndContext();
  const containerId = useUniqueId(ID_PREFIX2, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const items = (0, import_react4.useMemo)(() => userDefinedItems.map((item) => typeof item === "object" && "id" in item ? item.id : item), [userDefinedItems]);
  const isDragging = active != null;
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = (0, import_react4.useRef)(items);
  const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
  const disableTransforms = overIndex !== -1 && activeIndex === -1 || itemsHaveChanged;
  const disabled = normalizeDisabled(disabledProp);
  useIsomorphicLayoutEffect(() => {
    if (itemsHaveChanged && isDragging) {
      measureDroppableContainers(items);
    }
  }, [itemsHaveChanged, items, isDragging, measureDroppableContainers]);
  (0, import_react4.useEffect)(() => {
    previousItemsRef.current = items;
  }, [items]);
  const contextValue = (0, import_react4.useMemo)(
    () => ({
      activeIndex,
      containerId,
      disabled,
      disableTransforms,
      items,
      overIndex,
      useDragOverlay,
      sortedRects: getSortedRects(items, droppableRects),
      strategy
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeIndex, containerId, disabled.draggable, disabled.droppable, disableTransforms, items, overIndex, droppableRects, useDragOverlay, strategy]
  );
  return import_react4.default.createElement(Context.Provider, {
    value: contextValue
  }, children);
}
var defaultNewIndexGetter = (_ref) => {
  let {
    id,
    items,
    activeIndex,
    overIndex
  } = _ref;
  return arrayMove(items, activeIndex, overIndex).indexOf(id);
};
var defaultAnimateLayoutChanges = (_ref2) => {
  let {
    containerId,
    isSorting,
    wasDragging,
    index,
    items,
    newIndex,
    previousItems,
    previousContainerId,
    transition
  } = _ref2;
  if (!transition || !wasDragging) {
    return false;
  }
  if (previousItems !== items && index === newIndex) {
    return false;
  }
  if (isSorting) {
    return true;
  }
  return newIndex !== index && containerId === previousContainerId;
};
var defaultTransition2 = {
  duration: 200,
  easing: "ease"
};
var transitionProperty = "transform";
var disabledTransition = /* @__PURE__ */ CSS.Transition.toString({
  property: transitionProperty,
  duration: 0,
  easing: "linear"
});
var defaultAttributes = {
  roleDescription: "sortable"
};
function useDerivedTransform(_ref) {
  let {
    disabled,
    index,
    node,
    rect
  } = _ref;
  const [derivedTransform, setDerivedtransform] = (0, import_react4.useState)(null);
  const previousIndex = (0, import_react4.useRef)(index);
  useIsomorphicLayoutEffect(() => {
    if (!disabled && index !== previousIndex.current && node.current) {
      const initial = rect.current;
      if (initial) {
        const current = getClientRect(node.current, {
          ignoreTransform: true
        });
        const delta = {
          x: initial.left - current.left,
          y: initial.top - current.top,
          scaleX: initial.width / current.width,
          scaleY: initial.height / current.height
        };
        if (delta.x || delta.y) {
          setDerivedtransform(delta);
        }
      }
    }
    if (index !== previousIndex.current) {
      previousIndex.current = index;
    }
  }, [disabled, index, node, rect]);
  (0, import_react4.useEffect)(() => {
    if (derivedTransform) {
      setDerivedtransform(null);
    }
  }, [derivedTransform]);
  return derivedTransform;
}
function useSortable(_ref) {
  let {
    animateLayoutChanges = defaultAnimateLayoutChanges,
    attributes: userDefinedAttributes,
    disabled: localDisabled,
    data: customData,
    getNewIndex = defaultNewIndexGetter,
    id,
    strategy: localStrategy,
    resizeObserverConfig,
    transition = defaultTransition2
  } = _ref;
  const {
    items,
    containerId,
    activeIndex,
    disabled: globalDisabled,
    disableTransforms,
    sortedRects,
    overIndex,
    useDragOverlay,
    strategy: globalStrategy
  } = (0, import_react4.useContext)(Context);
  const disabled = normalizeLocalDisabled(localDisabled, globalDisabled);
  const index = items.indexOf(id);
  const data = (0, import_react4.useMemo)(() => ({
    sortable: {
      containerId,
      index,
      items
    },
    ...customData
  }), [containerId, customData, index, items]);
  const itemsAfterCurrentSortable = (0, import_react4.useMemo)(() => items.slice(items.indexOf(id)), [items, id]);
  const {
    rect,
    node,
    isOver,
    setNodeRef: setDroppableNodeRef
  } = useDroppable({
    id,
    data,
    disabled: disabled.droppable,
    resizeObserverConfig: {
      updateMeasurementsFor: itemsAfterCurrentSortable,
      ...resizeObserverConfig
    }
  });
  const {
    active,
    activatorEvent,
    activeNodeRect,
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
    over,
    setActivatorNodeRef,
    transform
  } = useDraggable({
    id,
    data,
    attributes: {
      ...defaultAttributes,
      ...userDefinedAttributes
    },
    disabled: disabled.draggable
  });
  const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
  const isSorting = Boolean(active);
  const displaceItem = isSorting && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex);
  const shouldDisplaceDragSource = !useDragOverlay && isDragging;
  const dragSourceDisplacement = shouldDisplaceDragSource && displaceItem ? transform : null;
  const strategy = localStrategy != null ? localStrategy : globalStrategy;
  const finalTransform = displaceItem ? dragSourceDisplacement != null ? dragSourceDisplacement : strategy({
    rects: sortedRects,
    activeNodeRect,
    activeIndex,
    overIndex,
    index
  }) : null;
  const newIndex = isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({
    id,
    items,
    activeIndex,
    overIndex
  }) : index;
  const activeId = active == null ? void 0 : active.id;
  const previous = (0, import_react4.useRef)({
    activeId,
    items,
    newIndex,
    containerId
  });
  const itemsHaveChanged = items !== previous.current.items;
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    containerId,
    isDragging,
    isSorting,
    id,
    index,
    items,
    newIndex: previous.current.newIndex,
    previousItems: previous.current.items,
    previousContainerId: previous.current.containerId,
    transition,
    wasDragging: previous.current.activeId != null
  });
  const derivedTransform = useDerivedTransform({
    disabled: !shouldAnimateLayoutChanges,
    index,
    node,
    rect
  });
  (0, import_react4.useEffect)(() => {
    if (isSorting && previous.current.newIndex !== newIndex) {
      previous.current.newIndex = newIndex;
    }
    if (containerId !== previous.current.containerId) {
      previous.current.containerId = containerId;
    }
    if (items !== previous.current.items) {
      previous.current.items = items;
    }
  }, [isSorting, newIndex, containerId, items]);
  (0, import_react4.useEffect)(() => {
    if (activeId === previous.current.activeId) {
      return;
    }
    if (activeId != null && previous.current.activeId == null) {
      previous.current.activeId = activeId;
      return;
    }
    const timeoutId = setTimeout(() => {
      previous.current.activeId = activeId;
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [activeId]);
  return {
    active,
    activeIndex,
    attributes,
    data,
    rect,
    index,
    newIndex,
    items,
    isOver,
    isSorting,
    isDragging,
    listeners,
    node,
    overIndex,
    over,
    setNodeRef,
    setActivatorNodeRef,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform: derivedTransform != null ? derivedTransform : finalTransform,
    transition: getTransition()
  };
  function getTransition() {
    if (
      // Temporarily disable transitions for a single frame to set up derived transforms
      derivedTransform || // Or to prevent items jumping to back to their "new" position when items change
      itemsHaveChanged && previous.current.newIndex === index
    ) {
      return disabledTransition;
    }
    if (shouldDisplaceDragSource && !isKeyboardEvent(activatorEvent) || !transition) {
      return void 0;
    }
    if (isSorting || shouldAnimateLayoutChanges) {
      return CSS.Transition.toString({
        ...transition,
        property: transitionProperty
      });
    }
    return void 0;
  }
}
function normalizeLocalDisabled(localDisabled, globalDisabled) {
  var _localDisabled$dragga, _localDisabled$droppa;
  if (typeof localDisabled === "boolean") {
    return {
      draggable: localDisabled,
      // Backwards compatibility
      droppable: false
    };
  }
  return {
    draggable: (_localDisabled$dragga = localDisabled == null ? void 0 : localDisabled.draggable) != null ? _localDisabled$dragga : globalDisabled.draggable,
    droppable: (_localDisabled$droppa = localDisabled == null ? void 0 : localDisabled.droppable) != null ? _localDisabled$droppa : globalDisabled.droppable
  };
}
function hasSortableData(entry) {
  if (!entry) {
    return false;
  }
  const data = entry.data.current;
  if (data && "sortable" in data && typeof data.sortable === "object" && "containerId" in data.sortable && "items" in data.sortable && "index" in data.sortable) {
    return true;
  }
  return false;
}
var directions = [KeyboardCode.Down, KeyboardCode.Right, KeyboardCode.Up, KeyboardCode.Left];
var sortableKeyboardCoordinates = (event, _ref) => {
  let {
    context: {
      active,
      collisionRect,
      droppableRects,
      droppableContainers,
      over,
      scrollableAncestors
    }
  } = _ref;
  if (directions.includes(event.code)) {
    event.preventDefault();
    if (!active || !collisionRect) {
      return;
    }
    const filteredContainers = [];
    droppableContainers.getEnabled().forEach((entry) => {
      if (!entry || entry != null && entry.disabled) {
        return;
      }
      const rect = droppableRects.get(entry.id);
      if (!rect) {
        return;
      }
      switch (event.code) {
        case KeyboardCode.Down:
          if (collisionRect.top < rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Up:
          if (collisionRect.top > rect.top) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Left:
          if (collisionRect.left > rect.left) {
            filteredContainers.push(entry);
          }
          break;
        case KeyboardCode.Right:
          if (collisionRect.left < rect.left) {
            filteredContainers.push(entry);
          }
          break;
      }
    });
    const collisions = closestCorners({
      active,
      collisionRect,
      droppableRects,
      droppableContainers: filteredContainers,
      pointerCoordinates: null
    });
    let closestId = getFirstCollision(collisions, "id");
    if (closestId === (over == null ? void 0 : over.id) && collisions.length > 1) {
      closestId = collisions[1].id;
    }
    if (closestId != null) {
      const activeDroppable = droppableContainers.get(active.id);
      const newDroppable = droppableContainers.get(closestId);
      const newRect = newDroppable ? droppableRects.get(newDroppable.id) : null;
      const newNode = newDroppable == null ? void 0 : newDroppable.node.current;
      if (newNode && newRect && activeDroppable && newDroppable) {
        const newScrollAncestors = getScrollableAncestors(newNode);
        const hasDifferentScrollAncestors = newScrollAncestors.some((element, index) => scrollableAncestors[index] !== element);
        const hasSameContainer = isSameContainer(activeDroppable, newDroppable);
        const isAfterActive = isAfter(activeDroppable, newDroppable);
        const offset = hasDifferentScrollAncestors || !hasSameContainer ? {
          x: 0,
          y: 0
        } : {
          x: isAfterActive ? collisionRect.width - newRect.width : 0,
          y: isAfterActive ? collisionRect.height - newRect.height : 0
        };
        const rectCoordinates = {
          x: newRect.left,
          y: newRect.top
        };
        const newCoordinates = offset.x && offset.y ? rectCoordinates : subtract(rectCoordinates, offset);
        return newCoordinates;
      }
    }
  }
  return void 0;
};
function isSameContainer(a, b) {
  if (!hasSortableData(a) || !hasSortableData(b)) {
    return false;
  }
  return a.data.current.sortable.containerId === b.data.current.sortable.containerId;
}
function isAfter(a, b) {
  if (!hasSortableData(a) || !hasSortableData(b)) {
    return false;
  }
  if (!isSameContainer(a, b)) {
    return false;
  }
  return a.data.current.sortable.index < b.data.current.sortable.index;
}

// src/components/kanban/TaskCard.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function TaskCard({
  task,
  isDragOverlay = false,
  className,
  onClick,
  bulkMode = false,
  isSelected = false,
  onSelect
}) {
  const setActiveContext = useWorkspaceContextStore((state) => state.setActiveContext);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task
    },
    disabled: isDragOverlay
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const handleCardClick = () => {
    setActiveContext("task", task.id);
    onClick?.();
  };
  const getPriorityColor = () => {
    switch (task.priority) {
      case "critical":
        return "border-l-krushr-priority-critical bg-red-50/30";
      case "high":
        return "border-l-krushr-priority-high bg-red-50/30";
      case "medium":
        return "border-l-krushr-priority-medium bg-orange-50/30";
      case "low":
        return "border-l-krushr-priority-low bg-green-50/30";
      default:
        return "border-l-gray-300 bg-white";
    }
  };
  const getPriorityLevel = () => {
    switch (task.priority?.toLowerCase()) {
      case "low":
        return 1;
      case "medium":
        return 2;
      case "high":
        return 3;
      case "critical":
        return 3;
      default:
        return 2;
    }
  };
  const renderPriorityDots = () => {
    const level = getPriorityLevel();
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center gap-0.5", title: `Priority: ${task.priority || "medium"}`, children: [1, 2, 3].map((dotIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        className: cn(
          "w-1.5 h-1.5 rounded-full transition-all duration-200",
          dotIndex <= level ? "bg-krushr-secondary" : "bg-gray-300"
        )
      },
      dotIndex
    )) });
  };
  const isOverdue = task.dueDate && new Date(task.dueDate) < /* @__PURE__ */ new Date();
  const isDueSoon = task.dueDate && new Date(task.dueDate) > /* @__PURE__ */ new Date() && new Date(task.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1e3);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    Card,
    {
      ref: setNodeRef,
      style,
      onClick: handleCardClick,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      },
      className: cn(
        "cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md border-l-4 group",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "min-h-[44px] touch-manipulation",
        getPriorityColor(),
        isDragging && "opacity-50 rotate-2 shadow-lg",
        isDragOverlay && "rotate-2 shadow-xl",
        isSelected && "ring-2 ring-krushr-primary bg-krushr-primary-50",
        bulkMode && "cursor-pointer",
        className
      ),
      role: "button",
      tabIndex: 0,
      "aria-label": `Task: ${task.title}${task.description ? ` - ${task.description.substring(0, 50)}...` : ""}`,
      ...attributes,
      ...listeners,
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start justify-between mb-3", children: [
          bulkMode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mr-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "checkbox",
              checked: isSelected,
              onChange: (e) => {
                e.stopPropagation();
                onSelect?.();
              },
              className: "w-5 h-5 min-w-[20px] min-h-[20px] text-krushr-primary border-krushr-gray-300 rounded focus:ring-krushr-primary focus:ring-2",
              "aria-label": `Select task: ${task.title}`,
              tabIndex: 0
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "font-medium text-gray-900 line-clamp-2 flex-1 font-brand", children: task.title }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "w-8 h-8 bg-krushr-gray-light text-krushr-gray-dark rounded-md flex items-center justify-center hover:bg-krushr-gray transition-colors opacity-0 group-hover:opacity-100 ml-2",
              "aria-label": `More options for ${task.title}`,
              tabIndex: 0,
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "w-4 h-4" })
            }
          )
        ] }),
        task.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            className: "text-sm text-gray-600 mb-3 line-clamp-2 font-manrope prose prose-sm max-w-none prose-p:my-0 prose-br:my-0",
            dangerouslySetInnerHTML: {
              __html: task.description.replace(/<p><\/p>/g, "").replace(/<p>/g, "").replace(/<\/p>/g, "<br>").replace(/<br>\s*$/, "")
              // Remove trailing br
            }
          }
        ),
        task.attachments && task.attachments.length > 0 && (() => {
          const imageAttachments = task.attachments.filter(
            (att) => att.mimeType?.startsWith("image/") && att.thumbnailUrl
          );
          if (imageAttachments.length > 0) {
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-3", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-wrap gap-1", children: [
              imageAttachments.slice(0, 3).map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "img",
                {
                  src: attachment.thumbnailUrl,
                  alt: attachment.filename,
                  className: "w-12 h-12 rounded object-cover border border-gray-200"
                },
                attachment.id
              )),
              imageAttachments.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs text-gray-600 font-medium font-manrope", children: [
                "+",
                imageAttachments.length - 3
              ] }) })
            ] }) });
          }
          return null;
        })(),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between text-xs text-gray-500 font-manrope", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center space-x-2", children: task.dueDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: cn(
            "flex items-center space-x-1",
            isOverdue && "text-krushr-secondary",
            isDueSoon && "text-amber-600"
          ), children: [
            isOverdue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "w-3 h-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "w-3 h-3" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-medium", children: formatDate(task.dueDate) })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1.5", children: [
            (task._count?.comments || 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1 text-gray-500", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "w-3 h-3" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: task._count.comments })
            ] }),
            (task._count?.attachments || 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1 text-gray-500", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "w-3 h-3" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: task._count.attachments })
            ] }),
            task.checklists && task.checklists.length > 0 && (() => {
              const totalItems = task.checklists.reduce((acc, checklist) => acc + (checklist.items?.length || 0), 0);
              const completedItems = task.checklists.reduce((acc, checklist) => acc + (checklist.items?.filter((item) => item.completed).length || 0), 0);
              return totalItems > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: cn(
                "flex items-center space-x-1",
                completedItems === totalItems ? "text-emerald-600" : "text-gray-500"
              ), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquareCheckBig, { className: "w-3 h-3" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  completedItems,
                  "/",
                  totalItems
                ] })
              ] }) : null;
            })()
          ] })
        ] }),
        task.assignee && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center justify-between mt-2 pt-2 border-t border-gray-100", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2 min-w-0 flex-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, { className: "w-5 h-5 border border-white", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, { src: task.assignee.avatar || void 0 }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { className: "text-[10px] bg-gradient-to-br from-krushr-secondary to-krushr-secondary/80 text-white font-medium", children: task.assignee.name.split(" ").map((n) => n[0]).join("").toUpperCase() })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs text-gray-600 truncate", children: task.assignee.name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-gray-300 text-xs", children: "\u2022" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1 text-gray-400", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3 h-3" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs", children: [
              task.estimatedHours || 0,
              "h"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-gray-300 text-xs", children: "\u2022" }),
          renderPriorityDots(),
          task.tags && task.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-gray-300 text-xs", children: "\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
              task.tags.slice(0, 2).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Badge,
                {
                  variant: "secondary",
                  className: "px-1.5 py-0.5 text-xs font-medium",
                  children: typeof tag === "string" ? tag : tag.name
                },
                typeof tag === "string" ? tag : tag.id
              )),
              task.tags.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { variant: "secondary", className: "px-1.5 py-0.5 text-xs font-medium", children: [
                "+",
                task.tags.length - 2
              ] })
            ] })
          ] })
        ] }) }),
        !task.assignee && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center mt-2 pt-2 border-t border-gray-100", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2 text-gray-400", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "w-3 h-3" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs", children: "Unassigned" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-gray-300 text-xs", children: "\u2022" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3 h-3" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs", children: [
              task.estimatedHours || 0,
              "h"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-gray-300 text-xs", children: "\u2022" }),
          renderPriorityDots(),
          task.tags && task.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-gray-300 text-xs", children: "\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
              task.tags.slice(0, 2).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Badge,
                {
                  variant: "secondary",
                  className: "px-1.5 py-0.5 text-xs font-medium",
                  children: typeof tag === "string" ? tag : tag.name
                },
                typeof tag === "string" ? tag : tag.id
              )),
              task.tags.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { variant: "secondary", className: "px-1.5 py-0.5 text-xs font-medium", children: [
                "+",
                task.tags.length - 2
              ] })
            ] })
          ] })
        ] }) })
      ] })
    }
  );
}

// src/components/kanban/KanbanColumn.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function KanbanColumnComponent({
  column,
  tasks,
  taskCount,
  className,
  onTaskClick,
  onAddTask,
  bulkMode = false,
  selectedTasks = /* @__PURE__ */ new Set(),
  onTaskSelect,
  onEditColumn,
  onDeleteColumn
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column
    }
  });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      accepts: ["task"]
    }
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const getColumnColor = () => {
    if (column.color) {
      return "";
    }
    if (column.isCompletedColumn) {
      return "bg-emerald-500";
    }
    const colors = [
      "bg-gray-500",
      // To Do
      "bg-krushr-secondary",
      // In Progress  
      "bg-amber-500",
      // Review
      "bg-emerald-500"
      // Done
    ];
    return colors[column.position % colors.length] || "bg-krushr-blue";
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      ref: (node) => {
        setSortableRef(node);
        setDroppableRef(node);
      },
      style,
      className: cn(
        "flex flex-col w-80 h-full transition-all duration-200",
        isDragging && "opacity-50 scale-105",
        isOver && "ring-2 ring-krushr-secondary ring-opacity-50",
        className
      ),
      ...attributes,
      children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Card, { className: cn(
        "flex flex-col h-full bg-white transition-all duration-200",
        isOver && "bg-krushr-secondary/5 border-krushr-secondary/20"
      ), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          CardHeader,
          {
            className: "flex-shrink-0 py-2 cursor-grab active:cursor-grabbing",
            ...listeners,
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center space-x-2 min-w-0 flex-1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "div",
                  {
                    className: cn("w-3 h-3 rounded-full border flex-shrink-0", !column.color && getColumnColor()),
                    style: column.color ? { backgroundColor: column.color } : {},
                    role: "presentation",
                    "aria-hidden": "true"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: "font-semibold text-gray-900 text-sm truncate font-brand", role: "heading", "aria-level": "3", children: column.title }),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                  Badge,
                  {
                    variant: "secondary",
                    className: cn(
                      "text-xs min-h-[18px] px-1.5 flex-shrink-0 bg-krushr-coral-red text-white",
                      column.wipLimit && taskCount > column.wipLimit && "bg-red-100 text-red-700 border-red-200"
                    ),
                    role: "status",
                    "aria-label": `${taskCount} tasks${column.wipLimit ? ` out of ${column.wipLimit} limit` : ""}`,
                    children: [
                      taskCount,
                      column.wipLimit ? `/${column.wipLimit}` : ""
                    ]
                  }
                ),
                column.wipLimit && taskCount > column.wipLimit && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { variant: "outline", className: "text-xs text-red-700 border-red-200 px-1.5 py-0 flex-shrink-0 font-manrope", children: "WIP!" }),
                column.isCompletedColumn && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { variant: "outline", className: "text-xs text-green-700 border-green-200 px-1.5 py-0 flex-shrink-0 font-manrope", children: "\u2713" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center space-x-2 flex-shrink-0", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  Settings,
                  {
                    className: "w-4 h-4 text-krushr-gray-500 hover:text-krushr-primary cursor-pointer transition-colors",
                    onClick: onEditColumn,
                    title: "Column settings"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  Plus,
                  {
                    className: "w-4 h-4 text-krushr-gray-500 hover:text-krushr-primary cursor-pointer transition-colors",
                    onClick: onAddTask,
                    title: "Add task"
                  }
                )
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CardContent, { className: "flex-1 p-3 pt-0 overflow-y-auto", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "space-y-3", children: [
          tasks.map((task) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            TaskCard,
            {
              task,
              onClick: () => onTaskClick?.(task.id),
              bulkMode,
              isSelected: selectedTasks.has(task.id),
              onSelect: () => onTaskSelect?.(task.id)
            },
            task.id
          )),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            Button,
            {
              variant: "ghost",
              className: cn(
                "w-full h-12 min-h-[44px] border-2 border-dashed transition-all duration-200",
                "border-gray-200 hover:border-krushr-secondary/30 hover:bg-krushr-secondary/5",
                "focus:border-krushr-secondary/50 focus:bg-krushr-secondary/10 focus:ring-2 focus:ring-krushr-secondary",
                "text-gray-500 hover:text-krushr-secondary focus:text-krushr-secondary",
                "touch-manipulation",
                isOver && "border-krushr-secondary/50 bg-krushr-secondary/10 text-krushr-secondary"
              ),
              onClick: onAddTask,
              "aria-label": `Add new task to ${column.title} column`,
              tabIndex: 0,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Plus, { className: "w-5 h-5 mr-2" }),
                "Add a task"
              ]
            }
          )
        ] }) })
      ] })
    }
  );
}

// ../node_modules/date-fns/compareAsc.mjs
function compareAsc(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const diff = _dateLeft.getTime() - _dateRight.getTime();
  if (diff < 0) {
    return -1;
  } else if (diff > 0) {
    return 1;
  } else {
    return diff;
  }
}

// ../node_modules/date-fns/differenceInCalendarMonths.mjs
function differenceInCalendarMonths(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const yearDiff = _dateLeft.getFullYear() - _dateRight.getFullYear();
  const monthDiff = _dateLeft.getMonth() - _dateRight.getMonth();
  return yearDiff * 12 + monthDiff;
}

// ../node_modules/date-fns/_lib/getRoundingMethod.mjs
function getRoundingMethod(method) {
  return (number) => {
    const round = method ? Math[method] : Math.trunc;
    const result = round(number);
    return result === 0 ? 0 : result;
  };
}

// ../node_modules/date-fns/differenceInMilliseconds.mjs
function differenceInMilliseconds(dateLeft, dateRight) {
  return +toDate(dateLeft) - +toDate(dateRight);
}

// ../node_modules/date-fns/isLastDayOfMonth.mjs
function isLastDayOfMonth(date) {
  const _date = toDate(date);
  return +endOfDay(_date) === +endOfMonth(_date);
}

// ../node_modules/date-fns/differenceInMonths.mjs
function differenceInMonths(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const sign = compareAsc(_dateLeft, _dateRight);
  const difference = Math.abs(
    differenceInCalendarMonths(_dateLeft, _dateRight)
  );
  let result;
  if (difference < 1) {
    result = 0;
  } else {
    if (_dateLeft.getMonth() === 1 && _dateLeft.getDate() > 27) {
      _dateLeft.setDate(30);
    }
    _dateLeft.setMonth(_dateLeft.getMonth() - sign * difference);
    let isLastMonthNotFull = compareAsc(_dateLeft, _dateRight) === -sign;
    if (isLastDayOfMonth(toDate(dateLeft)) && difference === 1 && compareAsc(dateLeft, _dateRight) === 1) {
      isLastMonthNotFull = false;
    }
    result = sign * (difference - Number(isLastMonthNotFull));
  }
  return result === 0 ? 0 : result;
}

// ../node_modules/date-fns/differenceInSeconds.mjs
function differenceInSeconds(dateLeft, dateRight, options) {
  const diff = differenceInMilliseconds(dateLeft, dateRight) / 1e3;
  return getRoundingMethod(options?.roundingMethod)(diff);
}

// ../node_modules/date-fns/formatDistance.mjs
function formatDistance(date, baseDate, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
  const minutesInAlmostTwoDays = 2520;
  const comparison = compareAsc(date, baseDate);
  if (isNaN(comparison)) {
    throw new RangeError("Invalid time value");
  }
  const localizeOptions = Object.assign({}, options, {
    addSuffix: options?.addSuffix,
    comparison
  });
  let dateLeft;
  let dateRight;
  if (comparison > 0) {
    dateLeft = toDate(baseDate);
    dateRight = toDate(date);
  } else {
    dateLeft = toDate(date);
    dateRight = toDate(baseDate);
  }
  const seconds = differenceInSeconds(dateRight, dateLeft);
  const offsetInSeconds = (getTimezoneOffsetInMilliseconds(dateRight) - getTimezoneOffsetInMilliseconds(dateLeft)) / 1e3;
  const minutes = Math.round((seconds - offsetInSeconds) / 60);
  let months;
  if (minutes < 2) {
    if (options?.includeSeconds) {
      if (seconds < 5) {
        return locale.formatDistance("lessThanXSeconds", 5, localizeOptions);
      } else if (seconds < 10) {
        return locale.formatDistance("lessThanXSeconds", 10, localizeOptions);
      } else if (seconds < 20) {
        return locale.formatDistance("lessThanXSeconds", 20, localizeOptions);
      } else if (seconds < 40) {
        return locale.formatDistance("halfAMinute", 0, localizeOptions);
      } else if (seconds < 60) {
        return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
      } else {
        return locale.formatDistance("xMinutes", 1, localizeOptions);
      }
    } else {
      if (minutes === 0) {
        return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
      } else {
        return locale.formatDistance("xMinutes", minutes, localizeOptions);
      }
    }
  } else if (minutes < 45) {
    return locale.formatDistance("xMinutes", minutes, localizeOptions);
  } else if (minutes < 90) {
    return locale.formatDistance("aboutXHours", 1, localizeOptions);
  } else if (minutes < minutesInDay) {
    const hours = Math.round(minutes / 60);
    return locale.formatDistance("aboutXHours", hours, localizeOptions);
  } else if (minutes < minutesInAlmostTwoDays) {
    return locale.formatDistance("xDays", 1, localizeOptions);
  } else if (minutes < minutesInMonth) {
    const days = Math.round(minutes / minutesInDay);
    return locale.formatDistance("xDays", days, localizeOptions);
  } else if (minutes < minutesInMonth * 2) {
    months = Math.round(minutes / minutesInMonth);
    return locale.formatDistance("aboutXMonths", months, localizeOptions);
  }
  months = differenceInMonths(dateRight, dateLeft);
  if (months < 12) {
    const nearestMonth = Math.round(minutes / minutesInMonth);
    return locale.formatDistance("xMonths", nearestMonth, localizeOptions);
  } else {
    const monthsSinceStartOfYear = months % 12;
    const years = Math.trunc(months / 12);
    if (monthsSinceStartOfYear < 3) {
      return locale.formatDistance("aboutXYears", years, localizeOptions);
    } else if (monthsSinceStartOfYear < 9) {
      return locale.formatDistance("overXYears", years, localizeOptions);
    } else {
      return locale.formatDistance("almostXYears", years + 1, localizeOptions);
    }
  }
}

// ../node_modules/date-fns/formatDistanceToNow.mjs
function formatDistanceToNow(date, options) {
  return formatDistance(date, constructNow(date), options);
}

// src/components/task/TaskDetail.tsx
var import_react11 = __toESM(require_react(), 1);

// src/components/ui/sheet.tsx
var React14 = __toESM(require_react(), 1);

// ../node_modules/@radix-ui/react-dialog/dist/index.mjs
var React13 = __toESM(require_react(), 1);

// ../node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var React4 = __toESM(require_react(), 1);
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var FOCUS_SCOPE_NAME = "FocusScope";
var FocusScope = React4.forwardRef((props, forwardedRef) => {
  const {
    loop = false,
    trapped = false,
    onMountAutoFocus: onMountAutoFocusProp,
    onUnmountAutoFocus: onUnmountAutoFocusProp,
    ...scopeProps
  } = props;
  const [container, setContainer] = React4.useState(null);
  const onMountAutoFocus = useCallbackRef(onMountAutoFocusProp);
  const onUnmountAutoFocus = useCallbackRef(onUnmountAutoFocusProp);
  const lastFocusedElementRef = React4.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, (node) => setContainer(node));
  const focusScope = React4.useRef({
    paused: false,
    pause() {
      this.paused = true;
    },
    resume() {
      this.paused = false;
    }
  }).current;
  React4.useEffect(() => {
    if (trapped) {
      let handleFocusIn2 = function(event) {
        if (focusScope.paused || !container) return;
        const target = event.target;
        if (container.contains(target)) {
          lastFocusedElementRef.current = target;
        } else {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }, handleFocusOut2 = function(event) {
        if (focusScope.paused || !container) return;
        const relatedTarget = event.relatedTarget;
        if (relatedTarget === null) return;
        if (!container.contains(relatedTarget)) {
          focus(lastFocusedElementRef.current, { select: true });
        }
      }, handleMutations2 = function(mutations) {
        const focusedElement = document.activeElement;
        if (focusedElement !== document.body) return;
        for (const mutation of mutations) {
          if (mutation.removedNodes.length > 0) focus(container);
        }
      };
      var handleFocusIn = handleFocusIn2, handleFocusOut = handleFocusOut2, handleMutations = handleMutations2;
      document.addEventListener("focusin", handleFocusIn2);
      document.addEventListener("focusout", handleFocusOut2);
      const mutationObserver = new MutationObserver(handleMutations2);
      if (container) mutationObserver.observe(container, { childList: true, subtree: true });
      return () => {
        document.removeEventListener("focusin", handleFocusIn2);
        document.removeEventListener("focusout", handleFocusOut2);
        mutationObserver.disconnect();
      };
    }
  }, [trapped, container, focusScope.paused]);
  React4.useEffect(() => {
    if (container) {
      focusScopesStack.add(focusScope);
      const previouslyFocusedElement = document.activeElement;
      const hasFocusedCandidate = container.contains(previouslyFocusedElement);
      if (!hasFocusedCandidate) {
        const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
        container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        container.dispatchEvent(mountEvent);
        if (!mountEvent.defaultPrevented) {
          focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
          if (document.activeElement === previouslyFocusedElement) {
            focus(container);
          }
        }
      }
      return () => {
        container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
        setTimeout(() => {
          const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
          container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          container.dispatchEvent(unmountEvent);
          if (!unmountEvent.defaultPrevented) {
            focus(previouslyFocusedElement ?? document.body, { select: true });
          }
          container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
          focusScopesStack.remove(focusScope);
        }, 0);
      };
    }
  }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope]);
  const handleKeyDown = React4.useCallback(
    (event) => {
      if (!loop && !trapped) return;
      if (focusScope.paused) return;
      const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
      const focusedElement = document.activeElement;
      if (isTabKey && focusedElement) {
        const container2 = event.currentTarget;
        const [first, last] = getTabbableEdges(container2);
        const hasTabbableElementsInside = first && last;
        if (!hasTabbableElementsInside) {
          if (focusedElement === container2) event.preventDefault();
        } else {
          if (!event.shiftKey && focusedElement === last) {
            event.preventDefault();
            if (loop) focus(first, { select: true });
          } else if (event.shiftKey && focusedElement === first) {
            event.preventDefault();
            if (loop) focus(last, { select: true });
          }
        }
      }
    },
    [loop, trapped, focusScope.paused]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Primitive.div, { tabIndex: -1, ...scopeProps, ref: composedRefs, onKeyDown: handleKeyDown });
});
FocusScope.displayName = FOCUS_SCOPE_NAME;
function focusFirst(candidates, { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}
function getTabbableEdges(container) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last];
}
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
function findVisible(elements, container) {
  for (const element of elements) {
    if (!isHidden(element, { upTo: container })) return element;
  }
}
function isHidden(node, { upTo }) {
  if (getComputedStyle(node).visibility === "hidden") return true;
  while (node) {
    if (upTo !== void 0 && node === upTo) return false;
    if (getComputedStyle(node).display === "none") return true;
    node = node.parentElement;
  }
  return false;
}
function isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
function focus(element, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({ preventScroll: true });
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
      element.select();
  }
}
var focusScopesStack = createFocusScopesStack();
function createFocusScopesStack() {
  let stack = [];
  return {
    add(focusScope) {
      const activeFocusScope = stack[0];
      if (focusScope !== activeFocusScope) {
        activeFocusScope?.pause();
      }
      stack = arrayRemove(stack, focusScope);
      stack.unshift(focusScope);
    },
    remove(focusScope) {
      stack = arrayRemove(stack, focusScope);
      stack[0]?.resume();
    }
  };
}
function arrayRemove(array, item) {
  const updatedArray = [...array];
  const index = updatedArray.indexOf(item);
  if (index !== -1) {
    updatedArray.splice(index, 1);
  }
  return updatedArray;
}
function removeLinks(items) {
  return items.filter((item) => item.tagName !== "A");
}

// ../node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var React5 = __toESM(require_react(), 1);
var count = 0;
function useFocusGuards() {
  React5.useEffect(() => {
    const edgeGuards = document.querySelectorAll("[data-radix-focus-guard]");
    document.body.insertAdjacentElement("afterbegin", edgeGuards[0] ?? createFocusGuard());
    document.body.insertAdjacentElement("beforeend", edgeGuards[1] ?? createFocusGuard());
    count++;
    return () => {
      if (count === 1) {
        document.querySelectorAll("[data-radix-focus-guard]").forEach((node) => node.remove());
      }
      count--;
    };
  }, []);
}
function createFocusGuard() {
  const element = document.createElement("span");
  element.setAttribute("data-radix-focus-guard", "");
  element.tabIndex = 0;
  element.style.outline = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.pointerEvents = "none";
  return element;
}

// ../node_modules/tslib/tslib.es6.mjs
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

// ../node_modules/react-remove-scroll/dist/es2015/Combination.js
var React12 = __toESM(require_react());

// ../node_modules/react-remove-scroll/dist/es2015/UI.js
var React8 = __toESM(require_react());

// ../node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var zeroRightClassName = "right-scroll-bar-position";
var fullWidthClassName = "width-before-scroll-bar";
var noScrollbarsClassName = "with-scroll-bars-hidden";
var removedBarSizeVariable = "--removed-body-scroll-bar-size";

// ../node_modules/use-callback-ref/dist/es2015/assignRef.js
function assignRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
  return ref;
}

// ../node_modules/use-callback-ref/dist/es2015/useRef.js
var import_react5 = __toESM(require_react());
function useCallbackRef2(initialValue, callback) {
  var ref = (0, import_react5.useState)(function() {
    return {
      // value
      value: initialValue,
      // last callback
      callback,
      // "memoized" public interface
      facade: {
        get current() {
          return ref.value;
        },
        set current(value) {
          var last = ref.value;
          if (last !== value) {
            ref.value = value;
            ref.callback(value, last);
          }
        }
      }
    };
  })[0];
  ref.callback = callback;
  return ref.facade;
}

// ../node_modules/use-callback-ref/dist/es2015/useMergeRef.js
var React6 = __toESM(require_react());
var useIsomorphicLayoutEffect2 = typeof window !== "undefined" ? React6.useLayoutEffect : React6.useEffect;
var currentValues = /* @__PURE__ */ new WeakMap();
function useMergeRefs(refs, defaultValue2) {
  var callbackRef = useCallbackRef2(defaultValue2 || null, function(newValue) {
    return refs.forEach(function(ref) {
      return assignRef(ref, newValue);
    });
  });
  useIsomorphicLayoutEffect2(function() {
    var oldValue = currentValues.get(callbackRef);
    if (oldValue) {
      var prevRefs_1 = new Set(oldValue);
      var nextRefs_1 = new Set(refs);
      var current_1 = callbackRef.current;
      prevRefs_1.forEach(function(ref) {
        if (!nextRefs_1.has(ref)) {
          assignRef(ref, null);
        }
      });
      nextRefs_1.forEach(function(ref) {
        if (!prevRefs_1.has(ref)) {
          assignRef(ref, current_1);
        }
      });
    }
    currentValues.set(callbackRef, refs);
  }, [refs]);
  return callbackRef;
}

// ../node_modules/use-sidecar/dist/es2015/medium.js
function ItoI(a) {
  return a;
}
function innerCreateMedium(defaults, middleware) {
  if (middleware === void 0) {
    middleware = ItoI;
  }
  var buffer = [];
  var assigned = false;
  var medium = {
    read: function() {
      if (assigned) {
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      }
      if (buffer.length) {
        return buffer[buffer.length - 1];
      }
      return defaults;
    },
    useMedium: function(data) {
      var item = middleware(data, assigned);
      buffer.push(item);
      return function() {
        buffer = buffer.filter(function(x) {
          return x !== item;
        });
      };
    },
    assignSyncMedium: function(cb) {
      assigned = true;
      while (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb);
      }
      buffer = {
        push: function(x) {
          return cb(x);
        },
        filter: function() {
          return buffer;
        }
      };
    },
    assignMedium: function(cb) {
      assigned = true;
      var pendingQueue = [];
      if (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb);
        pendingQueue = buffer;
      }
      var executeQueue = function() {
        var cbs2 = pendingQueue;
        pendingQueue = [];
        cbs2.forEach(cb);
      };
      var cycle = function() {
        return Promise.resolve().then(executeQueue);
      };
      cycle();
      buffer = {
        push: function(x) {
          pendingQueue.push(x);
          cycle();
        },
        filter: function(filter) {
          pendingQueue = pendingQueue.filter(filter);
          return buffer;
        }
      };
    }
  };
  return medium;
}
function createSidecarMedium(options) {
  if (options === void 0) {
    options = {};
  }
  var medium = innerCreateMedium(null);
  medium.options = __assign({ async: true, ssr: false }, options);
  return medium;
}

// ../node_modules/use-sidecar/dist/es2015/exports.js
var React7 = __toESM(require_react());
var SideCar = function(_a) {
  var sideCar = _a.sideCar, rest = __rest(_a, ["sideCar"]);
  if (!sideCar) {
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  }
  var Target = sideCar.read();
  if (!Target) {
    throw new Error("Sidecar medium not found");
  }
  return React7.createElement(Target, __assign({}, rest));
};
SideCar.isSideCarExport = true;
function exportSidecar(medium, exported) {
  medium.useMedium(exported);
  return SideCar;
}

// ../node_modules/react-remove-scroll/dist/es2015/medium.js
var effectCar = createSidecarMedium();

// ../node_modules/react-remove-scroll/dist/es2015/UI.js
var nothing = function() {
  return;
};
var RemoveScroll = React8.forwardRef(function(props, parentRef) {
  var ref = React8.useRef(null);
  var _a = React8.useState({
    onScrollCapture: nothing,
    onWheelCapture: nothing,
    onTouchMoveCapture: nothing
  }), callbacks = _a[0], setCallbacks = _a[1];
  var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noRelative = props.noRelative, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, gapMode = props.gapMode, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]);
  var SideCar2 = sideCar;
  var containerRef = useMergeRefs([ref, parentRef]);
  var containerProps = __assign(__assign({}, rest), callbacks);
  return React8.createElement(
    React8.Fragment,
    null,
    enabled && React8.createElement(SideCar2, { sideCar: effectCar, removeScrollBar, shards, noRelative, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref, gapMode }),
    forwardProps ? React8.cloneElement(React8.Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : React8.createElement(Container, __assign({}, containerProps, { className, ref: containerRef }), children)
  );
});
RemoveScroll.defaultProps = {
  enabled: true,
  removeScrollBar: true,
  inert: false
};
RemoveScroll.classNames = {
  fullWidth: fullWidthClassName,
  zeroRight: zeroRightClassName
};

// ../node_modules/react-remove-scroll/dist/es2015/SideEffect.js
var React11 = __toESM(require_react());

// ../node_modules/react-remove-scroll-bar/dist/es2015/component.js
var React10 = __toESM(require_react());

// ../node_modules/react-style-singleton/dist/es2015/hook.js
var React9 = __toESM(require_react());

// ../node_modules/get-nonce/dist/es2015/index.js
var currentNonce;
var getNonce = function() {
  if (currentNonce) {
    return currentNonce;
  }
  if (typeof __webpack_nonce__ !== "undefined") {
    return __webpack_nonce__;
  }
  return void 0;
};

// ../node_modules/react-style-singleton/dist/es2015/singleton.js
function makeStyleTag() {
  if (!document)
    return null;
  var tag = document.createElement("style");
  tag.type = "text/css";
  var nonce = getNonce();
  if (nonce) {
    tag.setAttribute("nonce", nonce);
  }
  return tag;
}
function injectStyles(tag, css) {
  if (tag.styleSheet) {
    tag.styleSheet.cssText = css;
  } else {
    tag.appendChild(document.createTextNode(css));
  }
}
function insertStyleTag(tag) {
  var head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(tag);
}
var stylesheetSingleton = function() {
  var counter = 0;
  var stylesheet = null;
  return {
    add: function(style) {
      if (counter == 0) {
        if (stylesheet = makeStyleTag()) {
          injectStyles(stylesheet, style);
          insertStyleTag(stylesheet);
        }
      }
      counter++;
    },
    remove: function() {
      counter--;
      if (!counter && stylesheet) {
        stylesheet.parentNode && stylesheet.parentNode.removeChild(stylesheet);
        stylesheet = null;
      }
    }
  };
};

// ../node_modules/react-style-singleton/dist/es2015/hook.js
var styleHookSingleton = function() {
  var sheet = stylesheetSingleton();
  return function(styles, isDynamic) {
    React9.useEffect(function() {
      sheet.add(styles);
      return function() {
        sheet.remove();
      };
    }, [styles && isDynamic]);
  };
};

// ../node_modules/react-style-singleton/dist/es2015/component.js
var styleSingleton = function() {
  var useStyle = styleHookSingleton();
  var Sheet2 = function(_a) {
    var styles = _a.styles, dynamic = _a.dynamic;
    useStyle(styles, dynamic);
    return null;
  };
  return Sheet2;
};

// ../node_modules/react-remove-scroll-bar/dist/es2015/utils.js
var zeroGap = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
};
var parse = function(x) {
  return parseInt(x || "", 10) || 0;
};
var getOffset = function(gapMode) {
  var cs = window.getComputedStyle(document.body);
  var left = cs[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
  var top = cs[gapMode === "padding" ? "paddingTop" : "marginTop"];
  var right = cs[gapMode === "padding" ? "paddingRight" : "marginRight"];
  return [parse(left), parse(top), parse(right)];
};
var getGapWidth = function(gapMode) {
  if (gapMode === void 0) {
    gapMode = "margin";
  }
  if (typeof window === "undefined") {
    return zeroGap;
  }
  var offsets = getOffset(gapMode);
  var documentWidth = document.documentElement.clientWidth;
  var windowWidth = window.innerWidth;
  return {
    left: offsets[0],
    top: offsets[1],
    right: offsets[2],
    gap: Math.max(0, windowWidth - documentWidth + offsets[2] - offsets[0])
  };
};

// ../node_modules/react-remove-scroll-bar/dist/es2015/component.js
var Style = styleSingleton();
var lockAttribute = "data-scroll-locked";
var getStyles = function(_a, allowRelative, gapMode, important) {
  var left = _a.left, top = _a.top, right = _a.right, gap = _a.gap;
  if (gapMode === void 0) {
    gapMode = "margin";
  }
  return "\n  .".concat(noScrollbarsClassName, " {\n   overflow: hidden ").concat(important, ";\n   padding-right: ").concat(gap, "px ").concat(important, ";\n  }\n  body[").concat(lockAttribute, "] {\n    overflow: hidden ").concat(important, ";\n    overscroll-behavior: contain;\n    ").concat([
    allowRelative && "position: relative ".concat(important, ";"),
    gapMode === "margin" && "\n    padding-left: ".concat(left, "px;\n    padding-top: ").concat(top, "px;\n    padding-right: ").concat(right, "px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(gap, "px ").concat(important, ";\n    "),
    gapMode === "padding" && "padding-right: ".concat(gap, "px ").concat(important, ";")
  ].filter(Boolean).join(""), "\n  }\n  \n  .").concat(zeroRightClassName, " {\n    right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " {\n    margin-right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(zeroRightClassName, " .").concat(zeroRightClassName, " {\n    right: 0 ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " .").concat(fullWidthClassName, " {\n    margin-right: 0 ").concat(important, ";\n  }\n  \n  body[").concat(lockAttribute, "] {\n    ").concat(removedBarSizeVariable, ": ").concat(gap, "px;\n  }\n");
};
var getCurrentUseCounter = function() {
  var counter = parseInt(document.body.getAttribute(lockAttribute) || "0", 10);
  return isFinite(counter) ? counter : 0;
};
var useLockAttribute = function() {
  React10.useEffect(function() {
    document.body.setAttribute(lockAttribute, (getCurrentUseCounter() + 1).toString());
    return function() {
      var newCounter = getCurrentUseCounter() - 1;
      if (newCounter <= 0) {
        document.body.removeAttribute(lockAttribute);
      } else {
        document.body.setAttribute(lockAttribute, newCounter.toString());
      }
    };
  }, []);
};
var RemoveScrollBar = function(_a) {
  var noRelative = _a.noRelative, noImportant = _a.noImportant, _b = _a.gapMode, gapMode = _b === void 0 ? "margin" : _b;
  useLockAttribute();
  var gap = React10.useMemo(function() {
    return getGapWidth(gapMode);
  }, [gapMode]);
  return React10.createElement(Style, { styles: getStyles(gap, !noRelative, gapMode, !noImportant ? "!important" : "") });
};

// ../node_modules/react-remove-scroll/dist/es2015/aggresiveCapture.js
var passiveSupported = false;
if (typeof window !== "undefined") {
  try {
    options = Object.defineProperty({}, "passive", {
      get: function() {
        passiveSupported = true;
        return true;
      }
    });
    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (err) {
    passiveSupported = false;
  }
}
var options;
var nonPassive = passiveSupported ? { passive: false } : false;

// ../node_modules/react-remove-scroll/dist/es2015/handleScroll.js
var alwaysContainsScroll = function(node) {
  return node.tagName === "TEXTAREA";
};
var elementCanBeScrolled = function(node, overflow) {
  if (!(node instanceof Element)) {
    return false;
  }
  var styles = window.getComputedStyle(node);
  return (
    // not-not-scrollable
    styles[overflow] !== "hidden" && // contains scroll inside self
    !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node) && styles[overflow] === "visible")
  );
};
var elementCouldBeVScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowY");
};
var elementCouldBeHScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowX");
};
var locationCouldBeScrolled = function(axis, node) {
  var ownerDocument = node.ownerDocument;
  var current = node;
  do {
    if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
      current = current.host;
    }
    var isScrollable2 = elementCouldBeScrolled(axis, current);
    if (isScrollable2) {
      var _a = getScrollVariables(axis, current), scrollHeight = _a[1], clientHeight = _a[2];
      if (scrollHeight > clientHeight) {
        return true;
      }
    }
    current = current.parentNode;
  } while (current && current !== ownerDocument.body);
  return false;
};
var getVScrollVariables = function(_a) {
  var scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
  return [
    scrollTop,
    scrollHeight,
    clientHeight
  ];
};
var getHScrollVariables = function(_a) {
  var scrollLeft = _a.scrollLeft, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
  return [
    scrollLeft,
    scrollWidth,
    clientWidth
  ];
};
var elementCouldBeScrolled = function(axis, node) {
  return axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node);
};
var getScrollVariables = function(axis, node) {
  return axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node);
};
var getDirectionFactor = function(axis, direction) {
  return axis === "h" && direction === "rtl" ? -1 : 1;
};
var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
  var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
  var delta = directionFactor * sourceDelta;
  var target = event.target;
  var targetInLock = endTarget.contains(target);
  var shouldCancelScroll = false;
  var isDeltaPositive = delta > 0;
  var availableScroll = 0;
  var availableScrollTop = 0;
  do {
    if (!target) {
      break;
    }
    var _a = getScrollVariables(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
    var elementScroll = scroll_1 - capacity - directionFactor * position;
    if (position || elementScroll) {
      if (elementCouldBeScrolled(axis, target)) {
        availableScroll += elementScroll;
        availableScrollTop += position;
      }
    }
    var parent_1 = target.parentNode;
    target = parent_1 && parent_1.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? parent_1.host : parent_1;
  } while (
    // portaled content
    !targetInLock && target !== document.body || // self content
    targetInLock && (endTarget.contains(target) || endTarget === target)
  );
  if (isDeltaPositive && (noOverscroll && Math.abs(availableScroll) < 1 || !noOverscroll && delta > availableScroll)) {
    shouldCancelScroll = true;
  } else if (!isDeltaPositive && (noOverscroll && Math.abs(availableScrollTop) < 1 || !noOverscroll && -delta > availableScrollTop)) {
    shouldCancelScroll = true;
  }
  return shouldCancelScroll;
};

// ../node_modules/react-remove-scroll/dist/es2015/SideEffect.js
var getTouchXY = function(event) {
  return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
};
var getDeltaXY = function(event) {
  return [event.deltaX, event.deltaY];
};
var extractRef = function(ref) {
  return ref && "current" in ref ? ref.current : ref;
};
var deltaCompare = function(x, y) {
  return x[0] === y[0] && x[1] === y[1];
};
var generateStyle = function(id) {
  return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
};
var idCounter = 0;
var lockStack = [];
function RemoveScrollSideCar(props) {
  var shouldPreventQueue = React11.useRef([]);
  var touchStartRef = React11.useRef([0, 0]);
  var activeAxis = React11.useRef();
  var id = React11.useState(idCounter++)[0];
  var Style2 = React11.useState(styleSingleton)[0];
  var lastProps = React11.useRef(props);
  React11.useEffect(function() {
    lastProps.current = props;
  }, [props]);
  React11.useEffect(function() {
    if (props.inert) {
      document.body.classList.add("block-interactivity-".concat(id));
      var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef), true).filter(Boolean);
      allow_1.forEach(function(el) {
        return el.classList.add("allow-interactivity-".concat(id));
      });
      return function() {
        document.body.classList.remove("block-interactivity-".concat(id));
        allow_1.forEach(function(el) {
          return el.classList.remove("allow-interactivity-".concat(id));
        });
      };
    }
    return;
  }, [props.inert, props.lockRef.current, props.shards]);
  var shouldCancelEvent = React11.useCallback(function(event, parent) {
    if ("touches" in event && event.touches.length === 2 || event.type === "wheel" && event.ctrlKey) {
      return !lastProps.current.allowPinchZoom;
    }
    var touch = getTouchXY(event);
    var touchStart = touchStartRef.current;
    var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
    var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
    var currentAxis;
    var target = event.target;
    var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
    if ("touches" in event && moveDirection === "h" && target.type === "range") {
      return false;
    }
    var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    if (!canBeScrolledInMainDirection) {
      return true;
    }
    if (canBeScrolledInMainDirection) {
      currentAxis = moveDirection;
    } else {
      currentAxis = moveDirection === "v" ? "h" : "v";
      canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    }
    if (!canBeScrolledInMainDirection) {
      return false;
    }
    if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
      activeAxis.current = currentAxis;
    }
    if (!currentAxis) {
      return true;
    }
    var cancelingAxis = activeAxis.current || currentAxis;
    return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY, true);
  }, []);
  var shouldPrevent = React11.useCallback(function(_event) {
    var event = _event;
    if (!lockStack.length || lockStack[lockStack.length - 1] !== Style2) {
      return;
    }
    var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
    var sourceEvent = shouldPreventQueue.current.filter(function(e) {
      return e.name === event.type && (e.target === event.target || event.target === e.shadowParent) && deltaCompare(e.delta, delta);
    })[0];
    if (sourceEvent && sourceEvent.should) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    if (!sourceEvent) {
      var shardNodes = (lastProps.current.shards || []).map(extractRef).filter(Boolean).filter(function(node) {
        return node.contains(event.target);
      });
      var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
      if (shouldStop) {
        if (event.cancelable) {
          event.preventDefault();
        }
      }
    }
  }, []);
  var shouldCancel = React11.useCallback(function(name, delta, target, should) {
    var event = { name, delta, target, should, shadowParent: getOutermostShadowParent(target) };
    shouldPreventQueue.current.push(event);
    setTimeout(function() {
      shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e) {
        return e !== event;
      });
    }, 1);
  }, []);
  var scrollTouchStart = React11.useCallback(function(event) {
    touchStartRef.current = getTouchXY(event);
    activeAxis.current = void 0;
  }, []);
  var scrollWheel = React11.useCallback(function(event) {
    shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  var scrollTouchMove = React11.useCallback(function(event) {
    shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  React11.useEffect(function() {
    lockStack.push(Style2);
    props.setCallbacks({
      onScrollCapture: scrollWheel,
      onWheelCapture: scrollWheel,
      onTouchMoveCapture: scrollTouchMove
    });
    document.addEventListener("wheel", shouldPrevent, nonPassive);
    document.addEventListener("touchmove", shouldPrevent, nonPassive);
    document.addEventListener("touchstart", scrollTouchStart, nonPassive);
    return function() {
      lockStack = lockStack.filter(function(inst) {
        return inst !== Style2;
      });
      document.removeEventListener("wheel", shouldPrevent, nonPassive);
      document.removeEventListener("touchmove", shouldPrevent, nonPassive);
      document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
    };
  }, []);
  var removeScrollBar = props.removeScrollBar, inert = props.inert;
  return React11.createElement(
    React11.Fragment,
    null,
    inert ? React11.createElement(Style2, { styles: generateStyle(id) }) : null,
    removeScrollBar ? React11.createElement(RemoveScrollBar, { noRelative: props.noRelative, gapMode: props.gapMode }) : null
  );
}
function getOutermostShadowParent(node) {
  var shadowParent = null;
  while (node !== null) {
    if (node instanceof ShadowRoot) {
      shadowParent = node.host;
      node = node.host;
    }
    node = node.parentNode;
  }
  return shadowParent;
}

// ../node_modules/react-remove-scroll/dist/es2015/sidecar.js
var sidecar_default = exportSidecar(effectCar, RemoveScrollSideCar);

// ../node_modules/react-remove-scroll/dist/es2015/Combination.js
var ReactRemoveScroll = React12.forwardRef(function(props, ref) {
  return React12.createElement(RemoveScroll, __assign({}, props, { ref, sideCar: sidecar_default }));
});
ReactRemoveScroll.classNames = RemoveScroll.classNames;
var Combination_default = ReactRemoveScroll;

// ../node_modules/aria-hidden/dist/es2015/index.js
var getDefaultParent = function(originalTarget) {
  if (typeof document === "undefined") {
    return null;
  }
  var sampleTarget = Array.isArray(originalTarget) ? originalTarget[0] : originalTarget;
  return sampleTarget.ownerDocument.body;
};
var counterMap = /* @__PURE__ */ new WeakMap();
var uncontrolledNodes = /* @__PURE__ */ new WeakMap();
var markerMap = {};
var lockCount = 0;
var unwrapHost = function(node) {
  return node && (node.host || unwrapHost(node.parentNode));
};
var correctTargets = function(parent, targets) {
  return targets.map(function(target) {
    if (parent.contains(target)) {
      return target;
    }
    var correctedTarget = unwrapHost(target);
    if (correctedTarget && parent.contains(correctedTarget)) {
      return correctedTarget;
    }
    console.error("aria-hidden", target, "in not contained inside", parent, ". Doing nothing");
    return null;
  }).filter(function(x) {
    return Boolean(x);
  });
};
var applyAttributeToOthers = function(originalTarget, parentNode, markerName, controlAttribute) {
  var targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
  if (!markerMap[markerName]) {
    markerMap[markerName] = /* @__PURE__ */ new WeakMap();
  }
  var markerCounter = markerMap[markerName];
  var hiddenNodes = [];
  var elementsToKeep = /* @__PURE__ */ new Set();
  var elementsToStop = new Set(targets);
  var keep = function(el) {
    if (!el || elementsToKeep.has(el)) {
      return;
    }
    elementsToKeep.add(el);
    keep(el.parentNode);
  };
  targets.forEach(keep);
  var deep = function(parent) {
    if (!parent || elementsToStop.has(parent)) {
      return;
    }
    Array.prototype.forEach.call(parent.children, function(node) {
      if (elementsToKeep.has(node)) {
        deep(node);
      } else {
        try {
          var attr = node.getAttribute(controlAttribute);
          var alreadyHidden = attr !== null && attr !== "false";
          var counterValue = (counterMap.get(node) || 0) + 1;
          var markerValue = (markerCounter.get(node) || 0) + 1;
          counterMap.set(node, counterValue);
          markerCounter.set(node, markerValue);
          hiddenNodes.push(node);
          if (counterValue === 1 && alreadyHidden) {
            uncontrolledNodes.set(node, true);
          }
          if (markerValue === 1) {
            node.setAttribute(markerName, "true");
          }
          if (!alreadyHidden) {
            node.setAttribute(controlAttribute, "true");
          }
        } catch (e) {
          console.error("aria-hidden: cannot operate on ", node, e);
        }
      }
    });
  };
  deep(parentNode);
  elementsToKeep.clear();
  lockCount++;
  return function() {
    hiddenNodes.forEach(function(node) {
      var counterValue = counterMap.get(node) - 1;
      var markerValue = markerCounter.get(node) - 1;
      counterMap.set(node, counterValue);
      markerCounter.set(node, markerValue);
      if (!counterValue) {
        if (!uncontrolledNodes.has(node)) {
          node.removeAttribute(controlAttribute);
        }
        uncontrolledNodes.delete(node);
      }
      if (!markerValue) {
        node.removeAttribute(markerName);
      }
    });
    lockCount--;
    if (!lockCount) {
      counterMap = /* @__PURE__ */ new WeakMap();
      counterMap = /* @__PURE__ */ new WeakMap();
      uncontrolledNodes = /* @__PURE__ */ new WeakMap();
      markerMap = {};
    }
  };
};
var hideOthers = function(originalTarget, parentNode, markerName) {
  if (markerName === void 0) {
    markerName = "data-aria-hidden";
  }
  var targets = Array.from(Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
  var activeParentNode = parentNode || getDefaultParent(originalTarget);
  if (!activeParentNode) {
    return function() {
      return null;
    };
  }
  targets.push.apply(targets, Array.from(activeParentNode.querySelectorAll("[aria-live], script")));
  return applyAttributeToOthers(targets, activeParentNode, markerName, "aria-hidden");
};

// ../node_modules/@radix-ui/react-dialog/dist/index.mjs
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var DIALOG_NAME = "Dialog";
var [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME);
var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
var Dialog = (props) => {
  const {
    __scopeDialog,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const triggerRef = React13.useRef(null);
  const contentRef = React13.useRef(null);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: DIALOG_NAME
  });
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    DialogProvider,
    {
      scope: __scopeDialog,
      triggerRef,
      contentRef,
      contentId: useId(),
      titleId: useId(),
      descriptionId: useId(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: React13.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children
    }
  );
};
Dialog.displayName = DIALOG_NAME;
var TRIGGER_NAME = "DialogTrigger";
var DialogTrigger = React13.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...triggerProps } = props;
    const context = useDialogContext(TRIGGER_NAME, __scopeDialog);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      Primitive.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": context.open,
        "aria-controls": context.contentId,
        "data-state": getState(context.open),
        ...triggerProps,
        ref: composedTriggerRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
DialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "DialogPortal";
var [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME, {
  forceMount: void 0
});
var DialogPortal = (props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = useDialogContext(PORTAL_NAME, __scopeDialog);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(PortalProvider, { scope: __scopeDialog, forceMount, children: React13.Children.map(children, (child) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Portal, { asChild: true, container, children: child }) })) });
};
DialogPortal.displayName = PORTAL_NAME;
var OVERLAY_NAME = "DialogOverlay";
var DialogOverlay = React13.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }
);
DialogOverlay.displayName = OVERLAY_NAME;
var Slot = createSlot("DialogOverlay.RemoveScroll");
var DialogOverlayImpl = React13.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Combination_default, { as: Slot, allowPinchZoom: true, shards: [context.contentRef], children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        Primitive.div,
        {
          "data-state": getState(context.open),
          ...overlayProps,
          ref: forwardedRef,
          style: { pointerEvents: "auto", ...overlayProps.style }
        }
      ) })
    );
  }
);
var CONTENT_NAME = "DialogContent";
var DialogContent = React13.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
DialogContent.displayName = CONTENT_NAME;
var DialogContentModal = React13.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const contentRef = React13.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
    React13.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      DialogContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: true,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          event.preventDefault();
          context.triggerRef.current?.focus();
        }),
        onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (isRightClick) event.preventDefault();
        }),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault()
        )
      }
    );
  }
);
var DialogContentNonModal = React13.forwardRef(
  (props, forwardedRef) => {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const hasInteractedOutsideRef = React13.useRef(false);
    const hasPointerDownOutsideRef = React13.useRef(false);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      DialogContentImpl,
      {
        ...props,
        ref: forwardedRef,
        trapFocus: false,
        disableOutsidePointerEvents: false,
        onCloseAutoFocus: (event) => {
          props.onCloseAutoFocus?.(event);
          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
            event.preventDefault();
          }
          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        },
        onInteractOutside: (event) => {
          props.onInteractOutside?.(event);
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === "pointerdown") {
              hasPointerDownOutsideRef.current = true;
            }
          }
          const target = event.target;
          const targetIsTrigger = context.triggerRef.current?.contains(target);
          if (targetIsTrigger) event.preventDefault();
          if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }
      }
    );
  }
);
var DialogContentImpl = React13.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, __scopeDialog);
    const contentRef = React13.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    useFocusGuards();
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        FocusScope,
        {
          asChild: true,
          loop: true,
          trapped: trapFocus,
          onMountAutoFocus: onOpenAutoFocus,
          onUnmountAutoFocus: onCloseAutoFocus,
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            DismissableLayer,
            {
              role: "dialog",
              id: context.contentId,
              "aria-describedby": context.descriptionId,
              "aria-labelledby": context.titleId,
              "data-state": getState(context.open),
              ...contentProps,
              ref: composedRefs,
              onDismiss: () => context.onOpenChange(false)
            }
          )
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(TitleWarning, { titleId: context.titleId }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(DescriptionWarning, { contentRef, descriptionId: context.descriptionId })
      ] })
    ] });
  }
);
var TITLE_NAME = "DialogTitle";
var DialogTitle = React13.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...titleProps } = props;
    const context = useDialogContext(TITLE_NAME, __scopeDialog);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Primitive.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
  }
);
DialogTitle.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "DialogDescription";
var DialogDescription = React13.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...descriptionProps } = props;
    const context = useDialogContext(DESCRIPTION_NAME, __scopeDialog);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Primitive.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
  }
);
DialogDescription.displayName = DESCRIPTION_NAME;
var CLOSE_NAME = "DialogClose";
var DialogClose = React13.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDialog, ...closeProps } = props;
    const context = useDialogContext(CLOSE_NAME, __scopeDialog);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
      }
    );
  }
);
DialogClose.displayName = CLOSE_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var TITLE_WARNING_NAME = "DialogTitleWarning";
var [WarningProvider, useWarningContext] = createContext2(TITLE_WARNING_NAME, {
  contentName: CONTENT_NAME,
  titleName: TITLE_NAME,
  docsSlug: "dialog"
});
var TitleWarning = ({ titleId }) => {
  const titleWarningContext = useWarningContext(TITLE_WARNING_NAME);
  const MESSAGE = `\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${titleWarningContext.docsSlug}`;
  React13.useEffect(() => {
    if (titleId) {
      const hasTitle = document.getElementById(titleId);
      if (!hasTitle) console.error(MESSAGE);
    }
  }, [MESSAGE, titleId]);
  return null;
};
var DESCRIPTION_WARNING_NAME = "DialogDescriptionWarning";
var DescriptionWarning = ({ contentRef, descriptionId }) => {
  const descriptionWarningContext = useWarningContext(DESCRIPTION_WARNING_NAME);
  const MESSAGE = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${descriptionWarningContext.contentName}}.`;
  React13.useEffect(() => {
    const describedById = contentRef.current?.getAttribute("aria-describedby");
    if (descriptionId && describedById) {
      const hasDescription = document.getElementById(descriptionId);
      if (!hasDescription) console.warn(MESSAGE);
    }
  }, [MESSAGE, contentRef, descriptionId]);
  return null;
};
var Root = Dialog;
var Trigger = DialogTrigger;
var Portal2 = DialogPortal;
var Overlay = DialogOverlay;
var Content2 = DialogContent;
var Title = DialogTitle;
var Description = DialogDescription;
var Close = DialogClose;

// src/components/ui/sheet.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var Sheet = Root;
var SheetTrigger = Trigger;
var SheetPortal = Portal2;
var SheetOverlay = React14.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
var sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
var SheetContent = React14.forwardRef(({ side = "right", className, children, hideOverlay = false, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(SheetPortal, { children: [
  !hideOverlay && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(SheetOverlay, {}),
  /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    Content2,
    {
      ref,
      className: cn(sheetVariants({ side }), className),
      ...props,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "sr-only", children: "Close" })
        ] }),
        children
      ]
    }
  )
] }));
SheetContent.displayName = Content2.displayName;
var SheetHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
);
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
SheetFooter.displayName = "SheetFooter";
var SheetTitle = React14.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
var SheetDescription = React14.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;

// src/components/ui/select.tsx
var React18 = __toESM(require_react(), 1);

// ../node_modules/@radix-ui/react-select/dist/index.mjs
var React17 = __toESM(require_react(), 1);
var ReactDOM = __toESM(require_react_dom(), 1);

// ../node_modules/@radix-ui/react-collection/dist/index.mjs
var import_react6 = __toESM(require_react(), 1);
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
var import_react7 = __toESM(require_react(), 1);
var import_jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope4] = createContextScope(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  );
  const CollectionProvider = (props) => {
    const { scope, children } = props;
    const ref = import_react6.default.useRef(null);
    const itemMap = import_react6.default.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
  };
  CollectionProvider.displayName = PROVIDER_NAME;
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlotImpl = createSlot(COLLECTION_SLOT_NAME);
  const CollectionSlot = import_react6.default.forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CollectionSlotImpl, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlotImpl = createSlot(ITEM_SLOT_NAME);
  const CollectionItemSlot = import_react6.default.forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = import_react6.default.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      import_react6.default.useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useCollection4(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = import_react6.default.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current)
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection4,
    createCollectionScope4
  ];
}

// ../node_modules/@radix-ui/react-use-previous/dist/index.mjs
var React16 = __toESM(require_react(), 1);
function usePrevious2(value) {
  const ref = React16.useRef({ value, previous: value });
  return React16.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [value]);
}

// ../node_modules/@radix-ui/react-select/dist/index.mjs
var import_jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
var OPEN_KEYS = [" ", "Enter", "ArrowUp", "ArrowDown"];
var SELECTION_KEYS = [" ", "Enter"];
var SELECT_NAME = "Select";
var [Collection, useCollection, createCollectionScope] = createCollection(SELECT_NAME);
var [createSelectContext, createSelectScope] = createContextScope(SELECT_NAME, [
  createCollectionScope,
  createPopperScope
]);
var usePopperScope = createPopperScope();
var [SelectProvider, useSelectContext] = createSelectContext(SELECT_NAME);
var [SelectNativeOptionsProvider, useSelectNativeOptionsContext] = createSelectContext(SELECT_NAME);
var Select = (props) => {
  const {
    __scopeSelect,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    value: valueProp,
    defaultValue: defaultValue2,
    onValueChange,
    dir,
    name,
    autoComplete,
    disabled,
    required,
    form
  } = props;
  const popperScope = usePopperScope(__scopeSelect);
  const [trigger, setTrigger] = React17.useState(null);
  const [valueNode, setValueNode] = React17.useState(null);
  const [valueNodeHasChildren, setValueNodeHasChildren] = React17.useState(false);
  const direction = useDirection(dir);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: SELECT_NAME
  });
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue2,
    onChange: onValueChange,
    caller: SELECT_NAME
  });
  const triggerPointerDownPosRef = React17.useRef(null);
  const isFormControl = trigger ? form || !!trigger.closest("form") : true;
  const [nativeOptionsSet, setNativeOptionsSet] = React17.useState(/* @__PURE__ */ new Set());
  const nativeSelectKey = Array.from(nativeOptionsSet).map((option) => option.props.value).join(";");
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Root2, { ...popperScope, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
    SelectProvider,
    {
      required,
      scope: __scopeSelect,
      trigger,
      onTriggerChange: setTrigger,
      valueNode,
      onValueNodeChange: setValueNode,
      valueNodeHasChildren,
      onValueNodeHasChildrenChange: setValueNodeHasChildren,
      contentId: useId(),
      value,
      onValueChange: setValue,
      open,
      onOpenChange: setOpen,
      dir: direction,
      triggerPointerDownPosRef,
      disabled,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Collection.Provider, { scope: __scopeSelect, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          SelectNativeOptionsProvider,
          {
            scope: props.__scopeSelect,
            onNativeOptionAdd: React17.useCallback((option) => {
              setNativeOptionsSet((prev) => new Set(prev).add(option));
            }, []),
            onNativeOptionRemove: React17.useCallback((option) => {
              setNativeOptionsSet((prev) => {
                const optionsSet = new Set(prev);
                optionsSet.delete(option);
                return optionsSet;
              });
            }, []),
            children
          }
        ) }),
        isFormControl ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
          SelectBubbleInput,
          {
            "aria-hidden": true,
            required,
            tabIndex: -1,
            name,
            autoComplete,
            value,
            onChange: (event) => setValue(event.target.value),
            disabled,
            form,
            children: [
              value === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { value: "" }) : null,
              Array.from(nativeOptionsSet)
            ]
          },
          nativeSelectKey
        ) : null
      ]
    }
  ) });
};
Select.displayName = SELECT_NAME;
var TRIGGER_NAME2 = "SelectTrigger";
var SelectTrigger = React17.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, disabled = false, ...triggerProps } = props;
    const popperScope = usePopperScope(__scopeSelect);
    const context = useSelectContext(TRIGGER_NAME2, __scopeSelect);
    const isDisabled = context.disabled || disabled;
    const composedRefs = useComposedRefs(forwardedRef, context.onTriggerChange);
    const getItems = useCollection(__scopeSelect);
    const pointerTypeRef = React17.useRef("touch");
    const [searchRef, handleTypeaheadSearch, resetTypeahead] = useTypeaheadSearch((search) => {
      const enabledItems = getItems().filter((item) => !item.disabled);
      const currentItem = enabledItems.find((item) => item.value === context.value);
      const nextItem = findNextItem(enabledItems, search, currentItem);
      if (nextItem !== void 0) {
        context.onValueChange(nextItem.value);
      }
    });
    const handleOpen = (pointerEvent) => {
      if (!isDisabled) {
        context.onOpenChange(true);
        resetTypeahead();
      }
      if (pointerEvent) {
        context.triggerPointerDownPosRef.current = {
          x: Math.round(pointerEvent.pageX),
          y: Math.round(pointerEvent.pageY)
        };
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Anchor, { asChild: true, ...popperScope, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      Primitive.button,
      {
        type: "button",
        role: "combobox",
        "aria-controls": context.contentId,
        "aria-expanded": context.open,
        "aria-required": context.required,
        "aria-autocomplete": "none",
        dir: context.dir,
        "data-state": context.open ? "open" : "closed",
        disabled: isDisabled,
        "data-disabled": isDisabled ? "" : void 0,
        "data-placeholder": shouldShowPlaceholder(context.value) ? "" : void 0,
        ...triggerProps,
        ref: composedRefs,
        onClick: composeEventHandlers(triggerProps.onClick, (event) => {
          event.currentTarget.focus();
          if (pointerTypeRef.current !== "mouse") {
            handleOpen(event);
          }
        }),
        onPointerDown: composeEventHandlers(triggerProps.onPointerDown, (event) => {
          pointerTypeRef.current = event.pointerType;
          const target = event.target;
          if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
          }
          if (event.button === 0 && event.ctrlKey === false && event.pointerType === "mouse") {
            handleOpen(event);
            event.preventDefault();
          }
        }),
        onKeyDown: composeEventHandlers(triggerProps.onKeyDown, (event) => {
          const isTypingAhead = searchRef.current !== "";
          const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
          if (!isModifierKey && event.key.length === 1) handleTypeaheadSearch(event.key);
          if (isTypingAhead && event.key === " ") return;
          if (OPEN_KEYS.includes(event.key)) {
            handleOpen();
            event.preventDefault();
          }
        })
      }
    ) });
  }
);
SelectTrigger.displayName = TRIGGER_NAME2;
var VALUE_NAME = "SelectValue";
var SelectValue = React17.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, className, style, children, placeholder = "", ...valueProps } = props;
    const context = useSelectContext(VALUE_NAME, __scopeSelect);
    const { onValueNodeHasChildrenChange } = context;
    const hasChildren = children !== void 0;
    const composedRefs = useComposedRefs(forwardedRef, context.onValueNodeChange);
    useLayoutEffect2(() => {
      onValueNodeHasChildrenChange(hasChildren);
    }, [onValueNodeHasChildrenChange, hasChildren]);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      Primitive.span,
      {
        ...valueProps,
        ref: composedRefs,
        style: { pointerEvents: "none" },
        children: shouldShowPlaceholder(context.value) ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_jsx_runtime8.Fragment, { children: placeholder }) : children
      }
    );
  }
);
SelectValue.displayName = VALUE_NAME;
var ICON_NAME = "SelectIcon";
var SelectIcon = React17.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, children, ...iconProps } = props;
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Primitive.span, { "aria-hidden": true, ...iconProps, ref: forwardedRef, children: children || "\u25BC" });
  }
);
SelectIcon.displayName = ICON_NAME;
var PORTAL_NAME2 = "SelectPortal";
var SelectPortal = (props) => {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Portal, { asChild: true, ...props });
};
SelectPortal.displayName = PORTAL_NAME2;
var CONTENT_NAME2 = "SelectContent";
var SelectContent = React17.forwardRef(
  (props, forwardedRef) => {
    const context = useSelectContext(CONTENT_NAME2, props.__scopeSelect);
    const [fragment, setFragment] = React17.useState();
    useLayoutEffect2(() => {
      setFragment(new DocumentFragment());
    }, []);
    if (!context.open) {
      const frag = fragment;
      return frag ? ReactDOM.createPortal(
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SelectContentProvider, { scope: props.__scopeSelect, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Collection.Slot, { scope: props.__scopeSelect, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { children: props.children }) }) }),
        frag
      ) : null;
    }
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SelectContentImpl, { ...props, ref: forwardedRef });
  }
);
SelectContent.displayName = CONTENT_NAME2;
var CONTENT_MARGIN = 10;
var [SelectContentProvider, useSelectContentContext] = createSelectContext(CONTENT_NAME2);
var CONTENT_IMPL_NAME = "SelectContentImpl";
var Slot2 = createSlot("SelectContent.RemoveScroll");
var SelectContentImpl = React17.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSelect,
      position = "item-aligned",
      onCloseAutoFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      //
      // PopperContent props
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      avoidCollisions,
      //
      ...contentProps
    } = props;
    const context = useSelectContext(CONTENT_NAME2, __scopeSelect);
    const [content, setContent] = React17.useState(null);
    const [viewport, setViewport] = React17.useState(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) => setContent(node));
    const [selectedItem, setSelectedItem] = React17.useState(null);
    const [selectedItemText, setSelectedItemText] = React17.useState(
      null
    );
    const getItems = useCollection(__scopeSelect);
    const [isPositioned, setIsPositioned] = React17.useState(false);
    const firstValidItemFoundRef = React17.useRef(false);
    React17.useEffect(() => {
      if (content) return hideOthers(content);
    }, [content]);
    useFocusGuards();
    const focusFirst4 = React17.useCallback(
      (candidates) => {
        const [firstItem, ...restItems] = getItems().map((item) => item.ref.current);
        const [lastItem] = restItems.slice(-1);
        const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
        for (const candidate of candidates) {
          if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
          candidate?.scrollIntoView({ block: "nearest" });
          if (candidate === firstItem && viewport) viewport.scrollTop = 0;
          if (candidate === lastItem && viewport) viewport.scrollTop = viewport.scrollHeight;
          candidate?.focus();
          if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
        }
      },
      [getItems, viewport]
    );
    const focusSelectedItem = React17.useCallback(
      () => focusFirst4([selectedItem, content]),
      [focusFirst4, selectedItem, content]
    );
    React17.useEffect(() => {
      if (isPositioned) {
        focusSelectedItem();
      }
    }, [isPositioned, focusSelectedItem]);
    const { onOpenChange, triggerPointerDownPosRef } = context;
    React17.useEffect(() => {
      if (content) {
        let pointerMoveDelta = { x: 0, y: 0 };
        const handlePointerMove = (event) => {
          pointerMoveDelta = {
            x: Math.abs(Math.round(event.pageX) - (triggerPointerDownPosRef.current?.x ?? 0)),
            y: Math.abs(Math.round(event.pageY) - (triggerPointerDownPosRef.current?.y ?? 0))
          };
        };
        const handlePointerUp = (event) => {
          if (pointerMoveDelta.x <= 10 && pointerMoveDelta.y <= 10) {
            event.preventDefault();
          } else {
            if (!content.contains(event.target)) {
              onOpenChange(false);
            }
          }
          document.removeEventListener("pointermove", handlePointerMove);
          triggerPointerDownPosRef.current = null;
        };
        if (triggerPointerDownPosRef.current !== null) {
          document.addEventListener("pointermove", handlePointerMove);
          document.addEventListener("pointerup", handlePointerUp, { capture: true, once: true });
        }
        return () => {
          document.removeEventListener("pointermove", handlePointerMove);
          document.removeEventListener("pointerup", handlePointerUp, { capture: true });
        };
      }
    }, [content, onOpenChange, triggerPointerDownPosRef]);
    React17.useEffect(() => {
      const close = () => onOpenChange(false);
      window.addEventListener("blur", close);
      window.addEventListener("resize", close);
      return () => {
        window.removeEventListener("blur", close);
        window.removeEventListener("resize", close);
      };
    }, [onOpenChange]);
    const [searchRef, handleTypeaheadSearch] = useTypeaheadSearch((search) => {
      const enabledItems = getItems().filter((item) => !item.disabled);
      const currentItem = enabledItems.find((item) => item.ref.current === document.activeElement);
      const nextItem = findNextItem(enabledItems, search, currentItem);
      if (nextItem) {
        setTimeout(() => nextItem.ref.current.focus());
      }
    });
    const itemRefCallback = React17.useCallback(
      (node, value, disabled) => {
        const isFirstValidItem = !firstValidItemFoundRef.current && !disabled;
        const isSelectedItem = context.value !== void 0 && context.value === value;
        if (isSelectedItem || isFirstValidItem) {
          setSelectedItem(node);
          if (isFirstValidItem) firstValidItemFoundRef.current = true;
        }
      },
      [context.value]
    );
    const handleItemLeave = React17.useCallback(() => content?.focus(), [content]);
    const itemTextRefCallback = React17.useCallback(
      (node, value, disabled) => {
        const isFirstValidItem = !firstValidItemFoundRef.current && !disabled;
        const isSelectedItem = context.value !== void 0 && context.value === value;
        if (isSelectedItem || isFirstValidItem) {
          setSelectedItemText(node);
        }
      },
      [context.value]
    );
    const SelectPosition = position === "popper" ? SelectPopperPosition : SelectItemAlignedPosition;
    const popperContentProps = SelectPosition === SelectPopperPosition ? {
      side,
      sideOffset,
      align,
      alignOffset,
      arrowPadding,
      collisionBoundary,
      collisionPadding,
      sticky,
      hideWhenDetached,
      avoidCollisions
    } : {};
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      SelectContentProvider,
      {
        scope: __scopeSelect,
        content,
        viewport,
        onViewportChange: setViewport,
        itemRefCallback,
        selectedItem,
        onItemLeave: handleItemLeave,
        itemTextRefCallback,
        focusSelectedItem,
        selectedItemText,
        position,
        isPositioned,
        searchRef,
        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Combination_default, { as: Slot2, allowPinchZoom: true, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          FocusScope,
          {
            asChild: true,
            trapped: context.open,
            onMountAutoFocus: (event) => {
              event.preventDefault();
            },
            onUnmountAutoFocus: composeEventHandlers(onCloseAutoFocus, (event) => {
              context.trigger?.focus({ preventScroll: true });
              event.preventDefault();
            }),
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              DismissableLayer,
              {
                asChild: true,
                disableOutsidePointerEvents: true,
                onEscapeKeyDown,
                onPointerDownOutside,
                onFocusOutside: (event) => event.preventDefault(),
                onDismiss: () => context.onOpenChange(false),
                children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  SelectPosition,
                  {
                    role: "listbox",
                    id: context.contentId,
                    "data-state": context.open ? "open" : "closed",
                    dir: context.dir,
                    onContextMenu: (event) => event.preventDefault(),
                    ...contentProps,
                    ...popperContentProps,
                    onPlaced: () => setIsPositioned(true),
                    ref: composedRefs,
                    style: {
                      // flex layout so we can place the scroll buttons properly
                      display: "flex",
                      flexDirection: "column",
                      // reset the outline by default as the content MAY get focused
                      outline: "none",
                      ...contentProps.style
                    },
                    onKeyDown: composeEventHandlers(contentProps.onKeyDown, (event) => {
                      const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
                      if (event.key === "Tab") event.preventDefault();
                      if (!isModifierKey && event.key.length === 1) handleTypeaheadSearch(event.key);
                      if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
                        const items = getItems().filter((item) => !item.disabled);
                        let candidateNodes = items.map((item) => item.ref.current);
                        if (["ArrowUp", "End"].includes(event.key)) {
                          candidateNodes = candidateNodes.slice().reverse();
                        }
                        if (["ArrowUp", "ArrowDown"].includes(event.key)) {
                          const currentElement = event.target;
                          const currentIndex = candidateNodes.indexOf(currentElement);
                          candidateNodes = candidateNodes.slice(currentIndex + 1);
                        }
                        setTimeout(() => focusFirst4(candidateNodes));
                        event.preventDefault();
                      }
                    })
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
SelectContentImpl.displayName = CONTENT_IMPL_NAME;
var ITEM_ALIGNED_POSITION_NAME = "SelectItemAlignedPosition";
var SelectItemAlignedPosition = React17.forwardRef((props, forwardedRef) => {
  const { __scopeSelect, onPlaced, ...popperProps } = props;
  const context = useSelectContext(CONTENT_NAME2, __scopeSelect);
  const contentContext = useSelectContentContext(CONTENT_NAME2, __scopeSelect);
  const [contentWrapper, setContentWrapper] = React17.useState(null);
  const [content, setContent] = React17.useState(null);
  const composedRefs = useComposedRefs(forwardedRef, (node) => setContent(node));
  const getItems = useCollection(__scopeSelect);
  const shouldExpandOnScrollRef = React17.useRef(false);
  const shouldRepositionRef = React17.useRef(true);
  const { viewport, selectedItem, selectedItemText, focusSelectedItem } = contentContext;
  const position = React17.useCallback(() => {
    if (context.trigger && context.valueNode && contentWrapper && content && viewport && selectedItem && selectedItemText) {
      const triggerRect = context.trigger.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const valueNodeRect = context.valueNode.getBoundingClientRect();
      const itemTextRect = selectedItemText.getBoundingClientRect();
      if (context.dir !== "rtl") {
        const itemTextOffset = itemTextRect.left - contentRect.left;
        const left = valueNodeRect.left - itemTextOffset;
        const leftDelta = triggerRect.left - left;
        const minContentWidth = triggerRect.width + leftDelta;
        const contentWidth = Math.max(minContentWidth, contentRect.width);
        const rightEdge = window.innerWidth - CONTENT_MARGIN;
        const clampedLeft = clamp(left, [
          CONTENT_MARGIN,
          // Prevents the content from going off the starting edge of the
          // viewport. It may still go off the ending edge, but this can be
          // controlled by the user since they may want to manage overflow in a
          // specific way.
          // https://github.com/radix-ui/primitives/issues/2049
          Math.max(CONTENT_MARGIN, rightEdge - contentWidth)
        ]);
        contentWrapper.style.minWidth = minContentWidth + "px";
        contentWrapper.style.left = clampedLeft + "px";
      } else {
        const itemTextOffset = contentRect.right - itemTextRect.right;
        const right = window.innerWidth - valueNodeRect.right - itemTextOffset;
        const rightDelta = window.innerWidth - triggerRect.right - right;
        const minContentWidth = triggerRect.width + rightDelta;
        const contentWidth = Math.max(minContentWidth, contentRect.width);
        const leftEdge = window.innerWidth - CONTENT_MARGIN;
        const clampedRight = clamp(right, [
          CONTENT_MARGIN,
          Math.max(CONTENT_MARGIN, leftEdge - contentWidth)
        ]);
        contentWrapper.style.minWidth = minContentWidth + "px";
        contentWrapper.style.right = clampedRight + "px";
      }
      const items = getItems();
      const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
      const itemsHeight = viewport.scrollHeight;
      const contentStyles = window.getComputedStyle(content);
      const contentBorderTopWidth = parseInt(contentStyles.borderTopWidth, 10);
      const contentPaddingTop = parseInt(contentStyles.paddingTop, 10);
      const contentBorderBottomWidth = parseInt(contentStyles.borderBottomWidth, 10);
      const contentPaddingBottom = parseInt(contentStyles.paddingBottom, 10);
      const fullContentHeight = contentBorderTopWidth + contentPaddingTop + itemsHeight + contentPaddingBottom + contentBorderBottomWidth;
      const minContentHeight = Math.min(selectedItem.offsetHeight * 5, fullContentHeight);
      const viewportStyles = window.getComputedStyle(viewport);
      const viewportPaddingTop = parseInt(viewportStyles.paddingTop, 10);
      const viewportPaddingBottom = parseInt(viewportStyles.paddingBottom, 10);
      const topEdgeToTriggerMiddle = triggerRect.top + triggerRect.height / 2 - CONTENT_MARGIN;
      const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle;
      const selectedItemHalfHeight = selectedItem.offsetHeight / 2;
      const itemOffsetMiddle = selectedItem.offsetTop + selectedItemHalfHeight;
      const contentTopToItemMiddle = contentBorderTopWidth + contentPaddingTop + itemOffsetMiddle;
      const itemMiddleToContentBottom = fullContentHeight - contentTopToItemMiddle;
      const willAlignWithoutTopOverflow = contentTopToItemMiddle <= topEdgeToTriggerMiddle;
      if (willAlignWithoutTopOverflow) {
        const isLastItem = items.length > 0 && selectedItem === items[items.length - 1].ref.current;
        contentWrapper.style.bottom = "0px";
        const viewportOffsetBottom = content.clientHeight - viewport.offsetTop - viewport.offsetHeight;
        const clampedTriggerMiddleToBottomEdge = Math.max(
          triggerMiddleToBottomEdge,
          selectedItemHalfHeight + // viewport might have padding bottom, include it to avoid a scrollable viewport
          (isLastItem ? viewportPaddingBottom : 0) + viewportOffsetBottom + contentBorderBottomWidth
        );
        const height = contentTopToItemMiddle + clampedTriggerMiddleToBottomEdge;
        contentWrapper.style.height = height + "px";
      } else {
        const isFirstItem = items.length > 0 && selectedItem === items[0].ref.current;
        contentWrapper.style.top = "0px";
        const clampedTopEdgeToTriggerMiddle = Math.max(
          topEdgeToTriggerMiddle,
          contentBorderTopWidth + viewport.offsetTop + // viewport might have padding top, include it to avoid a scrollable viewport
          (isFirstItem ? viewportPaddingTop : 0) + selectedItemHalfHeight
        );
        const height = clampedTopEdgeToTriggerMiddle + itemMiddleToContentBottom;
        contentWrapper.style.height = height + "px";
        viewport.scrollTop = contentTopToItemMiddle - topEdgeToTriggerMiddle + viewport.offsetTop;
      }
      contentWrapper.style.margin = `${CONTENT_MARGIN}px 0`;
      contentWrapper.style.minHeight = minContentHeight + "px";
      contentWrapper.style.maxHeight = availableHeight + "px";
      onPlaced?.();
      requestAnimationFrame(() => shouldExpandOnScrollRef.current = true);
    }
  }, [
    getItems,
    context.trigger,
    context.valueNode,
    contentWrapper,
    content,
    viewport,
    selectedItem,
    selectedItemText,
    context.dir,
    onPlaced
  ]);
  useLayoutEffect2(() => position(), [position]);
  const [contentZIndex, setContentZIndex] = React17.useState();
  useLayoutEffect2(() => {
    if (content) setContentZIndex(window.getComputedStyle(content).zIndex);
  }, [content]);
  const handleScrollButtonChange = React17.useCallback(
    (node) => {
      if (node && shouldRepositionRef.current === true) {
        position();
        focusSelectedItem?.();
        shouldRepositionRef.current = false;
      }
    },
    [position, focusSelectedItem]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    SelectViewportProvider,
    {
      scope: __scopeSelect,
      contentWrapper,
      shouldExpandOnScrollRef,
      onScrollButtonChange: handleScrollButtonChange,
      children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "div",
        {
          ref: setContentWrapper,
          style: {
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            zIndex: contentZIndex
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            Primitive.div,
            {
              ...popperProps,
              ref: composedRefs,
              style: {
                // When we get the height of the content, it includes borders. If we were to set
                // the height without having `boxSizing: 'border-box'` it would be too big.
                boxSizing: "border-box",
                // We need to ensure the content doesn't get taller than the wrapper
                maxHeight: "100%",
                ...popperProps.style
              }
            }
          )
        }
      )
    }
  );
});
SelectItemAlignedPosition.displayName = ITEM_ALIGNED_POSITION_NAME;
var POPPER_POSITION_NAME = "SelectPopperPosition";
var SelectPopperPosition = React17.forwardRef((props, forwardedRef) => {
  const {
    __scopeSelect,
    align = "start",
    collisionPadding = CONTENT_MARGIN,
    ...popperProps
  } = props;
  const popperScope = usePopperScope(__scopeSelect);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    Content,
    {
      ...popperScope,
      ...popperProps,
      ref: forwardedRef,
      align,
      collisionPadding,
      style: {
        // Ensure border-box for floating-ui calculations
        boxSizing: "border-box",
        ...popperProps.style,
        // re-namespace exposed content custom properties
        ...{
          "--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-select-content-available-width": "var(--radix-popper-available-width)",
          "--radix-select-content-available-height": "var(--radix-popper-available-height)",
          "--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-select-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    }
  );
});
SelectPopperPosition.displayName = POPPER_POSITION_NAME;
var [SelectViewportProvider, useSelectViewportContext] = createSelectContext(CONTENT_NAME2, {});
var VIEWPORT_NAME = "SelectViewport";
var SelectViewport = React17.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, nonce, ...viewportProps } = props;
    const contentContext = useSelectContentContext(VIEWPORT_NAME, __scopeSelect);
    const viewportContext = useSelectViewportContext(VIEWPORT_NAME, __scopeSelect);
    const composedRefs = useComposedRefs(forwardedRef, contentContext.onViewportChange);
    const prevScrollTopRef = React17.useRef(0);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: `[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}`
          },
          nonce
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Collection.Slot, { scope: __scopeSelect, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        Primitive.div,
        {
          "data-radix-select-viewport": "",
          role: "presentation",
          ...viewportProps,
          ref: composedRefs,
          style: {
            // we use position: 'relative' here on the `viewport` so that when we call
            // `selectedItem.offsetTop` in calculations, the offset is relative to the viewport
            // (independent of the scrollUpButton).
            position: "relative",
            flex: 1,
            // Viewport should only be scrollable in the vertical direction.
            // This won't work in vertical writing modes, so we'll need to
            // revisit this if/when that is supported
            // https://developer.chrome.com/blog/vertical-form-controls
            overflow: "hidden auto",
            ...viewportProps.style
          },
          onScroll: composeEventHandlers(viewportProps.onScroll, (event) => {
            const viewport = event.currentTarget;
            const { contentWrapper, shouldExpandOnScrollRef } = viewportContext;
            if (shouldExpandOnScrollRef?.current && contentWrapper) {
              const scrolledBy = Math.abs(prevScrollTopRef.current - viewport.scrollTop);
              if (scrolledBy > 0) {
                const availableHeight = window.innerHeight - CONTENT_MARGIN * 2;
                const cssMinHeight = parseFloat(contentWrapper.style.minHeight);
                const cssHeight = parseFloat(contentWrapper.style.height);
                const prevHeight = Math.max(cssMinHeight, cssHeight);
                if (prevHeight < availableHeight) {
                  const nextHeight = prevHeight + scrolledBy;
                  const clampedNextHeight = Math.min(availableHeight, nextHeight);
                  const heightDiff = nextHeight - clampedNextHeight;
                  contentWrapper.style.height = clampedNextHeight + "px";
                  if (contentWrapper.style.bottom === "0px") {
                    viewport.scrollTop = heightDiff > 0 ? heightDiff : 0;
                    contentWrapper.style.justifyContent = "flex-end";
                  }
                }
              }
            }
            prevScrollTopRef.current = viewport.scrollTop;
          })
        }
      ) })
    ] });
  }
);
SelectViewport.displayName = VIEWPORT_NAME;
var GROUP_NAME = "SelectGroup";
var [SelectGroupContextProvider, useSelectGroupContext] = createSelectContext(GROUP_NAME);
var SelectGroup = React17.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, ...groupProps } = props;
    const groupId = useId();
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(SelectGroupContextProvider, { scope: __scopeSelect, id: groupId, children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Primitive.div, { role: "group", "aria-labelledby": groupId, ...groupProps, ref: forwardedRef }) });
  }
);
SelectGroup.displayName = GROUP_NAME;
var LABEL_NAME = "SelectLabel";
var SelectLabel = React17.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, ...labelProps } = props;
    const groupContext = useSelectGroupContext(LABEL_NAME, __scopeSelect);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Primitive.div, { id: groupContext.id, ...labelProps, ref: forwardedRef });
  }
);
SelectLabel.displayName = LABEL_NAME;
var ITEM_NAME = "SelectItem";
var [SelectItemContextProvider, useSelectItemContext] = createSelectContext(ITEM_NAME);
var SelectItem = React17.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeSelect,
      value,
      disabled = false,
      textValue: textValueProp,
      ...itemProps
    } = props;
    const context = useSelectContext(ITEM_NAME, __scopeSelect);
    const contentContext = useSelectContentContext(ITEM_NAME, __scopeSelect);
    const isSelected = context.value === value;
    const [textValue, setTextValue] = React17.useState(textValueProp ?? "");
    const [isFocused, setIsFocused] = React17.useState(false);
    const composedRefs = useComposedRefs(
      forwardedRef,
      (node) => contentContext.itemRefCallback?.(node, value, disabled)
    );
    const textId = useId();
    const pointerTypeRef = React17.useRef("touch");
    const handleSelect = () => {
      if (!disabled) {
        context.onValueChange(value);
        context.onOpenChange(false);
      }
    };
    if (value === "") {
      throw new Error(
        "A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder."
      );
    }
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      SelectItemContextProvider,
      {
        scope: __scopeSelect,
        value,
        disabled,
        textId,
        isSelected,
        onItemTextChange: React17.useCallback((node) => {
          setTextValue((prevTextValue) => prevTextValue || (node?.textContent ?? "").trim());
        }, []),
        children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          Collection.ItemSlot,
          {
            scope: __scopeSelect,
            value,
            disabled,
            textValue,
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
              Primitive.div,
              {
                role: "option",
                "aria-labelledby": textId,
                "data-highlighted": isFocused ? "" : void 0,
                "aria-selected": isSelected && isFocused,
                "data-state": isSelected ? "checked" : "unchecked",
                "aria-disabled": disabled || void 0,
                "data-disabled": disabled ? "" : void 0,
                tabIndex: disabled ? void 0 : -1,
                ...itemProps,
                ref: composedRefs,
                onFocus: composeEventHandlers(itemProps.onFocus, () => setIsFocused(true)),
                onBlur: composeEventHandlers(itemProps.onBlur, () => setIsFocused(false)),
                onClick: composeEventHandlers(itemProps.onClick, () => {
                  if (pointerTypeRef.current !== "mouse") handleSelect();
                }),
                onPointerUp: composeEventHandlers(itemProps.onPointerUp, () => {
                  if (pointerTypeRef.current === "mouse") handleSelect();
                }),
                onPointerDown: composeEventHandlers(itemProps.onPointerDown, (event) => {
                  pointerTypeRef.current = event.pointerType;
                }),
                onPointerMove: composeEventHandlers(itemProps.onPointerMove, (event) => {
                  pointerTypeRef.current = event.pointerType;
                  if (disabled) {
                    contentContext.onItemLeave?.();
                  } else if (pointerTypeRef.current === "mouse") {
                    event.currentTarget.focus({ preventScroll: true });
                  }
                }),
                onPointerLeave: composeEventHandlers(itemProps.onPointerLeave, (event) => {
                  if (event.currentTarget === document.activeElement) {
                    contentContext.onItemLeave?.();
                  }
                }),
                onKeyDown: composeEventHandlers(itemProps.onKeyDown, (event) => {
                  const isTypingAhead = contentContext.searchRef?.current !== "";
                  if (isTypingAhead && event.key === " ") return;
                  if (SELECTION_KEYS.includes(event.key)) handleSelect();
                  if (event.key === " ") event.preventDefault();
                })
              }
            )
          }
        )
      }
    );
  }
);
SelectItem.displayName = ITEM_NAME;
var ITEM_TEXT_NAME = "SelectItemText";
var SelectItemText = React17.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, className, style, ...itemTextProps } = props;
    const context = useSelectContext(ITEM_TEXT_NAME, __scopeSelect);
    const contentContext = useSelectContentContext(ITEM_TEXT_NAME, __scopeSelect);
    const itemContext = useSelectItemContext(ITEM_TEXT_NAME, __scopeSelect);
    const nativeOptionsContext = useSelectNativeOptionsContext(ITEM_TEXT_NAME, __scopeSelect);
    const [itemTextNode, setItemTextNode] = React17.useState(null);
    const composedRefs = useComposedRefs(
      forwardedRef,
      (node) => setItemTextNode(node),
      itemContext.onItemTextChange,
      (node) => contentContext.itemTextRefCallback?.(node, itemContext.value, itemContext.disabled)
    );
    const textContent = itemTextNode?.textContent;
    const nativeOption = React17.useMemo(
      () => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("option", { value: itemContext.value, disabled: itemContext.disabled, children: textContent }, itemContext.value),
      [itemContext.disabled, itemContext.value, textContent]
    );
    const { onNativeOptionAdd, onNativeOptionRemove } = nativeOptionsContext;
    useLayoutEffect2(() => {
      onNativeOptionAdd(nativeOption);
      return () => onNativeOptionRemove(nativeOption);
    }, [onNativeOptionAdd, onNativeOptionRemove, nativeOption]);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(import_jsx_runtime8.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Primitive.span, { id: itemContext.textId, ...itemTextProps, ref: composedRefs }),
      itemContext.isSelected && context.valueNode && !context.valueNodeHasChildren ? ReactDOM.createPortal(itemTextProps.children, context.valueNode) : null
    ] });
  }
);
SelectItemText.displayName = ITEM_TEXT_NAME;
var ITEM_INDICATOR_NAME = "SelectItemIndicator";
var SelectItemIndicator = React17.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, ...itemIndicatorProps } = props;
    const itemContext = useSelectItemContext(ITEM_INDICATOR_NAME, __scopeSelect);
    return itemContext.isSelected ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Primitive.span, { "aria-hidden": true, ...itemIndicatorProps, ref: forwardedRef }) : null;
  }
);
SelectItemIndicator.displayName = ITEM_INDICATOR_NAME;
var SCROLL_UP_BUTTON_NAME = "SelectScrollUpButton";
var SelectScrollUpButton = React17.forwardRef((props, forwardedRef) => {
  const contentContext = useSelectContentContext(SCROLL_UP_BUTTON_NAME, props.__scopeSelect);
  const viewportContext = useSelectViewportContext(SCROLL_UP_BUTTON_NAME, props.__scopeSelect);
  const [canScrollUp, setCanScrollUp] = React17.useState(false);
  const composedRefs = useComposedRefs(forwardedRef, viewportContext.onScrollButtonChange);
  useLayoutEffect2(() => {
    if (contentContext.viewport && contentContext.isPositioned) {
      let handleScroll22 = function() {
        const canScrollUp2 = viewport.scrollTop > 0;
        setCanScrollUp(canScrollUp2);
      };
      var handleScroll2 = handleScroll22;
      const viewport = contentContext.viewport;
      handleScroll22();
      viewport.addEventListener("scroll", handleScroll22);
      return () => viewport.removeEventListener("scroll", handleScroll22);
    }
  }, [contentContext.viewport, contentContext.isPositioned]);
  return canScrollUp ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    SelectScrollButtonImpl,
    {
      ...props,
      ref: composedRefs,
      onAutoScroll: () => {
        const { viewport, selectedItem } = contentContext;
        if (viewport && selectedItem) {
          viewport.scrollTop = viewport.scrollTop - selectedItem.offsetHeight;
        }
      }
    }
  ) : null;
});
SelectScrollUpButton.displayName = SCROLL_UP_BUTTON_NAME;
var SCROLL_DOWN_BUTTON_NAME = "SelectScrollDownButton";
var SelectScrollDownButton = React17.forwardRef((props, forwardedRef) => {
  const contentContext = useSelectContentContext(SCROLL_DOWN_BUTTON_NAME, props.__scopeSelect);
  const viewportContext = useSelectViewportContext(SCROLL_DOWN_BUTTON_NAME, props.__scopeSelect);
  const [canScrollDown, setCanScrollDown] = React17.useState(false);
  const composedRefs = useComposedRefs(forwardedRef, viewportContext.onScrollButtonChange);
  useLayoutEffect2(() => {
    if (contentContext.viewport && contentContext.isPositioned) {
      let handleScroll22 = function() {
        const maxScroll = viewport.scrollHeight - viewport.clientHeight;
        const canScrollDown2 = Math.ceil(viewport.scrollTop) < maxScroll;
        setCanScrollDown(canScrollDown2);
      };
      var handleScroll2 = handleScroll22;
      const viewport = contentContext.viewport;
      handleScroll22();
      viewport.addEventListener("scroll", handleScroll22);
      return () => viewport.removeEventListener("scroll", handleScroll22);
    }
  }, [contentContext.viewport, contentContext.isPositioned]);
  return canScrollDown ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    SelectScrollButtonImpl,
    {
      ...props,
      ref: composedRefs,
      onAutoScroll: () => {
        const { viewport, selectedItem } = contentContext;
        if (viewport && selectedItem) {
          viewport.scrollTop = viewport.scrollTop + selectedItem.offsetHeight;
        }
      }
    }
  ) : null;
});
SelectScrollDownButton.displayName = SCROLL_DOWN_BUTTON_NAME;
var SelectScrollButtonImpl = React17.forwardRef((props, forwardedRef) => {
  const { __scopeSelect, onAutoScroll, ...scrollIndicatorProps } = props;
  const contentContext = useSelectContentContext("SelectScrollButton", __scopeSelect);
  const autoScrollTimerRef = React17.useRef(null);
  const getItems = useCollection(__scopeSelect);
  const clearAutoScrollTimer = React17.useCallback(() => {
    if (autoScrollTimerRef.current !== null) {
      window.clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);
  React17.useEffect(() => {
    return () => clearAutoScrollTimer();
  }, [clearAutoScrollTimer]);
  useLayoutEffect2(() => {
    const activeItem = getItems().find((item) => item.ref.current === document.activeElement);
    activeItem?.ref.current?.scrollIntoView({ block: "nearest" });
  }, [getItems]);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
    Primitive.div,
    {
      "aria-hidden": true,
      ...scrollIndicatorProps,
      ref: forwardedRef,
      style: { flexShrink: 0, ...scrollIndicatorProps.style },
      onPointerDown: composeEventHandlers(scrollIndicatorProps.onPointerDown, () => {
        if (autoScrollTimerRef.current === null) {
          autoScrollTimerRef.current = window.setInterval(onAutoScroll, 50);
        }
      }),
      onPointerMove: composeEventHandlers(scrollIndicatorProps.onPointerMove, () => {
        contentContext.onItemLeave?.();
        if (autoScrollTimerRef.current === null) {
          autoScrollTimerRef.current = window.setInterval(onAutoScroll, 50);
        }
      }),
      onPointerLeave: composeEventHandlers(scrollIndicatorProps.onPointerLeave, () => {
        clearAutoScrollTimer();
      })
    }
  );
});
var SEPARATOR_NAME = "SelectSeparator";
var SelectSeparator = React17.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, ...separatorProps } = props;
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Primitive.div, { "aria-hidden": true, ...separatorProps, ref: forwardedRef });
  }
);
SelectSeparator.displayName = SEPARATOR_NAME;
var ARROW_NAME = "SelectArrow";
var SelectArrow = React17.forwardRef(
  (props, forwardedRef) => {
    const { __scopeSelect, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeSelect);
    const context = useSelectContext(ARROW_NAME, __scopeSelect);
    const contentContext = useSelectContentContext(ARROW_NAME, __scopeSelect);
    return context.open && contentContext.position === "popper" ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef }) : null;
  }
);
SelectArrow.displayName = ARROW_NAME;
var BUBBLE_INPUT_NAME = "SelectBubbleInput";
var SelectBubbleInput = React17.forwardRef(
  ({ __scopeSelect, value, ...props }, forwardedRef) => {
    const ref = React17.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const prevValue = usePrevious2(value);
    React17.useEffect(() => {
      const select = ref.current;
      if (!select) return;
      const selectProto = window.HTMLSelectElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        selectProto,
        "value"
      );
      const setValue = descriptor.set;
      if (prevValue !== value && setValue) {
        const event = new Event("change", { bubbles: true });
        setValue.call(select, value);
        select.dispatchEvent(event);
      }
    }, [prevValue, value]);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
      Primitive.select,
      {
        ...props,
        style: { ...VISUALLY_HIDDEN_STYLES, ...props.style },
        ref: composedRefs,
        defaultValue: value
      }
    );
  }
);
SelectBubbleInput.displayName = BUBBLE_INPUT_NAME;
function shouldShowPlaceholder(value) {
  return value === "" || value === void 0;
}
function useTypeaheadSearch(onSearchChange) {
  const handleSearchChange = useCallbackRef(onSearchChange);
  const searchRef = React17.useRef("");
  const timerRef = React17.useRef(0);
  const handleTypeaheadSearch = React17.useCallback(
    (key2) => {
      const search = searchRef.current + key2;
      handleSearchChange(search);
      (function updateSearch(value) {
        searchRef.current = value;
        window.clearTimeout(timerRef.current);
        if (value !== "") timerRef.current = window.setTimeout(() => updateSearch(""), 1e3);
      })(search);
    },
    [handleSearchChange]
  );
  const resetTypeahead = React17.useCallback(() => {
    searchRef.current = "";
    window.clearTimeout(timerRef.current);
  }, []);
  React17.useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);
  return [searchRef, handleTypeaheadSearch, resetTypeahead];
}
function findNextItem(items, search, currentItem) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const currentItemIndex = currentItem ? items.indexOf(currentItem) : -1;
  let wrappedItems = wrapArray(items, Math.max(currentItemIndex, 0));
  const excludeCurrentItem = normalizedSearch.length === 1;
  if (excludeCurrentItem) wrappedItems = wrappedItems.filter((v) => v !== currentItem);
  const nextItem = wrappedItems.find(
    (item) => item.textValue.toLowerCase().startsWith(normalizedSearch.toLowerCase())
  );
  return nextItem !== currentItem ? nextItem : void 0;
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
var Root22 = Select;
var Trigger2 = SelectTrigger;
var Value = SelectValue;
var Icon = SelectIcon;
var Portal3 = SelectPortal;
var Content22 = SelectContent;
var Viewport = SelectViewport;
var Label = SelectLabel;
var Item = SelectItem;
var ItemText = SelectItemText;
var ItemIndicator = SelectItemIndicator;
var ScrollUpButton = SelectScrollUpButton;
var ScrollDownButton = SelectScrollDownButton;
var Separator = SelectSeparator;

// src/components/ui/select.tsx
var import_jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
var Select2 = Root22;
var SelectValue2 = Value;
var SelectTrigger2 = React18.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
  Trigger2,
  {
    ref,
    className: cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Icon, { asChild: true, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger2.displayName = Trigger2.displayName;
var SelectScrollUpButton2 = React18.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
  ScrollUpButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton2.displayName = ScrollUpButton.displayName;
var SelectScrollDownButton2 = React18.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
  ScrollDownButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton2.displayName = ScrollDownButton.displayName;
var SelectContent2 = React18.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Portal3, { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
  Content22,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SelectScrollUpButton2, {}),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(SelectScrollDownButton2, {})
    ]
  }
) }));
SelectContent2.displayName = Content22.displayName;
var SelectLabel2 = React18.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
  Label,
  {
    ref,
    className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel2.displayName = Label.displayName;
var SelectItem2 = React18.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
  Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(ItemText, { children })
    ]
  }
));
SelectItem2.displayName = Item.displayName;
var SelectSeparator2 = React18.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
  Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator2.displayName = Separator.displayName;

// src/components/common/AttachmentList-simple.tsx
var import_react8 = __toESM(require_react(), 1);
var import_jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
var getFileIcon = (mimeType) => {
  if (!mimeType || typeof mimeType !== "string") return File;
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return FileText;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z")) return FileArchive;
  return File;
};
var getFileTypeColor = (mimeType) => {
  if (!mimeType || typeof mimeType !== "string") return "bg-gray-100 text-gray-700";
  if (mimeType.startsWith("image/")) return "bg-green-100 text-green-700";
  if (mimeType.startsWith("video/")) return "bg-purple-100 text-purple-700";
  if (mimeType.startsWith("audio/")) return "bg-pink-100 text-pink-700";
  if (mimeType.includes("pdf")) return "bg-red-100 text-red-700";
  if (mimeType.includes("document") || mimeType.includes("text")) return "bg-blue-100 text-blue-700";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-700";
};
var formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
var formatDate2 = (date) => {
  const d = new Date(date);
  const now = /* @__PURE__ */ new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
  if (diffDays === 1) return "Today";
  if (diffDays === 2) return "Yesterday";
  if (diffDays <= 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
};
var ThumbnailDisplay = ({ attachment, className }) => {
  const [imageError, setImageError] = (0, import_react8.useState)(false);
  if (!attachment.thumbnailUrl || imageError) {
    const FileIcon = getFileIcon(attachment.mimeType);
    const typeColor = getFileTypeColor(attachment.mimeType);
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: cn("flex items-center justify-center rounded-lg p-2", typeColor, className), children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(FileIcon, { className: "h-8 w-8" }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
    "img",
    {
      src: attachment.thumbnailUrl,
      alt: attachment.filename,
      className: cn("rounded-lg object-cover", className),
      onError: () => setImageError(true),
      onLoad: () => console.log(`\u2705 Thumbnail loaded: ${attachment.thumbnailUrl}`)
    }
  );
};
var AttachmentListSimple = ({
  attachments,
  canDelete = false,
  onRefresh,
  className,
  compact = false
}) => {
  const [deleting, setDeleting] = (0, import_react8.useState)(null);
  const deleteAttachmentMutation = trpc.upload.deleteAttachment.useMutation({
    onSuccess: () => {
      toast.success("Attachment deleted successfully");
      setDeleting(null);
      onRefresh?.();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
      setDeleting(null);
    }
  });
  if (attachments.length === 0) {
    return null;
  }
  const handleDownload = (attachment) => {
    try {
      const link = document.createElement("a");
      link.href = attachment.downloadUrl;
      link.download = attachment.filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      toast.error("Download failed");
    }
  };
  const handlePreview = (attachment) => {
    if (attachment.mimeType.startsWith("image/")) {
      window.open(attachment.downloadUrl, "_blank", "noopener,noreferrer");
    } else if (attachment.mimeType === "application/pdf") {
      window.open(attachment.downloadUrl, "_blank", "noopener,noreferrer");
    } else {
      toast.info("Preview not available for this file type");
    }
  };
  const handleDelete = (attachment) => {
    if (deleting) return;
    setDeleting(attachment.id);
    deleteAttachmentMutation.mutate({ attachmentId: attachment.id });
  };
  if (compact) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: cn("flex flex-wrap gap-2", className), children: attachments.map((attachment) => {
      const isDeleting = deleting === attachment.id;
      return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
        "div",
        {
          className: cn(
            "flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm",
            isDeleting && "opacity-50"
          ),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              ThumbnailDisplay,
              {
                attachment,
                className: "h-8 w-8"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "font-medium truncate max-w-[150px]", children: attachment.filename }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "text-gray-500", children: formatFileSize(attachment.size) }),
            attachment.compressed && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Badge, { variant: "secondary", className: "text-xs", children: "Compressed" }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-center gap-1", children: [
              (attachment.mimeType.startsWith("image/") || attachment.mimeType === "application/pdf") && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-6 w-6 p-0",
                  onClick: () => handlePreview(attachment),
                  title: "Preview",
                  disabled: isDeleting,
                  children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Eye, { className: "h-3 w-3" })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-6 w-6 p-0",
                  onClick: () => handleDownload(attachment),
                  title: "Download",
                  disabled: isDeleting,
                  children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Download, { className: "h-3 w-3" })
                }
              ),
              canDelete && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50",
                  onClick: () => handleDelete(attachment),
                  title: "Delete",
                  disabled: isDeleting,
                  children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Trash2, { className: "h-3 w-3" })
                }
              )
            ] })
          ]
        },
        attachment.id
      );
    }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: cn("space-y-3", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("h4", { className: "text-sm font-medium text-gray-900", children: [
      "Attachments (",
      attachments.length,
      ")"
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "space-y-2", children: attachments.map((attachment) => {
      const isDeleting = deleting === attachment.id;
      return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Card, { className: cn("p-4", isDeleting && "opacity-50"), children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
          ThumbnailDisplay,
          {
            attachment,
            className: "w-16 h-16 flex-shrink-0"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("p", { className: "text-sm font-medium text-gray-900 truncate", children: [
            attachment.filename,
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "text-xs text-gray-500 font-normal ml-2", children: [
              "\u2022 ",
              formatFileSize(attachment.size),
              " \u2022 ",
              formatDate2(attachment.uploadedAt),
              attachment.compressed && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(import_jsx_runtime10.Fragment, { children: [
                " ",
                "\u2022 ",
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Badge, { variant: "secondary", className: "text-xs inline", children: "Compressed" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-center gap-1 ml-2", children: [
            (attachment.mimeType.startsWith("image/") || attachment.mimeType === "application/pdf") && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "h-8 w-8 p-0",
                onClick: () => handlePreview(attachment),
                title: "Preview",
                disabled: isDeleting,
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Eye, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "h-8 w-8 p-0",
                onClick: () => handleDownload(attachment),
                title: "Download",
                disabled: isDeleting,
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Download, { className: "h-4 w-4" })
              }
            ),
            canDelete && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
              Button,
              {
                variant: "ghost",
                size: "sm",
                className: "h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50",
                onClick: () => handleDelete(attachment),
                title: "Delete",
                disabled: isDeleting,
                children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(Trash2, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }) })
      ] }) }, attachment.id);
    }) })
  ] });
};
var AttachmentList_simple_default = AttachmentListSimple;

// src/components/task/TaskChecklist.tsx
var import_react10 = __toESM(require_react(), 1);

// src/components/ui/progress.tsx
var React21 = __toESM(require_react(), 1);

// ../node_modules/@radix-ui/react-progress/dist/index.mjs
var React20 = __toESM(require_react(), 1);
var import_jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
var PROGRESS_NAME = "Progress";
var DEFAULT_MAX = 100;
var [createProgressContext, createProgressScope] = createContextScope(PROGRESS_NAME);
var [ProgressProvider, useProgressContext] = createProgressContext(PROGRESS_NAME);
var Progress = React20.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeProgress,
      value: valueProp = null,
      max: maxProp,
      getValueLabel = defaultGetValueLabel,
      ...progressProps
    } = props;
    if ((maxProp || maxProp === 0) && !isValidMaxNumber(maxProp)) {
      console.error(getInvalidMaxError(`${maxProp}`, "Progress"));
    }
    const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
    if (valueProp !== null && !isValidValueNumber(valueProp, max)) {
      console.error(getInvalidValueError(`${valueProp}`, "Progress"));
    }
    const value = isValidValueNumber(valueProp, max) ? valueProp : null;
    const valueLabel = isNumber(value) ? getValueLabel(value, max) : void 0;
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(ProgressProvider, { scope: __scopeProgress, value, max, children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      Primitive.div,
      {
        "aria-valuemax": max,
        "aria-valuemin": 0,
        "aria-valuenow": isNumber(value) ? value : void 0,
        "aria-valuetext": valueLabel,
        role: "progressbar",
        "data-state": getProgressState(value, max),
        "data-value": value ?? void 0,
        "data-max": max,
        ...progressProps,
        ref: forwardedRef
      }
    ) });
  }
);
Progress.displayName = PROGRESS_NAME;
var INDICATOR_NAME = "ProgressIndicator";
var ProgressIndicator = React20.forwardRef(
  (props, forwardedRef) => {
    const { __scopeProgress, ...indicatorProps } = props;
    const context = useProgressContext(INDICATOR_NAME, __scopeProgress);
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
      Primitive.div,
      {
        "data-state": getProgressState(context.value, context.max),
        "data-value": context.value ?? void 0,
        "data-max": context.max,
        ...indicatorProps,
        ref: forwardedRef
      }
    );
  }
);
ProgressIndicator.displayName = INDICATOR_NAME;
function defaultGetValueLabel(value, max) {
  return `${Math.round(value / max * 100)}%`;
}
function getProgressState(value, maxValue) {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
}
function isNumber(value) {
  return typeof value === "number";
}
function isValidMaxNumber(max) {
  return isNumber(max) && !isNaN(max) && max > 0;
}
function isValidValueNumber(value, max) {
  return isNumber(value) && !isNaN(value) && value <= max && value >= 0;
}
function getInvalidMaxError(propValue, componentName) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}
function getInvalidValueError(propValue, componentName) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
var Root3 = Progress;
var Indicator = ProgressIndicator;

// src/components/ui/progress.tsx
var import_jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
var Progress2 = React21.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
  Root3,
  {
    ref,
    className: cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    ),
    ...props,
    children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
      Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress2.displayName = Root3.displayName;

// src/components/ui/dropdown-menu.tsx
var React26 = __toESM(require_react(), 1);

// ../node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs
var React25 = __toESM(require_react(), 1);

// ../node_modules/@radix-ui/react-menu/dist/index.mjs
var React24 = __toESM(require_react(), 1);

// ../node_modules/@radix-ui/react-roving-focus/dist/index.mjs
var React23 = __toESM(require_react(), 1);
var import_jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS2 = { bubbles: false, cancelable: true };
var GROUP_NAME2 = "RovingFocusGroup";
var [Collection2, useCollection2, createCollectionScope2] = createCollection(GROUP_NAME2);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME2,
  [createCollectionScope2]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME2);
var RovingFocusGroup = React23.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Collection2.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(Collection2.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME2;
var RovingFocusGroupImpl = React23.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = React23.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
    caller: GROUP_NAME2
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = React23.useState(false);
  const handleEntryFocus = useCallbackRef(onEntryFocus);
  const getItems = useCollection2(__scopeRovingFocusGroup);
  const isClickFocusRef = React23.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = React23.useState(0);
  React23.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: React23.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: React23.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: React23.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: React23.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS2);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst2(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME2 = "RovingFocusGroupItem";
var RovingFocusGroupItem = React23.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      children,
      ...itemProps
    } = props;
    const autoId = useId();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME2, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection2(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove, currentTabStopId } = context;
    React23.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
      Collection2.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ (0, import_jsx_runtime13.jsx)(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray2(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst2(candidateNodes));
              }
            }),
            children: typeof children === "function" ? children({ isCurrentTabStop, hasTabStop: currentTabStopId != null }) : children
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME2;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key2, dir) {
  if (dir !== "rtl") return key2;
  return key2 === "ArrowLeft" ? "ArrowRight" : key2 === "ArrowRight" ? "ArrowLeft" : key2;
}
function getFocusIntent(event, orientation, dir) {
  const key2 = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key2)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key2)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key2];
}
function focusFirst2(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray2(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
var Root4 = RovingFocusGroup;
var Item2 = RovingFocusGroupItem;

// ../node_modules/@radix-ui/react-menu/dist/index.mjs
var import_jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var SELECTION_KEYS2 = ["Enter", " "];
var FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
var LAST_KEYS = ["ArrowUp", "PageDown", "End"];
var FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
var SUB_OPEN_KEYS = {
  ltr: [...SELECTION_KEYS2, "ArrowRight"],
  rtl: [...SELECTION_KEYS2, "ArrowLeft"]
};
var SUB_CLOSE_KEYS = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"]
};
var MENU_NAME = "Menu";
var [Collection3, useCollection3, createCollectionScope3] = createCollection(MENU_NAME);
var [createMenuContext, createMenuScope] = createContextScope(MENU_NAME, [
  createCollectionScope3,
  createPopperScope,
  createRovingFocusGroupScope
]);
var usePopperScope2 = createPopperScope();
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [MenuProvider, useMenuContext] = createMenuContext(MENU_NAME);
var [MenuRootProvider, useMenuRootContext] = createMenuContext(MENU_NAME);
var Menu = (props) => {
  const { __scopeMenu, open = false, children, dir, onOpenChange, modal = true } = props;
  const popperScope = usePopperScope2(__scopeMenu);
  const [content, setContent] = React24.useState(null);
  const isUsingKeyboardRef = React24.useRef(false);
  const handleOpenChange = useCallbackRef(onOpenChange);
  const direction = useDirection(dir);
  React24.useEffect(() => {
    const handleKeyDown = () => {
      isUsingKeyboardRef.current = true;
      document.addEventListener("pointerdown", handlePointer, { capture: true, once: true });
      document.addEventListener("pointermove", handlePointer, { capture: true, once: true });
    };
    const handlePointer = () => isUsingKeyboardRef.current = false;
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("pointerdown", handlePointer, { capture: true });
      document.removeEventListener("pointermove", handlePointer, { capture: true });
    };
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Root2, { ...popperScope, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
    MenuProvider,
    {
      scope: __scopeMenu,
      open,
      onOpenChange: handleOpenChange,
      content,
      onContentChange: setContent,
      children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        MenuRootProvider,
        {
          scope: __scopeMenu,
          onClose: React24.useCallback(() => handleOpenChange(false), [handleOpenChange]),
          isUsingKeyboardRef,
          dir: direction,
          modal,
          children
        }
      )
    }
  ) });
};
Menu.displayName = MENU_NAME;
var ANCHOR_NAME = "MenuAnchor";
var MenuAnchor = React24.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...anchorProps } = props;
    const popperScope = usePopperScope2(__scopeMenu);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Anchor, { ...popperScope, ...anchorProps, ref: forwardedRef });
  }
);
MenuAnchor.displayName = ANCHOR_NAME;
var PORTAL_NAME3 = "MenuPortal";
var [PortalProvider2, usePortalContext2] = createMenuContext(PORTAL_NAME3, {
  forceMount: void 0
});
var MenuPortal = (props) => {
  const { __scopeMenu, forceMount, children, container } = props;
  const context = useMenuContext(PORTAL_NAME3, __scopeMenu);
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(PortalProvider2, { scope: __scopeMenu, forceMount, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Portal, { asChild: true, container, children }) }) });
};
MenuPortal.displayName = PORTAL_NAME3;
var CONTENT_NAME3 = "MenuContent";
var [MenuContentProvider, useMenuContentContext] = createMenuContext(CONTENT_NAME3);
var MenuContent = React24.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext2(CONTENT_NAME3, props.__scopeMenu);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useMenuContext(CONTENT_NAME3, props.__scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME3, props.__scopeMenu);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Collection3.Provider, { scope: props.__scopeMenu, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Collection3.Slot, { scope: props.__scopeMenu, children: rootContext.modal ? /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(MenuRootContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(MenuRootContentNonModal, { ...contentProps, ref: forwardedRef }) }) }) });
  }
);
var MenuRootContentModal = React24.forwardRef(
  (props, forwardedRef) => {
    const context = useMenuContext(CONTENT_NAME3, props.__scopeMenu);
    const ref = React24.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    React24.useEffect(() => {
      const content = ref.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      MenuContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: context.open,
        disableOutsideScroll: true,
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault(),
          { checkForDefaultPrevented: false }
        ),
        onDismiss: () => context.onOpenChange(false)
      }
    );
  }
);
var MenuRootContentNonModal = React24.forwardRef((props, forwardedRef) => {
  const context = useMenuContext(CONTENT_NAME3, props.__scopeMenu);
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
    MenuContentImpl,
    {
      ...props,
      ref: forwardedRef,
      trapFocus: false,
      disableOutsidePointerEvents: false,
      disableOutsideScroll: false,
      onDismiss: () => context.onOpenChange(false)
    }
  );
});
var Slot3 = createSlot("MenuContent.ScrollLock");
var MenuContentImpl = React24.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeMenu,
      loop = false,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      onEntryFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      disableOutsideScroll,
      ...contentProps
    } = props;
    const context = useMenuContext(CONTENT_NAME3, __scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME3, __scopeMenu);
    const popperScope = usePopperScope2(__scopeMenu);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenu);
    const getItems = useCollection3(__scopeMenu);
    const [currentItemId, setCurrentItemId] = React24.useState(null);
    const contentRef = React24.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef, context.onContentChange);
    const timerRef = React24.useRef(0);
    const searchRef = React24.useRef("");
    const pointerGraceTimerRef = React24.useRef(0);
    const pointerGraceIntentRef = React24.useRef(null);
    const pointerDirRef = React24.useRef("right");
    const lastPointerXRef = React24.useRef(0);
    const ScrollLockWrapper = disableOutsideScroll ? Combination_default : React24.Fragment;
    const scrollLockWrapperProps = disableOutsideScroll ? { as: Slot3, allowPinchZoom: true } : void 0;
    const handleTypeaheadSearch = (key2) => {
      const search = searchRef.current + key2;
      const items = getItems().filter((item) => !item.disabled);
      const currentItem = document.activeElement;
      const currentMatch = items.find((item) => item.ref.current === currentItem)?.textValue;
      const values = items.map((item) => item.textValue);
      const nextMatch = getNextMatch(values, search, currentMatch);
      const newItem = items.find((item) => item.textValue === nextMatch)?.ref.current;
      (function updateSearch(value) {
        searchRef.current = value;
        window.clearTimeout(timerRef.current);
        if (value !== "") timerRef.current = window.setTimeout(() => updateSearch(""), 1e3);
      })(search);
      if (newItem) {
        setTimeout(() => newItem.focus());
      }
    };
    React24.useEffect(() => {
      return () => window.clearTimeout(timerRef.current);
    }, []);
    useFocusGuards();
    const isPointerMovingToSubmenu = React24.useCallback((event) => {
      const isMovingTowards = pointerDirRef.current === pointerGraceIntentRef.current?.side;
      return isMovingTowards && isPointerInGraceArea(event, pointerGraceIntentRef.current?.area);
    }, []);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      MenuContentProvider,
      {
        scope: __scopeMenu,
        searchRef,
        onItemEnter: React24.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) event.preventDefault();
          },
          [isPointerMovingToSubmenu]
        ),
        onItemLeave: React24.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) return;
            contentRef.current?.focus();
            setCurrentItemId(null);
          },
          [isPointerMovingToSubmenu]
        ),
        onTriggerLeave: React24.useCallback(
          (event) => {
            if (isPointerMovingToSubmenu(event)) event.preventDefault();
          },
          [isPointerMovingToSubmenu]
        ),
        pointerGraceTimerRef,
        onPointerGraceIntentChange: React24.useCallback((intent) => {
          pointerGraceIntentRef.current = intent;
        }, []),
        children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(ScrollLockWrapper, { ...scrollLockWrapperProps, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          FocusScope,
          {
            asChild: true,
            trapped: trapFocus,
            onMountAutoFocus: composeEventHandlers(onOpenAutoFocus, (event) => {
              event.preventDefault();
              contentRef.current?.focus({ preventScroll: true });
            }),
            onUnmountAutoFocus: onCloseAutoFocus,
            children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
              DismissableLayer,
              {
                asChild: true,
                disableOutsidePointerEvents,
                onEscapeKeyDown,
                onPointerDownOutside,
                onFocusOutside,
                onInteractOutside,
                onDismiss,
                children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                  Root4,
                  {
                    asChild: true,
                    ...rovingFocusGroupScope,
                    dir: rootContext.dir,
                    orientation: "vertical",
                    loop,
                    currentTabStopId: currentItemId,
                    onCurrentTabStopIdChange: setCurrentItemId,
                    onEntryFocus: composeEventHandlers(onEntryFocus, (event) => {
                      if (!rootContext.isUsingKeyboardRef.current) event.preventDefault();
                    }),
                    preventScrollOnEntryFocus: true,
                    children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                      Content,
                      {
                        role: "menu",
                        "aria-orientation": "vertical",
                        "data-state": getOpenState(context.open),
                        "data-radix-menu-content": "",
                        dir: rootContext.dir,
                        ...popperScope,
                        ...contentProps,
                        ref: composedRefs,
                        style: { outline: "none", ...contentProps.style },
                        onKeyDown: composeEventHandlers(contentProps.onKeyDown, (event) => {
                          const target = event.target;
                          const isKeyDownInside = target.closest("[data-radix-menu-content]") === event.currentTarget;
                          const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
                          const isCharacterKey = event.key.length === 1;
                          if (isKeyDownInside) {
                            if (event.key === "Tab") event.preventDefault();
                            if (!isModifierKey && isCharacterKey) handleTypeaheadSearch(event.key);
                          }
                          const content = contentRef.current;
                          if (event.target !== content) return;
                          if (!FIRST_LAST_KEYS.includes(event.key)) return;
                          event.preventDefault();
                          const items = getItems().filter((item) => !item.disabled);
                          const candidateNodes = items.map((item) => item.ref.current);
                          if (LAST_KEYS.includes(event.key)) candidateNodes.reverse();
                          focusFirst3(candidateNodes);
                        }),
                        onBlur: composeEventHandlers(props.onBlur, (event) => {
                          if (!event.currentTarget.contains(event.target)) {
                            window.clearTimeout(timerRef.current);
                            searchRef.current = "";
                          }
                        }),
                        onPointerMove: composeEventHandlers(
                          props.onPointerMove,
                          whenMouse((event) => {
                            const target = event.target;
                            const pointerXHasChanged = lastPointerXRef.current !== event.clientX;
                            if (event.currentTarget.contains(target) && pointerXHasChanged) {
                              const newDir = event.clientX > lastPointerXRef.current ? "right" : "left";
                              pointerDirRef.current = newDir;
                              lastPointerXRef.current = event.clientX;
                            }
                          })
                        )
                      }
                    )
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
MenuContent.displayName = CONTENT_NAME3;
var GROUP_NAME3 = "MenuGroup";
var MenuGroup = React24.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...groupProps } = props;
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Primitive.div, { role: "group", ...groupProps, ref: forwardedRef });
  }
);
MenuGroup.displayName = GROUP_NAME3;
var LABEL_NAME2 = "MenuLabel";
var MenuLabel = React24.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...labelProps } = props;
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Primitive.div, { ...labelProps, ref: forwardedRef });
  }
);
MenuLabel.displayName = LABEL_NAME2;
var ITEM_NAME3 = "MenuItem";
var ITEM_SELECT = "menu.itemSelect";
var MenuItem = React24.forwardRef(
  (props, forwardedRef) => {
    const { disabled = false, onSelect, ...itemProps } = props;
    const ref = React24.useRef(null);
    const rootContext = useMenuRootContext(ITEM_NAME3, props.__scopeMenu);
    const contentContext = useMenuContentContext(ITEM_NAME3, props.__scopeMenu);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const isPointerDownRef = React24.useRef(false);
    const handleSelect = () => {
      const menuItem = ref.current;
      if (!disabled && menuItem) {
        const itemSelectEvent = new CustomEvent(ITEM_SELECT, { bubbles: true, cancelable: true });
        menuItem.addEventListener(ITEM_SELECT, (event) => onSelect?.(event), { once: true });
        dispatchDiscreteCustomEvent(menuItem, itemSelectEvent);
        if (itemSelectEvent.defaultPrevented) {
          isPointerDownRef.current = false;
        } else {
          rootContext.onClose();
        }
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      MenuItemImpl,
      {
        ...itemProps,
        ref: composedRefs,
        disabled,
        onClick: composeEventHandlers(props.onClick, handleSelect),
        onPointerDown: (event) => {
          props.onPointerDown?.(event);
          isPointerDownRef.current = true;
        },
        onPointerUp: composeEventHandlers(props.onPointerUp, (event) => {
          if (!isPointerDownRef.current) event.currentTarget?.click();
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isTypingAhead = contentContext.searchRef.current !== "";
          if (disabled || isTypingAhead && event.key === " ") return;
          if (SELECTION_KEYS2.includes(event.key)) {
            event.currentTarget.click();
            event.preventDefault();
          }
        })
      }
    );
  }
);
MenuItem.displayName = ITEM_NAME3;
var MenuItemImpl = React24.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, disabled = false, textValue, ...itemProps } = props;
    const contentContext = useMenuContentContext(ITEM_NAME3, __scopeMenu);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenu);
    const ref = React24.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const [isFocused, setIsFocused] = React24.useState(false);
    const [textContent, setTextContent] = React24.useState("");
    React24.useEffect(() => {
      const menuItem = ref.current;
      if (menuItem) {
        setTextContent((menuItem.textContent ?? "").trim());
      }
    }, [itemProps.children]);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      Collection3.ItemSlot,
      {
        scope: __scopeMenu,
        disabled,
        textValue: textValue ?? textContent,
        children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Item2, { asChild: true, ...rovingFocusGroupScope, focusable: !disabled, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          Primitive.div,
          {
            role: "menuitem",
            "data-highlighted": isFocused ? "" : void 0,
            "aria-disabled": disabled || void 0,
            "data-disabled": disabled ? "" : void 0,
            ...itemProps,
            ref: composedRefs,
            onPointerMove: composeEventHandlers(
              props.onPointerMove,
              whenMouse((event) => {
                if (disabled) {
                  contentContext.onItemLeave(event);
                } else {
                  contentContext.onItemEnter(event);
                  if (!event.defaultPrevented) {
                    const item = event.currentTarget;
                    item.focus({ preventScroll: true });
                  }
                }
              })
            ),
            onPointerLeave: composeEventHandlers(
              props.onPointerLeave,
              whenMouse((event) => contentContext.onItemLeave(event))
            ),
            onFocus: composeEventHandlers(props.onFocus, () => setIsFocused(true)),
            onBlur: composeEventHandlers(props.onBlur, () => setIsFocused(false))
          }
        ) })
      }
    );
  }
);
var CHECKBOX_ITEM_NAME = "MenuCheckboxItem";
var MenuCheckboxItem = React24.forwardRef(
  (props, forwardedRef) => {
    const { checked = false, onCheckedChange, ...checkboxItemProps } = props;
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(ItemIndicatorProvider, { scope: props.__scopeMenu, checked, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      MenuItem,
      {
        role: "menuitemcheckbox",
        "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
        ...checkboxItemProps,
        ref: forwardedRef,
        "data-state": getCheckedState(checked),
        onSelect: composeEventHandlers(
          checkboxItemProps.onSelect,
          () => onCheckedChange?.(isIndeterminate(checked) ? true : !checked),
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
MenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME;
var RADIO_GROUP_NAME = "MenuRadioGroup";
var [RadioGroupProvider, useRadioGroupContext] = createMenuContext(
  RADIO_GROUP_NAME,
  { value: void 0, onValueChange: () => {
  } }
);
var MenuRadioGroup = React24.forwardRef(
  (props, forwardedRef) => {
    const { value, onValueChange, ...groupProps } = props;
    const handleValueChange = useCallbackRef(onValueChange);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(RadioGroupProvider, { scope: props.__scopeMenu, value, onValueChange: handleValueChange, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(MenuGroup, { ...groupProps, ref: forwardedRef }) });
  }
);
MenuRadioGroup.displayName = RADIO_GROUP_NAME;
var RADIO_ITEM_NAME = "MenuRadioItem";
var MenuRadioItem = React24.forwardRef(
  (props, forwardedRef) => {
    const { value, ...radioItemProps } = props;
    const context = useRadioGroupContext(RADIO_ITEM_NAME, props.__scopeMenu);
    const checked = value === context.value;
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(ItemIndicatorProvider, { scope: props.__scopeMenu, checked, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      MenuItem,
      {
        role: "menuitemradio",
        "aria-checked": checked,
        ...radioItemProps,
        ref: forwardedRef,
        "data-state": getCheckedState(checked),
        onSelect: composeEventHandlers(
          radioItemProps.onSelect,
          () => context.onValueChange?.(value),
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
MenuRadioItem.displayName = RADIO_ITEM_NAME;
var ITEM_INDICATOR_NAME2 = "MenuItemIndicator";
var [ItemIndicatorProvider, useItemIndicatorContext] = createMenuContext(
  ITEM_INDICATOR_NAME2,
  { checked: false }
);
var MenuItemIndicator = React24.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, forceMount, ...itemIndicatorProps } = props;
    const indicatorContext = useItemIndicatorContext(ITEM_INDICATOR_NAME2, __scopeMenu);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      Presence,
      {
        present: forceMount || isIndeterminate(indicatorContext.checked) || indicatorContext.checked === true,
        children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
          Primitive.span,
          {
            ...itemIndicatorProps,
            ref: forwardedRef,
            "data-state": getCheckedState(indicatorContext.checked)
          }
        )
      }
    );
  }
);
MenuItemIndicator.displayName = ITEM_INDICATOR_NAME2;
var SEPARATOR_NAME2 = "MenuSeparator";
var MenuSeparator = React24.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...separatorProps } = props;
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      Primitive.div,
      {
        role: "separator",
        "aria-orientation": "horizontal",
        ...separatorProps,
        ref: forwardedRef
      }
    );
  }
);
MenuSeparator.displayName = SEPARATOR_NAME2;
var ARROW_NAME2 = "MenuArrow";
var MenuArrow = React24.forwardRef(
  (props, forwardedRef) => {
    const { __scopeMenu, ...arrowProps } = props;
    const popperScope = usePopperScope2(__scopeMenu);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
MenuArrow.displayName = ARROW_NAME2;
var SUB_NAME = "MenuSub";
var [MenuSubProvider, useMenuSubContext] = createMenuContext(SUB_NAME);
var MenuSub = (props) => {
  const { __scopeMenu, children, open = false, onOpenChange } = props;
  const parentMenuContext = useMenuContext(SUB_NAME, __scopeMenu);
  const popperScope = usePopperScope2(__scopeMenu);
  const [trigger, setTrigger] = React24.useState(null);
  const [content, setContent] = React24.useState(null);
  const handleOpenChange = useCallbackRef(onOpenChange);
  React24.useEffect(() => {
    if (parentMenuContext.open === false) handleOpenChange(false);
    return () => handleOpenChange(false);
  }, [parentMenuContext.open, handleOpenChange]);
  return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Root2, { ...popperScope, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
    MenuProvider,
    {
      scope: __scopeMenu,
      open,
      onOpenChange: handleOpenChange,
      content,
      onContentChange: setContent,
      children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        MenuSubProvider,
        {
          scope: __scopeMenu,
          contentId: useId(),
          triggerId: useId(),
          trigger,
          onTriggerChange: setTrigger,
          children
        }
      )
    }
  ) });
};
MenuSub.displayName = SUB_NAME;
var SUB_TRIGGER_NAME = "MenuSubTrigger";
var MenuSubTrigger = React24.forwardRef(
  (props, forwardedRef) => {
    const context = useMenuContext(SUB_TRIGGER_NAME, props.__scopeMenu);
    const rootContext = useMenuRootContext(SUB_TRIGGER_NAME, props.__scopeMenu);
    const subContext = useMenuSubContext(SUB_TRIGGER_NAME, props.__scopeMenu);
    const contentContext = useMenuContentContext(SUB_TRIGGER_NAME, props.__scopeMenu);
    const openTimerRef = React24.useRef(null);
    const { pointerGraceTimerRef, onPointerGraceIntentChange } = contentContext;
    const scope = { __scopeMenu: props.__scopeMenu };
    const clearOpenTimer = React24.useCallback(() => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }, []);
    React24.useEffect(() => clearOpenTimer, [clearOpenTimer]);
    React24.useEffect(() => {
      const pointerGraceTimer = pointerGraceTimerRef.current;
      return () => {
        window.clearTimeout(pointerGraceTimer);
        onPointerGraceIntentChange(null);
      };
    }, [pointerGraceTimerRef, onPointerGraceIntentChange]);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(MenuAnchor, { asChild: true, ...scope, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      MenuItemImpl,
      {
        id: subContext.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": context.open,
        "aria-controls": subContext.contentId,
        "data-state": getOpenState(context.open),
        ...props,
        ref: composeRefs(forwardedRef, subContext.onTriggerChange),
        onClick: (event) => {
          props.onClick?.(event);
          if (props.disabled || event.defaultPrevented) return;
          event.currentTarget.focus();
          if (!context.open) context.onOpenChange(true);
        },
        onPointerMove: composeEventHandlers(
          props.onPointerMove,
          whenMouse((event) => {
            contentContext.onItemEnter(event);
            if (event.defaultPrevented) return;
            if (!props.disabled && !context.open && !openTimerRef.current) {
              contentContext.onPointerGraceIntentChange(null);
              openTimerRef.current = window.setTimeout(() => {
                context.onOpenChange(true);
                clearOpenTimer();
              }, 100);
            }
          })
        ),
        onPointerLeave: composeEventHandlers(
          props.onPointerLeave,
          whenMouse((event) => {
            clearOpenTimer();
            const contentRect = context.content?.getBoundingClientRect();
            if (contentRect) {
              const side = context.content?.dataset.side;
              const rightSide = side === "right";
              const bleed = rightSide ? -5 : 5;
              const contentNearEdge = contentRect[rightSide ? "left" : "right"];
              const contentFarEdge = contentRect[rightSide ? "right" : "left"];
              contentContext.onPointerGraceIntentChange({
                area: [
                  // Apply a bleed on clientX to ensure that our exit point is
                  // consistently within polygon bounds
                  { x: event.clientX + bleed, y: event.clientY },
                  { x: contentNearEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.top },
                  { x: contentFarEdge, y: contentRect.bottom },
                  { x: contentNearEdge, y: contentRect.bottom }
                ],
                side
              });
              window.clearTimeout(pointerGraceTimerRef.current);
              pointerGraceTimerRef.current = window.setTimeout(
                () => contentContext.onPointerGraceIntentChange(null),
                300
              );
            } else {
              contentContext.onTriggerLeave(event);
              if (event.defaultPrevented) return;
              contentContext.onPointerGraceIntentChange(null);
            }
          })
        ),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isTypingAhead = contentContext.searchRef.current !== "";
          if (props.disabled || isTypingAhead && event.key === " ") return;
          if (SUB_OPEN_KEYS[rootContext.dir].includes(event.key)) {
            context.onOpenChange(true);
            context.content?.focus();
            event.preventDefault();
          }
        })
      }
    ) });
  }
);
MenuSubTrigger.displayName = SUB_TRIGGER_NAME;
var SUB_CONTENT_NAME = "MenuSubContent";
var MenuSubContent = React24.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext2(CONTENT_NAME3, props.__scopeMenu);
    const { forceMount = portalContext.forceMount, ...subContentProps } = props;
    const context = useMenuContext(CONTENT_NAME3, props.__scopeMenu);
    const rootContext = useMenuRootContext(CONTENT_NAME3, props.__scopeMenu);
    const subContext = useMenuSubContext(SUB_CONTENT_NAME, props.__scopeMenu);
    const ref = React24.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Collection3.Provider, { scope: props.__scopeMenu, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(Collection3.Slot, { scope: props.__scopeMenu, children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
      MenuContentImpl,
      {
        id: subContext.contentId,
        "aria-labelledby": subContext.triggerId,
        ...subContentProps,
        ref: composedRefs,
        align: "start",
        side: rootContext.dir === "rtl" ? "left" : "right",
        disableOutsidePointerEvents: false,
        disableOutsideScroll: false,
        trapFocus: false,
        onOpenAutoFocus: (event) => {
          if (rootContext.isUsingKeyboardRef.current) ref.current?.focus();
          event.preventDefault();
        },
        onCloseAutoFocus: (event) => event.preventDefault(),
        onFocusOutside: composeEventHandlers(props.onFocusOutside, (event) => {
          if (event.target !== subContext.trigger) context.onOpenChange(false);
        }),
        onEscapeKeyDown: composeEventHandlers(props.onEscapeKeyDown, (event) => {
          rootContext.onClose();
          event.preventDefault();
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          const isKeyDownInside = event.currentTarget.contains(event.target);
          const isCloseKey = SUB_CLOSE_KEYS[rootContext.dir].includes(event.key);
          if (isKeyDownInside && isCloseKey) {
            context.onOpenChange(false);
            subContext.trigger?.focus();
            event.preventDefault();
          }
        })
      }
    ) }) }) });
  }
);
MenuSubContent.displayName = SUB_CONTENT_NAME;
function getOpenState(open) {
  return open ? "open" : "closed";
}
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getCheckedState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
function focusFirst3(candidates) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus();
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray3(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
function getNextMatch(values, search, currentMatch) {
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? search[0] : search;
  const currentMatchIndex = currentMatch ? values.indexOf(currentMatch) : -1;
  let wrappedValues = wrapArray3(values, Math.max(currentMatchIndex, 0));
  const excludeCurrentMatch = normalizedSearch.length === 1;
  if (excludeCurrentMatch) wrappedValues = wrappedValues.filter((v) => v !== currentMatch);
  const nextMatch = wrappedValues.find(
    (value) => value.toLowerCase().startsWith(normalizedSearch.toLowerCase())
  );
  return nextMatch !== currentMatch ? nextMatch : void 0;
}
function isPointInPolygon(point, polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const ii = polygon[i];
    const jj = polygon[j];
    const xi = ii.x;
    const yi = ii.y;
    const xj = jj.x;
    const yj = jj.y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function isPointerInGraceArea(event, area) {
  if (!area) return false;
  const cursorPos = { x: event.clientX, y: event.clientY };
  return isPointInPolygon(cursorPos, area);
}
function whenMouse(handler) {
  return (event) => event.pointerType === "mouse" ? handler(event) : void 0;
}
var Root32 = Menu;
var Anchor2 = MenuAnchor;
var Portal4 = MenuPortal;
var Content23 = MenuContent;
var Group2 = MenuGroup;
var Label2 = MenuLabel;
var Item22 = MenuItem;
var CheckboxItem = MenuCheckboxItem;
var RadioGroup = MenuRadioGroup;
var RadioItem = MenuRadioItem;
var ItemIndicator2 = MenuItemIndicator;
var Separator2 = MenuSeparator;
var Arrow2 = MenuArrow;
var SubTrigger = MenuSubTrigger;
var SubContent = MenuSubContent;

// ../node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs
var import_jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
var DROPDOWN_MENU_NAME = "DropdownMenu";
var [createDropdownMenuContext, createDropdownMenuScope] = createContextScope(
  DROPDOWN_MENU_NAME,
  [createMenuScope]
);
var useMenuScope = createMenuScope();
var [DropdownMenuProvider, useDropdownMenuContext] = createDropdownMenuContext(DROPDOWN_MENU_NAME);
var DropdownMenu = (props) => {
  const {
    __scopeDropdownMenu,
    children,
    dir,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  const triggerRef = React25.useRef(null);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: DROPDOWN_MENU_NAME
  });
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
    DropdownMenuProvider,
    {
      scope: __scopeDropdownMenu,
      triggerId: useId(),
      triggerRef,
      contentId: useId(),
      open,
      onOpenChange: setOpen,
      onOpenToggle: React25.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Root32, { ...menuScope, open, onOpenChange: setOpen, dir, modal, children })
    }
  );
};
DropdownMenu.displayName = DROPDOWN_MENU_NAME;
var TRIGGER_NAME3 = "DropdownMenuTrigger";
var DropdownMenuTrigger = React25.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, disabled = false, ...triggerProps } = props;
    const context = useDropdownMenuContext(TRIGGER_NAME3, __scopeDropdownMenu);
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Anchor2, { asChild: true, ...menuScope, children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      Primitive.button,
      {
        type: "button",
        id: context.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": context.open,
        "aria-controls": context.open ? context.contentId : void 0,
        "data-state": context.open ? "open" : "closed",
        "data-disabled": disabled ? "" : void 0,
        disabled,
        ...triggerProps,
        ref: composeRefs(forwardedRef, context.triggerRef),
        onPointerDown: composeEventHandlers(props.onPointerDown, (event) => {
          if (!disabled && event.button === 0 && event.ctrlKey === false) {
            context.onOpenToggle();
            if (!context.open) event.preventDefault();
          }
        }),
        onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
          if (disabled) return;
          if (["Enter", " "].includes(event.key)) context.onOpenToggle();
          if (event.key === "ArrowDown") context.onOpenChange(true);
          if (["Enter", " ", "ArrowDown"].includes(event.key)) event.preventDefault();
        })
      }
    ) });
  }
);
DropdownMenuTrigger.displayName = TRIGGER_NAME3;
var PORTAL_NAME4 = "DropdownMenuPortal";
var DropdownMenuPortal = (props) => {
  const { __scopeDropdownMenu, ...portalProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Portal4, { ...menuScope, ...portalProps });
};
DropdownMenuPortal.displayName = PORTAL_NAME4;
var CONTENT_NAME4 = "DropdownMenuContent";
var DropdownMenuContent = React25.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...contentProps } = props;
    const context = useDropdownMenuContext(CONTENT_NAME4, __scopeDropdownMenu);
    const menuScope = useMenuScope(__scopeDropdownMenu);
    const hasInteractedOutsideRef = React25.useRef(false);
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
      Content23,
      {
        id: context.contentId,
        "aria-labelledby": context.triggerId,
        ...menuScope,
        ...contentProps,
        ref: forwardedRef,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
          hasInteractedOutsideRef.current = false;
          event.preventDefault();
        }),
        onInteractOutside: composeEventHandlers(props.onInteractOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (!context.modal || isRightClick) hasInteractedOutsideRef.current = true;
        }),
        style: {
          ...props.style,
          // re-namespace exposed content custom properties
          ...{
            "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
            "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
            "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
            "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
            "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
          }
        }
      }
    );
  }
);
DropdownMenuContent.displayName = CONTENT_NAME4;
var GROUP_NAME4 = "DropdownMenuGroup";
var DropdownMenuGroup = React25.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...groupProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Group2, { ...menuScope, ...groupProps, ref: forwardedRef });
  }
);
DropdownMenuGroup.displayName = GROUP_NAME4;
var LABEL_NAME3 = "DropdownMenuLabel";
var DropdownMenuLabel = React25.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...labelProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Label2, { ...menuScope, ...labelProps, ref: forwardedRef });
  }
);
DropdownMenuLabel.displayName = LABEL_NAME3;
var ITEM_NAME4 = "DropdownMenuItem";
var DropdownMenuItem = React25.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...itemProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Item22, { ...menuScope, ...itemProps, ref: forwardedRef });
  }
);
DropdownMenuItem.displayName = ITEM_NAME4;
var CHECKBOX_ITEM_NAME2 = "DropdownMenuCheckboxItem";
var DropdownMenuCheckboxItem = React25.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...checkboxItemProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(CheckboxItem, { ...menuScope, ...checkboxItemProps, ref: forwardedRef });
});
DropdownMenuCheckboxItem.displayName = CHECKBOX_ITEM_NAME2;
var RADIO_GROUP_NAME2 = "DropdownMenuRadioGroup";
var DropdownMenuRadioGroup = React25.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...radioGroupProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(RadioGroup, { ...menuScope, ...radioGroupProps, ref: forwardedRef });
});
DropdownMenuRadioGroup.displayName = RADIO_GROUP_NAME2;
var RADIO_ITEM_NAME2 = "DropdownMenuRadioItem";
var DropdownMenuRadioItem = React25.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...radioItemProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(RadioItem, { ...menuScope, ...radioItemProps, ref: forwardedRef });
});
DropdownMenuRadioItem.displayName = RADIO_ITEM_NAME2;
var INDICATOR_NAME2 = "DropdownMenuItemIndicator";
var DropdownMenuItemIndicator = React25.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...itemIndicatorProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(ItemIndicator2, { ...menuScope, ...itemIndicatorProps, ref: forwardedRef });
});
DropdownMenuItemIndicator.displayName = INDICATOR_NAME2;
var SEPARATOR_NAME3 = "DropdownMenuSeparator";
var DropdownMenuSeparator = React25.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...separatorProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Separator2, { ...menuScope, ...separatorProps, ref: forwardedRef });
});
DropdownMenuSeparator.displayName = SEPARATOR_NAME3;
var ARROW_NAME3 = "DropdownMenuArrow";
var DropdownMenuArrow = React25.forwardRef(
  (props, forwardedRef) => {
    const { __scopeDropdownMenu, ...arrowProps } = props;
    const menuScope = useMenuScope(__scopeDropdownMenu);
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(Arrow2, { ...menuScope, ...arrowProps, ref: forwardedRef });
  }
);
DropdownMenuArrow.displayName = ARROW_NAME3;
var SUB_TRIGGER_NAME2 = "DropdownMenuSubTrigger";
var DropdownMenuSubTrigger = React25.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...subTriggerProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(SubTrigger, { ...menuScope, ...subTriggerProps, ref: forwardedRef });
});
DropdownMenuSubTrigger.displayName = SUB_TRIGGER_NAME2;
var SUB_CONTENT_NAME2 = "DropdownMenuSubContent";
var DropdownMenuSubContent = React25.forwardRef((props, forwardedRef) => {
  const { __scopeDropdownMenu, ...subContentProps } = props;
  const menuScope = useMenuScope(__scopeDropdownMenu);
  return /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
    SubContent,
    {
      ...menuScope,
      ...subContentProps,
      ref: forwardedRef,
      style: {
        ...props.style,
        // re-namespace exposed content custom properties
        ...{
          "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
          "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
          "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    }
  );
});
DropdownMenuSubContent.displayName = SUB_CONTENT_NAME2;
var Root23 = DropdownMenu;
var Trigger3 = DropdownMenuTrigger;
var Portal22 = DropdownMenuPortal;
var Content24 = DropdownMenuContent;
var Label22 = DropdownMenuLabel;
var Item23 = DropdownMenuItem;
var CheckboxItem2 = DropdownMenuCheckboxItem;
var RadioItem2 = DropdownMenuRadioItem;
var ItemIndicator22 = DropdownMenuItemIndicator;
var Separator22 = DropdownMenuSeparator;
var SubTrigger2 = DropdownMenuSubTrigger;
var SubContent2 = DropdownMenuSubContent;

// src/components/ui/dropdown-menu.tsx
var import_jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
var DropdownMenu2 = Root23;
var DropdownMenuTrigger2 = Trigger3;
var DropdownMenuSubTrigger2 = React26.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(ChevronRight, { className: "ml-auto h-4 w-4" })
    ]
  }
));
DropdownMenuSubTrigger2.displayName = SubTrigger2.displayName;
var DropdownMenuSubContent2 = React26.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent2.displayName = SubContent2.displayName;
var DropdownMenuContent2 = React26.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Portal22, { children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
  Content24,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent2.displayName = Content24.displayName;
var DropdownMenuItem2 = React26.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
  Item23,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem2.displayName = Item23.displayName;
var DropdownMenuCheckboxItem2 = React26.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(ItemIndicator22, { children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem2.displayName = CheckboxItem2.displayName;
var DropdownMenuRadioItem2 = React26.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(ItemIndicator22, { children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem2.displayName = RadioItem2.displayName;
var DropdownMenuLabel2 = React26.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
  Label22,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuLabel2.displayName = Label22.displayName;
var DropdownMenuSeparator2 = React26.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
  Separator22,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator2.displayName = Separator22.displayName;
var DropdownMenuShortcut = ({
  className,
  ...props
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
    "span",
    {
      className: cn("ml-auto text-xs tracking-widest opacity-60", className),
      ...props
    }
  );
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// src/hooks/useConfetti.tsx
var import_react9 = __toESM(require_react(), 1);

// ../node_modules/canvas-confetti/dist/confetti.module.mjs
var module = {};
(function main(global, module2, isWorker, workerSize) {
  var canUseWorker = !!(global.Worker && global.Blob && global.Promise && global.OffscreenCanvas && global.OffscreenCanvasRenderingContext2D && global.HTMLCanvasElement && global.HTMLCanvasElement.prototype.transferControlToOffscreen && global.URL && global.URL.createObjectURL);
  var canUsePaths = typeof Path2D === "function" && typeof DOMMatrix === "function";
  var canDrawBitmap = function() {
    if (!global.OffscreenCanvas) {
      return false;
    }
    var canvas = new OffscreenCanvas(1, 1);
    var ctx = canvas.getContext("2d");
    ctx.fillRect(0, 0, 1, 1);
    var bitmap = canvas.transferToImageBitmap();
    try {
      ctx.createPattern(bitmap, "no-repeat");
    } catch (e) {
      return false;
    }
    return true;
  }();
  function noop2() {
  }
  function promise(func) {
    var ModulePromise = module2.exports.Promise;
    var Prom = ModulePromise !== void 0 ? ModulePromise : global.Promise;
    if (typeof Prom === "function") {
      return new Prom(func);
    }
    func(noop2, noop2);
    return null;
  }
  var bitmapMapper = /* @__PURE__ */ function(skipTransform, map) {
    return {
      transform: function(bitmap) {
        if (skipTransform) {
          return bitmap;
        }
        if (map.has(bitmap)) {
          return map.get(bitmap);
        }
        var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);
        map.set(bitmap, canvas);
        return canvas;
      },
      clear: function() {
        map.clear();
      }
    };
  }(canDrawBitmap, /* @__PURE__ */ new Map());
  var raf = function() {
    var TIME = Math.floor(1e3 / 60);
    var frame, cancel;
    var frames = {};
    var lastFrameTime = 0;
    if (typeof requestAnimationFrame === "function" && typeof cancelAnimationFrame === "function") {
      frame = function(cb) {
        var id = Math.random();
        frames[id] = requestAnimationFrame(function onFrame(time) {
          if (lastFrameTime === time || lastFrameTime + TIME - 1 < time) {
            lastFrameTime = time;
            delete frames[id];
            cb();
          } else {
            frames[id] = requestAnimationFrame(onFrame);
          }
        });
        return id;
      };
      cancel = function(id) {
        if (frames[id]) {
          cancelAnimationFrame(frames[id]);
        }
      };
    } else {
      frame = function(cb) {
        return setTimeout(cb, TIME);
      };
      cancel = function(timer) {
        return clearTimeout(timer);
      };
    }
    return { frame, cancel };
  }();
  var getWorker = /* @__PURE__ */ function() {
    var worker;
    var prom;
    var resolves = {};
    function decorate(worker2) {
      function execute(options, callback) {
        worker2.postMessage({ options: options || {}, callback });
      }
      worker2.init = function initWorker(canvas) {
        var offscreen = canvas.transferControlToOffscreen();
        worker2.postMessage({ canvas: offscreen }, [offscreen]);
      };
      worker2.fire = function fireWorker(options, size, done) {
        if (prom) {
          execute(options, null);
          return prom;
        }
        var id = Math.random().toString(36).slice(2);
        prom = promise(function(resolve) {
          function workerDone(msg) {
            if (msg.data.callback !== id) {
              return;
            }
            delete resolves[id];
            worker2.removeEventListener("message", workerDone);
            prom = null;
            bitmapMapper.clear();
            done();
            resolve();
          }
          worker2.addEventListener("message", workerDone);
          execute(options, id);
          resolves[id] = workerDone.bind(null, { data: { callback: id } });
        });
        return prom;
      };
      worker2.reset = function resetWorker() {
        worker2.postMessage({ reset: true });
        for (var id in resolves) {
          resolves[id]();
          delete resolves[id];
        }
      };
    }
    return function() {
      if (worker) {
        return worker;
      }
      if (!isWorker && canUseWorker) {
        var code = [
          "var CONFETTI, SIZE = {}, module = {};",
          "(" + main.toString() + ")(this, module, true, SIZE);",
          "onmessage = function(msg) {",
          "  if (msg.data.options) {",
          "    CONFETTI(msg.data.options).then(function () {",
          "      if (msg.data.callback) {",
          "        postMessage({ callback: msg.data.callback });",
          "      }",
          "    });",
          "  } else if (msg.data.reset) {",
          "    CONFETTI && CONFETTI.reset();",
          "  } else if (msg.data.resize) {",
          "    SIZE.width = msg.data.resize.width;",
          "    SIZE.height = msg.data.resize.height;",
          "  } else if (msg.data.canvas) {",
          "    SIZE.width = msg.data.canvas.width;",
          "    SIZE.height = msg.data.canvas.height;",
          "    CONFETTI = module.exports.create(msg.data.canvas);",
          "  }",
          "}"
        ].join("\n");
        try {
          worker = new Worker(URL.createObjectURL(new Blob([code])));
        } catch (e) {
          typeof console !== void 0 && typeof console.warn === "function" ? console.warn("\u{1F38A} Could not load worker", e) : null;
          return null;
        }
        decorate(worker);
      }
      return worker;
    };
  }();
  var defaults = {
    particleCount: 50,
    angle: 90,
    spread: 45,
    startVelocity: 45,
    decay: 0.9,
    gravity: 1,
    drift: 0,
    ticks: 200,
    x: 0.5,
    y: 0.5,
    shapes: ["square", "circle"],
    zIndex: 100,
    colors: [
      "#26ccff",
      "#a25afd",
      "#ff5e7e",
      "#88ff5a",
      "#fcff42",
      "#ffa62d",
      "#ff36ff"
    ],
    // probably should be true, but back-compat
    disableForReducedMotion: false,
    scalar: 1
  };
  function convert(val, transform) {
    return transform ? transform(val) : val;
  }
  function isOk(val) {
    return !(val === null || val === void 0);
  }
  function prop(options, name, transform) {
    return convert(
      options && isOk(options[name]) ? options[name] : defaults[name],
      transform
    );
  }
  function onlyPositiveInt(number) {
    return number < 0 ? 0 : Math.floor(number);
  }
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  function toDecimal(str) {
    return parseInt(str, 16);
  }
  function colorsToRgb(colors) {
    return colors.map(hexToRgb);
  }
  function hexToRgb(str) {
    var val = String(str).replace(/[^0-9a-f]/gi, "");
    if (val.length < 6) {
      val = val[0] + val[0] + val[1] + val[1] + val[2] + val[2];
    }
    return {
      r: toDecimal(val.substring(0, 2)),
      g: toDecimal(val.substring(2, 4)),
      b: toDecimal(val.substring(4, 6))
    };
  }
  function getOrigin(options) {
    var origin = prop(options, "origin", Object);
    origin.x = prop(origin, "x", Number);
    origin.y = prop(origin, "y", Number);
    return origin;
  }
  function setCanvasWindowSize(canvas) {
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
  }
  function setCanvasRectSize(canvas) {
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  function getCanvas(zIndex) {
    var canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = zIndex;
    return canvas;
  }
  function ellipse(context, x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    context.scale(radiusX, radiusY);
    context.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
    context.restore();
  }
  function randomPhysics(opts) {
    var radAngle = opts.angle * (Math.PI / 180);
    var radSpread = opts.spread * (Math.PI / 180);
    return {
      x: opts.x,
      y: opts.y,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
      velocity: opts.startVelocity * 0.5 + Math.random() * opts.startVelocity,
      angle2D: -radAngle + (0.5 * radSpread - Math.random() * radSpread),
      tiltAngle: (Math.random() * (0.75 - 0.25) + 0.25) * Math.PI,
      color: opts.color,
      shape: opts.shape,
      tick: 0,
      totalTicks: opts.ticks,
      decay: opts.decay,
      drift: opts.drift,
      random: Math.random() + 2,
      tiltSin: 0,
      tiltCos: 0,
      wobbleX: 0,
      wobbleY: 0,
      gravity: opts.gravity * 3,
      ovalScalar: 0.6,
      scalar: opts.scalar,
      flat: opts.flat
    };
  }
  function updateFetti(context, fetti) {
    fetti.x += Math.cos(fetti.angle2D) * fetti.velocity + fetti.drift;
    fetti.y += Math.sin(fetti.angle2D) * fetti.velocity + fetti.gravity;
    fetti.velocity *= fetti.decay;
    if (fetti.flat) {
      fetti.wobble = 0;
      fetti.wobbleX = fetti.x + 10 * fetti.scalar;
      fetti.wobbleY = fetti.y + 10 * fetti.scalar;
      fetti.tiltSin = 0;
      fetti.tiltCos = 0;
      fetti.random = 1;
    } else {
      fetti.wobble += fetti.wobbleSpeed;
      fetti.wobbleX = fetti.x + 10 * fetti.scalar * Math.cos(fetti.wobble);
      fetti.wobbleY = fetti.y + 10 * fetti.scalar * Math.sin(fetti.wobble);
      fetti.tiltAngle += 0.1;
      fetti.tiltSin = Math.sin(fetti.tiltAngle);
      fetti.tiltCos = Math.cos(fetti.tiltAngle);
      fetti.random = Math.random() + 2;
    }
    var progress = fetti.tick++ / fetti.totalTicks;
    var x1 = fetti.x + fetti.random * fetti.tiltCos;
    var y1 = fetti.y + fetti.random * fetti.tiltSin;
    var x2 = fetti.wobbleX + fetti.random * fetti.tiltCos;
    var y2 = fetti.wobbleY + fetti.random * fetti.tiltSin;
    context.fillStyle = "rgba(" + fetti.color.r + ", " + fetti.color.g + ", " + fetti.color.b + ", " + (1 - progress) + ")";
    context.beginPath();
    if (canUsePaths && fetti.shape.type === "path" && typeof fetti.shape.path === "string" && Array.isArray(fetti.shape.matrix)) {
      context.fill(transformPath2D(
        fetti.shape.path,
        fetti.shape.matrix,
        fetti.x,
        fetti.y,
        Math.abs(x2 - x1) * 0.1,
        Math.abs(y2 - y1) * 0.1,
        Math.PI / 10 * fetti.wobble
      ));
    } else if (fetti.shape.type === "bitmap") {
      var rotation = Math.PI / 10 * fetti.wobble;
      var scaleX = Math.abs(x2 - x1) * 0.1;
      var scaleY = Math.abs(y2 - y1) * 0.1;
      var width = fetti.shape.bitmap.width * fetti.scalar;
      var height = fetti.shape.bitmap.height * fetti.scalar;
      var matrix = new DOMMatrix([
        Math.cos(rotation) * scaleX,
        Math.sin(rotation) * scaleX,
        -Math.sin(rotation) * scaleY,
        Math.cos(rotation) * scaleY,
        fetti.x,
        fetti.y
      ]);
      matrix.multiplySelf(new DOMMatrix(fetti.shape.matrix));
      var pattern = context.createPattern(bitmapMapper.transform(fetti.shape.bitmap), "no-repeat");
      pattern.setTransform(matrix);
      context.globalAlpha = 1 - progress;
      context.fillStyle = pattern;
      context.fillRect(
        fetti.x - width / 2,
        fetti.y - height / 2,
        width,
        height
      );
      context.globalAlpha = 1;
    } else if (fetti.shape === "circle") {
      context.ellipse ? context.ellipse(fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI) : ellipse(context, fetti.x, fetti.y, Math.abs(x2 - x1) * fetti.ovalScalar, Math.abs(y2 - y1) * fetti.ovalScalar, Math.PI / 10 * fetti.wobble, 0, 2 * Math.PI);
    } else if (fetti.shape === "star") {
      var rot = Math.PI / 2 * 3;
      var innerRadius = 4 * fetti.scalar;
      var outerRadius = 8 * fetti.scalar;
      var x = fetti.x;
      var y = fetti.y;
      var spikes = 5;
      var step = Math.PI / spikes;
      while (spikes--) {
        x = fetti.x + Math.cos(rot) * outerRadius;
        y = fetti.y + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;
        x = fetti.x + Math.cos(rot) * innerRadius;
        y = fetti.y + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
    } else {
      context.moveTo(Math.floor(fetti.x), Math.floor(fetti.y));
      context.lineTo(Math.floor(fetti.wobbleX), Math.floor(y1));
      context.lineTo(Math.floor(x2), Math.floor(y2));
      context.lineTo(Math.floor(x1), Math.floor(fetti.wobbleY));
    }
    context.closePath();
    context.fill();
    return fetti.tick < fetti.totalTicks;
  }
  function animate(canvas, fettis, resizer, size, done) {
    var animatingFettis = fettis.slice();
    var context = canvas.getContext("2d");
    var animationFrame;
    var destroy;
    var prom = promise(function(resolve) {
      function onDone() {
        animationFrame = destroy = null;
        context.clearRect(0, 0, size.width, size.height);
        bitmapMapper.clear();
        done();
        resolve();
      }
      function update() {
        if (isWorker && !(size.width === workerSize.width && size.height === workerSize.height)) {
          size.width = canvas.width = workerSize.width;
          size.height = canvas.height = workerSize.height;
        }
        if (!size.width && !size.height) {
          resizer(canvas);
          size.width = canvas.width;
          size.height = canvas.height;
        }
        context.clearRect(0, 0, size.width, size.height);
        animatingFettis = animatingFettis.filter(function(fetti) {
          return updateFetti(context, fetti);
        });
        if (animatingFettis.length) {
          animationFrame = raf.frame(update);
        } else {
          onDone();
        }
      }
      animationFrame = raf.frame(update);
      destroy = onDone;
    });
    return {
      addFettis: function(fettis2) {
        animatingFettis = animatingFettis.concat(fettis2);
        return prom;
      },
      canvas,
      promise: prom,
      reset: function() {
        if (animationFrame) {
          raf.cancel(animationFrame);
        }
        if (destroy) {
          destroy();
        }
      }
    };
  }
  function confettiCannon(canvas, globalOpts) {
    var isLibCanvas = !canvas;
    var allowResize = !!prop(globalOpts || {}, "resize");
    var hasResizeEventRegistered = false;
    var globalDisableForReducedMotion = prop(globalOpts, "disableForReducedMotion", Boolean);
    var shouldUseWorker = canUseWorker && !!prop(globalOpts || {}, "useWorker");
    var worker = shouldUseWorker ? getWorker() : null;
    var resizer = isLibCanvas ? setCanvasWindowSize : setCanvasRectSize;
    var initialized = canvas && worker ? !!canvas.__confetti_initialized : false;
    var preferLessMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion)").matches;
    var animationObj;
    function fireLocal(options, size, done) {
      var particleCount = prop(options, "particleCount", onlyPositiveInt);
      var angle = prop(options, "angle", Number);
      var spread = prop(options, "spread", Number);
      var startVelocity = prop(options, "startVelocity", Number);
      var decay = prop(options, "decay", Number);
      var gravity = prop(options, "gravity", Number);
      var drift = prop(options, "drift", Number);
      var colors = prop(options, "colors", colorsToRgb);
      var ticks = prop(options, "ticks", Number);
      var shapes = prop(options, "shapes");
      var scalar = prop(options, "scalar");
      var flat = !!prop(options, "flat");
      var origin = getOrigin(options);
      var temp = particleCount;
      var fettis = [];
      var startX = canvas.width * origin.x;
      var startY = canvas.height * origin.y;
      while (temp--) {
        fettis.push(
          randomPhysics({
            x: startX,
            y: startY,
            angle,
            spread,
            startVelocity,
            color: colors[temp % colors.length],
            shape: shapes[randomInt(0, shapes.length)],
            ticks,
            decay,
            gravity,
            drift,
            scalar,
            flat
          })
        );
      }
      if (animationObj) {
        return animationObj.addFettis(fettis);
      }
      animationObj = animate(canvas, fettis, resizer, size, done);
      return animationObj.promise;
    }
    function fire(options) {
      var disableForReducedMotion = globalDisableForReducedMotion || prop(options, "disableForReducedMotion", Boolean);
      var zIndex = prop(options, "zIndex", Number);
      if (disableForReducedMotion && preferLessMotion) {
        return promise(function(resolve) {
          resolve();
        });
      }
      if (isLibCanvas && animationObj) {
        canvas = animationObj.canvas;
      } else if (isLibCanvas && !canvas) {
        canvas = getCanvas(zIndex);
        document.body.appendChild(canvas);
      }
      if (allowResize && !initialized) {
        resizer(canvas);
      }
      var size = {
        width: canvas.width,
        height: canvas.height
      };
      if (worker && !initialized) {
        worker.init(canvas);
      }
      initialized = true;
      if (worker) {
        canvas.__confetti_initialized = true;
      }
      function onResize() {
        if (worker) {
          var obj = {
            getBoundingClientRect: function() {
              if (!isLibCanvas) {
                return canvas.getBoundingClientRect();
              }
            }
          };
          resizer(obj);
          worker.postMessage({
            resize: {
              width: obj.width,
              height: obj.height
            }
          });
          return;
        }
        size.width = size.height = null;
      }
      function done() {
        animationObj = null;
        if (allowResize) {
          hasResizeEventRegistered = false;
          global.removeEventListener("resize", onResize);
        }
        if (isLibCanvas && canvas) {
          if (document.body.contains(canvas)) {
            document.body.removeChild(canvas);
          }
          canvas = null;
          initialized = false;
        }
      }
      if (allowResize && !hasResizeEventRegistered) {
        hasResizeEventRegistered = true;
        global.addEventListener("resize", onResize, false);
      }
      if (worker) {
        return worker.fire(options, size, done);
      }
      return fireLocal(options, size, done);
    }
    fire.reset = function() {
      if (worker) {
        worker.reset();
      }
      if (animationObj) {
        animationObj.reset();
      }
    };
    return fire;
  }
  var defaultFire;
  function getDefaultFire() {
    if (!defaultFire) {
      defaultFire = confettiCannon(null, { useWorker: true, resize: true });
    }
    return defaultFire;
  }
  function transformPath2D(pathString, pathMatrix, x, y, scaleX, scaleY, rotation) {
    var path2d = new Path2D(pathString);
    var t1 = new Path2D();
    t1.addPath(path2d, new DOMMatrix(pathMatrix));
    var t2 = new Path2D();
    t2.addPath(t1, new DOMMatrix([
      Math.cos(rotation) * scaleX,
      Math.sin(rotation) * scaleX,
      -Math.sin(rotation) * scaleY,
      Math.cos(rotation) * scaleY,
      x,
      y
    ]));
    return t2;
  }
  function shapeFromPath(pathData) {
    if (!canUsePaths) {
      throw new Error("path confetti are not supported in this browser");
    }
    var path, matrix;
    if (typeof pathData === "string") {
      path = pathData;
    } else {
      path = pathData.path;
      matrix = pathData.matrix;
    }
    var path2d = new Path2D(path);
    var tempCanvas = document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d");
    if (!matrix) {
      var maxSize = 1e3;
      var minX = maxSize;
      var minY = maxSize;
      var maxX = 0;
      var maxY = 0;
      var width, height;
      for (var x = 0; x < maxSize; x += 2) {
        for (var y = 0; y < maxSize; y += 2) {
          if (tempCtx.isPointInPath(path2d, x, y, "nonzero")) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
      width = maxX - minX;
      height = maxY - minY;
      var maxDesiredSize = 10;
      var scale = Math.min(maxDesiredSize / width, maxDesiredSize / height);
      matrix = [
        scale,
        0,
        0,
        scale,
        -Math.round(width / 2 + minX) * scale,
        -Math.round(height / 2 + minY) * scale
      ];
    }
    return {
      type: "path",
      path,
      matrix
    };
  }
  function shapeFromText(textData) {
    var text, scalar = 1, color = "#000000", fontFamily = '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", "Twemoji Mozilla", "system emoji", sans-serif';
    if (typeof textData === "string") {
      text = textData;
    } else {
      text = textData.text;
      scalar = "scalar" in textData ? textData.scalar : scalar;
      fontFamily = "fontFamily" in textData ? textData.fontFamily : fontFamily;
      color = "color" in textData ? textData.color : color;
    }
    var fontSize = 10 * scalar;
    var font = "" + fontSize + "px " + fontFamily;
    var canvas = new OffscreenCanvas(fontSize, fontSize);
    var ctx = canvas.getContext("2d");
    ctx.font = font;
    var size = ctx.measureText(text);
    var width = Math.ceil(size.actualBoundingBoxRight + size.actualBoundingBoxLeft);
    var height = Math.ceil(size.actualBoundingBoxAscent + size.actualBoundingBoxDescent);
    var padding = 2;
    var x = size.actualBoundingBoxLeft + padding;
    var y = size.actualBoundingBoxAscent + padding;
    width += padding + padding;
    height += padding + padding;
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext("2d");
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    var scale = 1 / scalar;
    return {
      type: "bitmap",
      // TODO these probably need to be transfered for workers
      bitmap: canvas.transferToImageBitmap(),
      matrix: [scale, 0, 0, scale, -width * scale / 2, -height * scale / 2]
    };
  }
  module2.exports = function() {
    return getDefaultFire().apply(this, arguments);
  };
  module2.exports.reset = function() {
    getDefaultFire().reset();
  };
  module2.exports.create = confettiCannon;
  module2.exports.shapeFromPath = shapeFromPath;
  module2.exports.shapeFromText = shapeFromText;
})(function() {
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  return this || {};
}(), module, false);
var confetti_module_default = module.exports;
var create = module.exports.create;

// src/hooks/useConfetti.tsx
var KRUSHR_COLORS = [
  "#143197",
  // Primary blue
  "#EB5857",
  // Secondary red
  "#1FBB65",
  // Success green
  "#FFB366",
  // Warning orange
  "#57C7EB",
  // Info blue
  "#8b5cf6",
  // Purple
  "#f59e0b"
  // Amber
];
var CELEBRATION_ENABLED_KEY = "krushr-celebrations-enabled";
var isCelebrationEnabled = () => {
  const stored = localStorage.getItem(CELEBRATION_ENABLED_KEY);
  return stored !== "false";
};
var setCelebrationEnabled = (enabled) => {
  localStorage.setItem(CELEBRATION_ENABLED_KEY, String(enabled));
};
function useConfetti() {
  const hasShownFirstTimeToast = (0, import_react9.useRef)(false);
  const lastCelebrationTime = (0, import_react9.useRef)(0);
  const audioRef = (0, import_react9.useRef)(null);
  (0, import_react9.useEffect)(() => {
    const createSuccessSound = () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };
    audioRef.current = {
      play: () => {
        try {
          if (isCelebrationEnabled()) {
            createSuccessSound();
          }
        } catch (error) {
          console.debug("Audio playback failed:", error);
        }
      }
    };
    return () => {
      audioRef.current = null;
    };
  }, []);
  const triggerConfetti = (0, import_react9.useCallback)((options = {}) => {
    if (!isCelebrationEnabled()) {
      return;
    }
    const now = Date.now();
    if (now - lastCelebrationTime.current < 500) {
      return;
    }
    lastCelebrationTime.current = now;
    if (options.disableForBulk) {
      return;
    }
    const {
      duration = 3e3,
      particleCount = 100,
      spread = 70,
      origin = { x: 0.5, y: 0.5 },
      colors = KRUSHR_COLORS
    } = options;
    audioRef.current?.play();
    const end = Date.now() + duration;
    const frame = () => {
      confetti_module_default({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors
      });
      confetti_module_default({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    confetti_module_default({
      particleCount,
      spread,
      origin,
      colors,
      startVelocity: 30,
      gravity: 1.2,
      scalar: 1.2,
      drift: 0
    });
    frame();
    if (!hasShownFirstTimeToast.current) {
      hasShownFirstTimeToast.current = true;
      setTimeout(() => {
        toast.success("\u{1F389} Task completed!", {
          description: "You can disable celebrations in settings",
          duration: 5e3
        });
      }, 1e3);
    }
  }, []);
  const triggerSubtleConfetti = (0, import_react9.useCallback)((options = {}) => {
    if (!isCelebrationEnabled()) {
      return;
    }
    const {
      origin = { x: 0.5, y: 0.6 },
      colors = KRUSHR_COLORS
    } = options;
    confetti_module_default({
      particleCount: 30,
      spread: 40,
      origin,
      colors,
      startVelocity: 20,
      gravity: 1.5,
      scalar: 0.8,
      drift: 0
    });
  }, []);
  return {
    triggerConfetti,
    triggerSubtleConfetti,
    isCelebrationEnabled,
    setCelebrationEnabled
  };
}

// src/components/task/TaskChecklist.tsx
var import_jsx_runtime17 = __toESM(require_jsx_runtime(), 1);
function SortableChecklistItem({
  item,
  onToggle,
  onUpdate,
  onDelete,
  isDragging
}) {
  const [isEditing, setIsEditing] = (0, import_react10.useState)(false);
  const [editText, setEditText] = (0, import_react10.useState)(item.text);
  const inputRef = (0, import_react10.useRef)(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  (0, import_react10.useEffect)(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  const handleSave = () => {
    if (editText.trim() && editText !== item.text) {
      onUpdate(item.id, editText.trim());
    } else {
      setEditText(item.text);
    }
    setIsEditing(false);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditText(item.text);
      setIsEditing(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
    "div",
    {
      ref: setNodeRef,
      style,
      className: cn(
        "group flex items-center gap-2 p-2 rounded-md transition-all",
        "hover:bg-krushr-gray-bg",
        isDragging && "opacity-50",
        item.completed && "opacity-60"
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          "div",
          {
            ...attributes,
            ...listeners,
            className: "opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 -ml-1",
            children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(GripVertical, { className: "w-3 h-3 text-krushr-gray" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          "button",
          {
            onClick: () => onToggle(item.id),
            className: cn(
              "flex-shrink-0 w-5 h-5 rounded border-2 transition-all",
              "flex items-center justify-center",
              item.completed ? "bg-krushr-success border-krushr-success" : "border-krushr-gray-border hover:border-krushr-primary"
            ),
            children: item.completed && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Check, { className: "w-3 h-3 text-white" })
          }
        ),
        isEditing ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          "input",
          {
            ref: inputRef,
            type: "text",
            value: editText,
            onChange: (e) => setEditText(e.target.value),
            onBlur: handleSave,
            onKeyDown: handleKeyDown,
            className: cn(
              "flex-1 px-2 py-1 text-sm bg-white border border-krushr-primary",
              "rounded focus:outline-none focus:ring-2 focus:ring-krushr-primary"
            )
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          "div",
          {
            onClick: () => setIsEditing(true),
            className: cn(
              "flex-1 text-sm cursor-text px-2 py-1 rounded",
              "hover:bg-white hover:shadow-sm transition-all",
              item.completed && "line-through text-krushr-gray"
            ),
            children: item.text
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "opacity-0 group-hover:opacity-100 flex items-center gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => setIsEditing(true),
              className: "h-6 w-6 p-0",
              children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Pen, { className: "w-3 h-3" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => onDelete(item.id),
              className: "h-6 w-6 p-0 hover:text-krushr-secondary",
              children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(X, { className: "w-3 h-3" })
            }
          )
        ] })
      ]
    }
  );
}
function TaskChecklist({
  taskId,
  workspaceId,
  onUpdate,
  className
}) {
  const { triggerSubtleConfetti } = useConfetti();
  const [newChecklistTitle, setNewChecklistTitle] = (0, import_react10.useState)("");
  const [newItemTexts, setNewItemTexts] = (0, import_react10.useState)({});
  const [expandedChecklists, setExpandedChecklists] = (0, import_react10.useState)(/* @__PURE__ */ new Set());
  const [showNewChecklist, setShowNewChecklist] = (0, import_react10.useState)(false);
  const newChecklistRef = (0, import_react10.useRef)(null);
  const utils = trpc.useContext();
  const { data: task, refetch } = trpc.task.get.useQuery(
    { id: taskId },
    {
      enabled: !!taskId,
      select: (data) => ({
        checklists: data?.checklists || []
      })
    }
  );
  const checklists = task?.checklists || [];
  const createChecklistMutation = trpc.checklist.create.useMutation({
    onSuccess: () => {
      setNewChecklistTitle("");
      setShowNewChecklist(false);
      refetch();
      onUpdate?.();
      toast.success("Checklist created");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  const updateChecklistMutation = trpc.checklist.update.useMutation({
    onSuccess: () => {
      refetch();
      onUpdate?.();
    }
  });
  const deleteChecklistMutation = trpc.checklist.delete.useMutation({
    onSuccess: () => {
      refetch();
      onUpdate?.();
      toast.success("Checklist deleted");
    }
  });
  const addItemMutation = trpc.checklist.addItem.useMutation({
    onSuccess: (_, variables) => {
      setNewItemTexts((prev) => ({ ...prev, [variables.checklistId]: "" }));
      refetch();
      onUpdate?.();
    }
  });
  const updateItemMutation = trpc.checklist.updateItem.useMutation({
    onSuccess: () => {
      refetch();
      onUpdate?.();
    }
  });
  const deleteItemMutation = trpc.checklist.deleteItem.useMutation({
    onSuccess: () => {
      refetch();
      onUpdate?.();
    }
  });
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  const handleCreateChecklist = () => {
    if (newChecklistTitle.trim()) {
      createChecklistMutation.mutate({
        taskId,
        title: newChecklistTitle.trim()
      });
    }
  };
  const handleAddItem = (checklistId) => {
    const text = newItemTexts[checklistId]?.trim();
    if (text) {
      addItemMutation.mutate({
        checklistId,
        text
      });
    }
  };
  const handleToggleItem = (itemId, completed) => {
    updateItemMutation.mutate({
      id: itemId,
      completed: !completed
    });
  };
  const handleUpdateItem = (itemId, text) => {
    updateItemMutation.mutate({
      id: itemId,
      text
    });
  };
  const handleDeleteItem = (itemId) => {
    deleteItemMutation.mutate({ id: itemId });
  };
  const handleDragEnd = (event, items) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        newItems.forEach((item, index) => {
          if (item.position !== index) {
            updateItemMutation.mutate({
              id: item.id,
              position: index
            });
          }
        });
      }
    }
  };
  const toggleChecklist = (checklistId) => {
    setExpandedChecklists((prev) => {
      const next = new Set(prev);
      if (next.has(checklistId)) {
        next.delete(checklistId);
      } else {
        next.add(checklistId);
      }
      return next;
    });
  };
  const calculateProgress = (items) => {
    if (items.length === 0) return 0;
    const completed = items.filter((item) => item.completed).length;
    return Math.round(completed / items.length * 100);
  };
  (0, import_react10.useEffect)(() => {
    if (showNewChecklist && newChecklistRef.current) {
      newChecklistRef.current.focus();
    }
  }, [showNewChecklist]);
  (0, import_react10.useEffect)(() => {
    if (checklists.length === 1 && expandedChecklists.size === 0) {
      setExpandedChecklists(/* @__PURE__ */ new Set([checklists[0].id]));
    }
  }, [checklists]);
  return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: cn("space-y-4", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(CircleCheck, { className: "w-5 h-5 text-krushr-gray-dark" }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h3", { className: "text-base font-medium text-krushr-gray-dark", children: "Checklists" }),
        checklists.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(Badge, { variant: "secondary", className: "text-xs", children: [
          checklists.reduce((acc, cl) => acc + cl.items.filter((i) => i.completed).length, 0),
          "/",
          checklists.reduce((acc, cl) => acc + cl.items.length, 0)
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => setShowNewChecklist(true),
          className: "text-krushr-primary hover:text-krushr-primary hover:bg-krushr-primary/10",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Plus, { className: "w-4 h-4 mr-1" }),
            "Add Checklist"
          ]
        }
      )
    ] }),
    showNewChecklist && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "p-3 bg-krushr-gray-bg-light rounded-lg border border-krushr-gray-border", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        FloatingInput,
        {
          ref: newChecklistRef,
          label: "Checklist title",
          value: newChecklistTitle,
          onChange: (e) => setNewChecklistTitle(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreateChecklist();
            } else if (e.key === "Escape") {
              setShowNewChecklist(false);
              setNewChecklistTitle("");
            }
          },
          className: "mb-3"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          Button,
          {
            size: "sm",
            onClick: handleCreateChecklist,
            disabled: !newChecklistTitle.trim() || createChecklistMutation.isLoading,
            className: "bg-krushr-primary hover:bg-krushr-primary/90",
            children: createChecklistMutation.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Create"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          Button,
          {
            size: "sm",
            variant: "ghost",
            onClick: () => {
              setShowNewChecklist(false);
              setNewChecklistTitle("");
            },
            children: "Cancel"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "space-y-3", children: checklists.map((checklist) => {
      const isExpanded = expandedChecklists.has(checklist.id);
      const progress = calculateProgress(checklist.items);
      return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
        "div",
        {
          className: cn(
            "bg-white rounded-lg border transition-all",
            isExpanded ? "border-krushr-gray-border shadow-sm" : "border-krushr-gray-border"
          ),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "px-4 py-3 flex items-center gap-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                "button",
                {
                  onClick: () => toggleChecklist(checklist.id),
                  className: "flex-shrink-0 p-0.5 hover:bg-krushr-gray-bg rounded transition-colors",
                  children: isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(ChevronDown, { className: "w-4 h-4 text-krushr-gray" }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(ChevronRight, { className: "w-4 h-4 text-krushr-gray" })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h4", { className: "font-medium text-sm text-krushr-gray-dark truncate", children: checklist.title }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-3 mt-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Progress2, { value: progress, className: "h-1.5 flex-1 max-w-[120px]" }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { className: "text-xs text-krushr-gray", children: [
                    checklist.items.filter((i) => i.completed).length,
                    "/",
                    checklist.items.length,
                    " completed"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(DropdownMenu2, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(DropdownMenuTrigger2, { asChild: true, children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(EllipsisVertical, { className: "w-4 h-4" }) }) }),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(DropdownMenuContent2, { align: "end", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                    DropdownMenuItem2,
                    {
                      onClick: () => {
                        const newTitle = prompt("Rename checklist:", checklist.title);
                        if (newTitle && newTitle !== checklist.title) {
                          updateChecklistMutation.mutate({
                            id: checklist.id,
                            title: newTitle
                          });
                        }
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Pen, { className: "w-4 h-4 mr-2" }),
                        "Rename"
                      ]
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(DropdownMenuSeparator2, {}),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                    DropdownMenuItem2,
                    {
                      onClick: () => {
                        if (confirm("Delete this checklist? This action cannot be undone.")) {
                          deleteChecklistMutation.mutate({ id: checklist.id });
                        }
                      },
                      className: "text-krushr-secondary",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Trash2, { className: "w-4 h-4 mr-2" }),
                        "Delete"
                      ]
                    }
                  )
                ] })
              ] })
            ] }),
            isExpanded && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "px-4 pb-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                DndContext,
                {
                  sensors,
                  collisionDetection: closestCenter,
                  onDragEnd: (event) => handleDragEnd(event, checklist.items),
                  children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                    SortableContext,
                    {
                      items: checklist.items.map((item) => item.id),
                      strategy: verticalListSortingStrategy,
                      children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "space-y-1", children: checklist.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                        SortableChecklistItem,
                        {
                          item,
                          onToggle: (id) => handleToggleItem(id, item.completed),
                          onUpdate: handleUpdateItem,
                          onDelete: handleDeleteItem
                        },
                        item.id
                      )) })
                    }
                  )
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "mt-3 flex gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                  FloatingInput,
                  {
                    label: "Add item",
                    value: newItemTexts[checklist.id] || "",
                    onChange: (e) => setNewItemTexts((prev) => ({
                      ...prev,
                      [checklist.id]: e.target.value
                    })),
                    onKeyDown: (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddItem(checklist.id);
                      }
                    },
                    className: "flex-1"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                  Button,
                  {
                    size: "sm",
                    variant: "ghost",
                    onClick: () => handleAddItem(checklist.id),
                    disabled: !newItemTexts[checklist.id]?.trim() || addItemMutation.isLoading,
                    className: "text-krushr-primary hover:text-krushr-primary",
                    children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Plus, { className: "w-4 h-4" })
                  }
                )
              ] })
            ] })
          ]
        },
        checklist.id
      );
    }) }),
    checklists.length === 0 && !showNewChecklist && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "text-center py-8 text-krushr-gray", children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(Circle, { className: "w-12 h-12 mx-auto mb-3 text-krushr-gray-light" }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { className: "text-sm", children: "No checklists yet" }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("p", { className: "text-xs mt-1", children: "Create a checklist to track subtasks" })
    ] })
  ] });
}

// src/components/task/TaskDetail.tsx
var import_jsx_runtime18 = __toESM(require_jsx_runtime(), 1);
function TaskDetail({ taskId, open, onClose, onUpdate }) {
  const [comment, setComment] = (0, import_react11.useState)("");
  const [editingTitle, setEditingTitle] = (0, import_react11.useState)(false);
  const [editingDescription, setEditingDescription] = (0, import_react11.useState)(false);
  const [tempTitle, setTempTitle] = (0, import_react11.useState)("");
  const [tempDescription, setTempDescription] = (0, import_react11.useState)("");
  const [showEditModal, setShowEditModal] = (0, import_react11.useState)(false);
  const { data: task, refetch } = trpc.task.get.useQuery(
    { id: taskId },
    {
      enabled: !!taskId,
      onSuccess: (data) => {
        if (data) {
          setTempTitle(data.title || "");
          setTempDescription(data.description || "");
        }
      }
    }
  );
  const { data: comments = [], refetch: refetchComments } = trpc.comment.list.useQuery(
    { taskId },
    { enabled: !!taskId }
  );
  const { data: attachments = [] } = trpc.upload.getTaskAttachments.useQuery(
    { taskId },
    { enabled: !!taskId }
  );
  const { data: activities = [] } = trpc.activity.list.useQuery(
    { taskId },
    { enabled: !!taskId }
  );
  const addCommentMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      setComment("");
      refetchComments();
      refetch();
    },
    onError: (error) => {
      console.error("Failed to add comment:", error);
    }
  });
  const updateTaskMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      refetch();
      onUpdate?.();
      setEditingTitle(false);
      setEditingDescription(false);
    }
  });
  const deleteTaskMutation = trpc.task.delete.useMutation({
    onSuccess: () => {
      onClose();
      onUpdate?.();
    }
  });
  const addChecklistItemMutation = trpc.checklist.addItem.useMutation({
    onSuccess: () => {
      refetch();
      setNewChecklistItem("");
    }
  });
  const updateChecklistItemMutation = trpc.checklist.updateItem.useMutation({
    onSuccess: () => {
      refetch();
    }
  });
  const deleteChecklistItemMutation = trpc.checklist.deleteItem.useMutation({
    onSuccess: () => {
      refetch();
    }
  });
  const { refetch: refetchAttachments } = trpc.upload.getTaskAttachments.useQuery(
    { taskId },
    { enabled: !!taskId }
  );
  if (!task) return null;
  const handleAddComment = () => {
    if (comment.trim()) {
      addCommentMutation.mutate({
        taskId,
        content: comment
      });
    }
  };
  const handleStatusChange = (status) => {
    updateTaskMutation.mutate({
      id: taskId,
      status
    });
  };
  const handlePriorityChange = (priority) => {
    updateTaskMutation.mutate({
      id: taskId,
      priority
    });
  };
  const handleTitleSave = () => {
    if (tempTitle.trim() && tempTitle !== task?.title) {
      updateTaskMutation.mutate({
        id: taskId,
        title: tempTitle.trim()
      });
    } else {
      setEditingTitle(false);
      setTempTitle(task?.title || "");
    }
  };
  const handleDescriptionSave = () => {
    if (tempDescription !== task?.description) {
      updateTaskMutation.mutate({
        id: taskId,
        description: tempDescription
      });
    } else {
      setEditingDescription(false);
      setTempDescription(task?.description || "");
    }
  };
  const getPriorityColor = (priority) => {
    const colors = {
      ["low" /* LOW */]: "text-green-500 bg-green-50 border-green-200",
      ["medium" /* MEDIUM */]: "text-orange-500 bg-orange-50 border-orange-200",
      ["high" /* HIGH */]: "text-red-500 bg-red-50 border-red-200"
    };
    return colors[priority];
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "DONE" /* DONE */:
        return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(CircleCheck, { className: "w-4 h-4 text-green-500" });
      case "IN_PROGRESS" /* IN_PROGRESS */:
        return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(CircleAlert, { className: "w-4 h-4 text-blue-500" });
      default:
        return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Circle, { className: "w-4 h-4 text-gray-400" });
    }
  };
  const getFileIcon2 = (mimeType) => {
    if (mimeType.startsWith("image/")) return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Image, { className: "w-4 h-4" });
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(FileText, { className: "w-4 h-4" });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(import_jsx_runtime18.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Sheet, { open, onOpenChange: onClose, children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(SheetContent, { className: "w-full sm:max-w-2xl overflow-y-auto shadow-krushr-modal", hideOverlay: true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SheetHeader, { className: "space-y-0 pb-6 border-b border-krushr-panel-border", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center justify-between", children: [
        editingTitle ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
          FloatingInput,
          {
            label: "Task title",
            value: tempTitle,
            onChange: (e) => setTempTitle(e.target.value),
            onBlur: handleTitleSave,
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTitleSave();
              }
              if (e.key === "Escape") {
                setEditingTitle(false);
                setTempTitle(task?.title || "");
              }
            },
            className: "text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0",
            autoFocus: true
          }
        ) : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
          SheetTitle,
          {
            className: "text-xl font-semibold text-krushr-gray-dark cursor-pointer hover:bg-krushr-gray-50 px-2 py-1 rounded-md transition-colors font-brand",
            onClick: () => {
              setTempTitle(task?.title || "");
              setEditingTitle(true);
            },
            children: task.title
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setShowEditModal(true),
              className: "text-krushr-primary border-krushr-primary hover:bg-krushr-primary hover:text-white",
              children: "Edit Task"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => {
                if (confirm("Are you sure you want to delete this task?")) {
                  deleteTaskMutation.mutate({ id: taskId });
                }
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Trash2, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "mt-6 space-y-6 font-brand", children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center justify-between bg-krushr-gray-50 p-4 rounded-lg border border-krushr-panel-border", children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "flex gap-1", children: ["TODO" /* TODO */, "IN_PROGRESS" /* IN_PROGRESS */, "REVIEW" /* REVIEW */, "DONE" /* DONE */].map((status) => {
            const labels = {
              ["TODO" /* TODO */]: "To Do",
              ["IN_PROGRESS" /* IN_PROGRESS */]: "In Progress",
              ["REVIEW" /* REVIEW */]: "Review",
              ["DONE" /* DONE */]: "Done"
            };
            const colors = {
              ["TODO" /* TODO */]: task.status === status ? "bg-krushr-task-todo/10 text-krushr-task-todo border-krushr-task-todo/30" : "bg-white text-krushr-gray border-krushr-panel-border hover:bg-krushr-gray-50",
              ["IN_PROGRESS" /* IN_PROGRESS */]: task.status === status ? "bg-krushr-task-progress/10 text-krushr-task-progress border-krushr-task-progress/30" : "bg-white text-krushr-gray border-krushr-panel-border hover:bg-krushr-gray-50",
              ["REVIEW" /* REVIEW */]: task.status === status ? "bg-krushr-task-review/10 text-krushr-task-review border-krushr-task-review/30" : "bg-white text-krushr-gray border-krushr-panel-border hover:bg-krushr-gray-50",
              ["DONE" /* DONE */]: task.status === status ? "bg-krushr-task-done/10 text-krushr-task-done border-krushr-task-done/30" : "bg-white text-krushr-gray border-krushr-panel-border hover:bg-krushr-gray-50"
            };
            return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
              "button",
              {
                onClick: () => handleStatusChange(status),
                className: cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-200 shadow-sm",
                  colors[status]
                ),
                children: labels[status]
              },
              status
            );
          }) }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "text-xs font-medium text-krushr-gray-dark mr-1", children: "Priority:" }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "flex gap-0.5", children: [1, 2, 3].map((level) => {
              const isActive = task.priority === "low" /* LOW */ && level <= 1 || task.priority === "medium" /* MEDIUM */ && level <= 2 || task.priority === "high" /* HIGH */ && level <= 3;
              const targetPriority = level === 1 ? "low" /* LOW */ : level === 2 ? "medium" /* MEDIUM */ : "high" /* HIGH */;
              return /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
                "button",
                {
                  onClick: () => handlePriorityChange(targetPriority),
                  className: cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-200 shadow-sm",
                    isActive ? "bg-krushr-priority-high" : "bg-krushr-gray-300 hover:bg-krushr-priority-high/50"
                  ),
                  title: `${level === 1 ? "Low" : level === 2 ? "Medium" : "High"} Priority`
                },
                level
              );
            }) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex-1 bg-white rounded-lg border border-krushr-panel-border p-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("label", { className: "text-sm font-medium text-krushr-gray-dark block mb-3", children: "Description & Notes" }),
          editingDescription ? /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            RichTextEditor,
            {
              content: tempDescription,
              onChange: setTempDescription,
              onBlur: handleDescriptionSave,
              placeholder: "Add a description with rich formatting...",
              className: "min-h-[120px]"
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
            "div",
            {
              onClick: () => {
                setTempDescription(task?.description || "");
                setEditingDescription(true);
              },
              className: "min-h-[120px] p-3 text-sm border border-krushr-panel-border rounded-md cursor-pointer hover:bg-krushr-gray-50 prose prose-sm max-w-none transition-colors",
              dangerouslySetInnerHTML: {
                __html: task.description || '<span class="text-gray-400 italic">Click to add description...</span>'
              }
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-6 text-sm text-krushr-gray bg-krushr-gray-50 p-4 rounded-lg border border-krushr-panel-border", children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(User, { className: "w-4 h-4" }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
              Select2,
              {
                value: task.assigneeId || "unassigned",
                onValueChange: (value) => {
                  updateTaskMutation.mutate({
                    id: taskId,
                    assigneeId: value === "unassigned" ? null : value
                  });
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SelectTrigger2, { className: "w-auto border-none shadow-none p-0 h-auto text-sm hover:text-krushr-gray-dark focus:ring-0 transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SelectValue2, { placeholder: "Unassigned", children: task.assignee ? /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(Avatar, { className: "w-5 h-5", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(AvatarImage, { src: task.assignee.avatar }),
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(AvatarFallback, { className: "text-xs", children: task.assignee.name?.charAt(0) })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "truncate", children: task.assignee.name })
                  ] }) : /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "text-krushr-gray-light", children: "Unassigned" }) }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(SelectContent2, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SelectItem2, { value: "unassigned", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(User, { className: "w-4 h-4 text-gray-500" }),
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { children: "Unassigned" })
                    ] }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SelectItem2, { value: "user1", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Avatar, { className: "w-4 h-4", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(AvatarFallback, { className: "text-xs", children: "JD" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { children: "John Doe" })
                    ] }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SelectItem2, { value: "user2", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Avatar, { className: "w-4 h-4", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(AvatarFallback, { className: "text-xs", children: "JS" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { children: "Jane Smith" })
                    ] }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(SelectItem2, { value: "user3", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Avatar, { className: "w-4 h-4", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(AvatarFallback, { className: "text-xs", children: "MJ" }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { children: "Mike Johnson" })
                    ] }) })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Calendar, { className: "w-4 h-4" }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
              "input",
              {
                type: "date",
                value: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
                onChange: (e) => {
                  updateTaskMutation.mutate({
                    id: taskId,
                    dueDate: e.target.value ? new Date(e.target.value).toISOString() : null
                  });
                },
                className: "bg-transparent border-none text-sm cursor-pointer hover:text-krushr-gray-dark w-20 transition-colors",
                placeholder: "No date"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-1 text-krushr-gray-light", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Clock, { className: "w-4 h-4" }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("span", { children: [
              formatDistanceToNow(new Date(task.createdAt)),
              " ago"
            ] })
          ] })
        ] }),
        task.tags && task.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "flex flex-wrap gap-2", children: task.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Badge, { variant: "secondary", children: typeof tag === "string" ? tag : tag.name }, tag.id || tag)) }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "bg-white rounded-lg border border-krushr-panel-border p-4", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
          TaskChecklist,
          {
            taskId,
            workspaceId: task.project?.workspaceId || "",
            onUpdate: () => {
              refetch();
              onUpdate?.();
            }
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "space-y-6 max-h-[60vh] overflow-y-auto pr-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "space-y-4 bg-white rounded-lg border border-krushr-panel-border p-4", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(MessageSquare, { className: "w-4 h-4 text-blue-600" }),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("h3", { className: "text-sm font-medium text-krushr-gray-dark", children: [
                "Comments (",
                comments.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "space-y-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
                RichTextEditor,
                {
                  content: comment,
                  onChange: setComment,
                  placeholder: addCommentMutation.isLoading ? "Posting comment..." : "Add a comment...",
                  className: "min-h-[80px]",
                  minimal: true,
                  editable: !addCommentMutation.isLoading
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "flex justify-end", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)(
                Button,
                {
                  size: "sm",
                  onClick: handleAddComment,
                  disabled: !comment.trim() || addCommentMutation.isLoading,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Send, { className: "w-4 h-4 mr-2" }),
                    addCommentMutation.isLoading ? "Posting..." : "Post Comment"
                  ]
                }
              ) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "space-y-3 max-h-40 overflow-y-auto", children: [
              comments.map((comment2) => /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "border border-krushr-panel-border rounded-lg p-3 bg-krushr-gray-50/50", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-start space-x-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-8 h-8 bg-krushr-primary rounded-full flex items-center justify-center text-white text-xs", children: comment2.user?.name?.charAt(0)?.toUpperCase() || "U" }),
                /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center space-x-2 mb-1", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "text-sm font-medium text-krushr-gray-dark", children: comment2.user?.name || "Unknown User" }),
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("span", { className: "text-xs text-krushr-gray", children: [
                      formatDistanceToNow(new Date(comment2.createdAt)),
                      " ago"
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
                    "div",
                    {
                      className: "text-sm text-krushr-gray prose prose-sm max-w-none",
                      dangerouslySetInnerHTML: { __html: comment2.content }
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center space-x-4 mt-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", { className: "text-xs text-krushr-gray-light hover:text-krushr-primary transition-colors", children: "Reply" }),
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", { className: "text-xs text-krushr-gray-light hover:text-krushr-primary transition-colors", children: "Like" }),
                    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("button", { className: "text-xs text-krushr-gray-light hover:text-krushr-primary transition-colors", children: "..." })
                  ] })
                ] })
              ] }) }, comment2.id)),
              comments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "text-center py-4 text-krushr-gray-light text-sm", children: "No comments yet. Be the first to add one!" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "border border-krushr-panel-border rounded-lg bg-white shadow-sm", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "p-4 border-b border-krushr-panel-border bg-krushr-gray-50", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Paperclip, { className: "w-4 h-4 text-krushr-secondary" }),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("h3", { className: "font-medium text-krushr-gray-dark", children: [
                "Files (",
                attachments.length,
                ")"
              ] })
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "p-4 space-y-3", children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "border-2 border-dashed border-krushr-panel-border rounded-lg p-4 text-center text-sm text-krushr-gray hover:border-krushr-secondary/50 transition-colors bg-krushr-gray-50", children: [
                /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Upload, { className: "w-5 h-5 mx-auto mb-2 text-krushr-gray-light" }),
                /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "font-medium", children: "Drop files here or click to upload" })
              ] }),
              attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "pt-2 border-t border-krushr-panel-border", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
                AttachmentList_simple_default,
                {
                  attachments,
                  canDelete: true,
                  onRefresh: () => {
                    refetchAttachments();
                  }
                }
              ) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "border border-krushr-panel-border rounded-lg bg-white shadow-sm", children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "p-4 border-b border-krushr-panel-border bg-krushr-gray-50", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(Clock, { className: "w-4 h-4 text-amber-500" }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("h3", { className: "font-medium text-krushr-gray-dark", children: "Activity" })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "p-4 space-y-2", children: activities.map((activity) => /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-2 h-2 bg-krushr-gray-300 rounded-full mt-2" }),
            /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("p", { className: "text-sm", children: [
                /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("span", { className: "font-medium", children: activity.user?.name }),
                " ",
                activity.action
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("p", { className: "text-xs text-krushr-gray", children: [
                formatDistanceToNow(new Date(activity.createdAt)),
                " ago"
              ] })
            ] })
          ] }, activity.id)) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime18.jsx)(
      CompactTaskModal,
      {
        open: showEditModal,
        onClose: () => setShowEditModal(false),
        task,
        workspaceId: task?.workspaceId || "",
        onSuccess: () => {
          setShowEditModal(false);
          refetch();
          onUpdate?.();
        }
      }
    )
  ] });
}

// src/components/kanban/KanbanBoard.tsx
var import_jsx_runtime19 = __toESM(require_jsx_runtime(), 1);
function KanbanBoard({ kanban, className }) {
  const { triggerConfetti } = useConfetti();
  const [activeTask, setActiveTask] = (0, import_react12.useState)(null);
  const [searchTerm, setSearchTerm] = (0, import_react12.useState)("");
  const [showFilters, setShowFilters] = (0, import_react12.useState)(false);
  const [selectedPriorities, setSelectedPriorities] = (0, import_react12.useState)([]);
  const [selectedAssignees, setSelectedAssignees] = (0, import_react12.useState)([]);
  const [showCreatePanel, setShowCreatePanel] = (0, import_react12.useState)(false);
  const [selectedTaskId, setSelectedTaskId] = (0, import_react12.useState)(null);
  const [selectedColumnId, setSelectedColumnId] = (0, import_react12.useState)(null);
  const [showColumnManagement, setShowColumnManagement] = (0, import_react12.useState)(false);
  const [editingColumn, setEditingColumn] = (0, import_react12.useState)(null);
  const [newColumnTitle, setNewColumnTitle] = (0, import_react12.useState)("");
  const [newColumnColor, setNewColumnColor] = (0, import_react12.useState)("#6B7280");
  const [bulkMode, setBulkMode] = (0, import_react12.useState)(false);
  const [selectedTasks, setSelectedTasks] = (0, import_react12.useState)(/* @__PURE__ */ new Set());
  const [showBulkActions, setShowBulkActions] = (0, import_react12.useState)(false);
  const { data: kanbanData, refetch: refetchKanban } = trpc.kanban.get.useQuery({ id: kanban.id });
  const columns = kanbanData?.columns || [];
  const { data: tasks = [], refetch: refetchTasks } = trpc.task.list.useQuery({
    workspaceId: kanban.workspaceId,
    kanbanId: kanban.id
  });
  const updateTaskMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      refetchTasks();
    }
  });
  const createTaskMutation = trpc.task.create.useMutation({
    onSuccess: () => {
      refetchTasks();
    }
  });
  const deleteTaskMutation = trpc.task.delete.useMutation({
    onSuccess: () => {
      refetchTasks();
    }
  });
  const createColumnMutation = trpc.kanban.createColumn.useMutation({
    onSuccess: () => {
      refetchKanban();
      setNewColumnTitle("");
      setNewColumnColor("#6B7280");
    }
  });
  const updateColumnMutation = trpc.kanban.updateColumn.useMutation({
    onSuccess: () => {
      refetchKanban();
      setEditingColumn(null);
    }
  });
  const deleteColumnMutation = trpc.kanban.deleteColumn.useMutation({
    onSuccess: () => {
      refetchKanban();
    }
  });
  const reorderColumnsMutation = trpc.kanban.reorderColumns.useMutation({
    onSuccess: () => {
      refetchKanban();
    }
  });
  const columnIds = columns.map((col) => col.id);
  const kanbanTasks = tasks.filter(
    (task) => task.kanbanColumnId && columnIds.includes(task.kanbanColumnId)
  );
  const filteredTasks = kanbanTasks.filter((task) => {
    const matchesSearch = !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase()) || task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);
    const matchesAssignee = selectedAssignees.length === 0 || task.assigneeId && selectedAssignees.includes(task.assigneeId);
    return matchesSearch && matchesPriority && matchesAssignee;
  });
  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter((task) => task.kanbanColumnId === column.id).sort((a, b) => a.position - b.position);
    return acc;
  }, {});
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );
  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === "task") {
      setActiveTask(active.data.current.task);
    }
  };
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;
    if (activeType === "task") {
      const activeTask2 = active.data.current?.task;
      if (!activeTask2) return;
      const sourceColumn = columns.find((col) => col.id === activeTask2.kanbanColumnId);
      let targetColumn;
      let targetIndex;
      if (overType === "column") {
        targetColumn = columns.find((col) => col.id === over.id);
        targetIndex = tasksByColumn[targetColumn.id]?.length || 0;
      } else if (overType === "task") {
        const overTask = over.data.current?.task;
        targetColumn = columns.find((col) => col.id === overTask.kanbanColumnId);
        targetIndex = tasksByColumn[targetColumn.id].findIndex((task) => task.id === overTask.id);
      } else {
        return;
      }
      if (!sourceColumn || !targetColumn) return;
      const targetTasks = tasksByColumn[targetColumn.id];
      let newOrderNumber;
      if (targetTasks.length === 0) {
        newOrderNumber = 1;
      } else if (targetIndex === 0) {
        newOrderNumber = targetTasks[0].position - 1;
      } else if (targetIndex >= targetTasks.length) {
        newOrderNumber = targetTasks[targetTasks.length - 1].position + 1;
      } else {
        const prevOrder = targetTasks[targetIndex - 1].position;
        const nextOrder = targetTasks[targetIndex].position;
        newOrderNumber = (prevOrder + nextOrder) / 2;
      }
      const updates = {
        kanbanColumnId: targetColumn.id,
        position: newOrderNumber
      };
      try {
        await updateTaskMutation.mutateAsync({
          id: activeTask2.id,
          ...updates
        });
        const targetColumnTitle = targetColumn.title?.toLowerCase() || "";
        const isMovingToDone = targetColumnTitle.includes("done") || targetColumnTitle.includes("complete") || targetColumnTitle.includes("finished");
        const sourceColumnTitle = sourceColumn.title?.toLowerCase() || "";
        const wasInDone = sourceColumnTitle.includes("done") || sourceColumnTitle.includes("complete") || sourceColumnTitle.includes("finished");
        if (isMovingToDone && !wasInDone && !bulkMode) {
          triggerConfetti({
            origin: { x: 0.5, y: 0.6 },
            particleCount: 150,
            spread: 80
          });
        }
      } catch (error) {
        console.error("Failed to move task:", error);
      }
    }
  };
  const getTaskCount = (columnId) => {
    return tasksByColumn[columnId]?.length || 0;
  };
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-krushr-priority-high/10 text-krushr-priority-high border-krushr-priority-high/20";
      case "medium":
        return "bg-krushr-priority-medium/10 text-krushr-priority-medium border-krushr-priority-medium/20";
      case "low":
        return "bg-krushr-priority-low/10 text-krushr-priority-low border-krushr-priority-low/20";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  const toggleTaskSelection = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };
  const selectAllTasks = () => {
    const allTaskIds = new Set(filteredTasks.map((task) => task.id));
    setSelectedTasks(allTaskIds);
    setShowBulkActions(allTaskIds.size > 0);
  };
  const clearSelection = () => {
    setSelectedTasks(/* @__PURE__ */ new Set());
    setShowBulkActions(false);
    setBulkMode(false);
  };
  const handleBulkMove = (targetColumnId) => {
    if (selectedTasks.size === 0) return;
    const taskIds = Array.from(selectedTasks);
    taskIds.forEach((taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        updateTaskMutation.mutate({
          id: taskId,
          kanbanColumnId: targetColumnId
        });
      }
    });
    clearSelection();
  };
  const handleBulkPriority = (priority) => {
    if (selectedTasks.size === 0) return;
    const taskIds = Array.from(selectedTasks);
    taskIds.forEach((taskId) => {
      updateTaskMutation.mutate({
        id: taskId,
        priority
      });
    });
    clearSelection();
  };
  const handleCreateColumn = async () => {
    if (!newColumnTitle.trim()) return;
    try {
      await createColumnMutation.mutateAsync({
        kanbanId: kanban.id,
        title: newColumnTitle.trim(),
        color: newColumnColor
      });
    } catch (error) {
      console.error("Failed to create column:", error);
    }
  };
  const handleUpdateColumn = async (columnId, title, color) => {
    try {
      await updateColumnMutation.mutateAsync({
        id: columnId,
        title: title.trim(),
        color
      });
    } catch (error) {
      console.error("Failed to update column:", error);
    }
  };
  const { deleteItem } = useOptimisticDelete();
  const { execute } = useOptimisticAction();
  const { toast: toast2 } = useToast();
  const handleDeleteColumn = async (columnId) => {
    const column = columns.find((col) => col.id === columnId);
    const taskCount = getTaskCount(columnId);
    if (taskCount > 0) {
      toast2({
        title: "Cannot Delete Column",
        description: `The column "${column?.title}" contains ${taskCount} task${taskCount !== 1 ? "s" : ""}. Please move or delete the tasks first.`,
        variant: "destructive"
      });
      return;
    }
    if (!column) return;
    await deleteItem({
      type: "column",
      item: column,
      itemName: column.title,
      deleteAction: async () => {
        await deleteColumnMutation.mutateAsync({ id: columnId });
      },
      onOptimisticRemove: () => {
      },
      onRestore: () => {
        refetchKanban();
      }
    });
  };
  const handleReorderColumns = async (newOrder) => {
    try {
      await reorderColumnsMutation.mutateAsync({
        kanbanId: kanban.id,
        columnIds: newOrder
      });
    } catch (error) {
      console.error("Failed to reorder columns:", error);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: cn("flex flex-col h-full bg-gray-50", className), children: [
    showBulkActions && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "mx-2 mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("span", { className: "text-sm font-medium text-blue-900 font-manrope", children: [
          selectedTasks.size,
          " task",
          selectedTasks.size !== 1 ? "s" : "",
          " selected"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: clearSelection,
            className: "h-8 min-h-[32px] text-xs hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-manrope",
            "aria-label": "Clear task selection",
            children: "Clear"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
          "select",
          {
            className: "text-sm border rounded px-3 py-2 h-10 min-h-[40px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-manrope",
            onChange: (e) => e.target.value && handleBulkMove(e.target.value),
            defaultValue: "",
            "aria-label": "Move selected tasks to column",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "", children: "Move to..." }),
              columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: col.id, children: col.title }, col.id))
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
          "select",
          {
            className: "text-sm border rounded px-3 py-2 h-10 min-h-[40px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-manrope",
            onChange: (e) => e.target.value && handleBulkPriority(e.target.value),
            defaultValue: "",
            "aria-label": "Set priority for selected tasks",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "", children: "Set priority..." }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "high", children: "High" }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "medium", children: "Medium" }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "low", children: "Low" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          Button,
          {
            size: "sm",
            variant: "destructive",
            onClick: async () => {
              const selectedTasksArray = Array.from(selectedTasks);
              const tasksToDelete = selectedTasksArray.map(
                (id) => tasks.find((t) => t.id === id)
              ).filter(Boolean);
              clearSelection();
              await execute({
                type: "bulk-tasks",
                action: async () => {
                  for (const taskId of selectedTasksArray) {
                    await deleteTaskMutation.mutateAsync({ id: taskId });
                  }
                },
                undoAction: async () => {
                  for (const task of tasksToDelete) {
                    if (task) {
                      await createTaskMutation.mutateAsync({
                        title: task.title,
                        description: task.description,
                        status: task.status,
                        priority: task.priority,
                        dueDate: task.dueDate,
                        assignedUserId: task.assignedUserId,
                        tags: task.tags,
                        kanbanColumnId: task.kanbanColumnId,
                        projectId: task.projectId
                      });
                    }
                  }
                },
                item: tasksToDelete,
                getMessage: () => `${selectedTasksArray.length} tasks deleted`,
                getUndoMessage: () => `${selectedTasksArray.length} tasks restored`
              });
            },
            className: "h-10 min-h-[40px] text-sm px-3 hover:bg-red-600 focus:bg-red-600 focus:ring-2 focus:ring-red-500 transition-all duration-200",
            "aria-label": `Delete ${selectedTasks.size} selected tasks`,
            children: "Delete"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center justify-between p-2 bg-white border-b", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          FloatingInput,
          {
            label: "Search tasks",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "w-64 h-10 min-h-[40px] text-sm focus:ring-2 focus:ring-blue-500",
            type: "search"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => setShowFilters(!showFilters),
            className: "h-10 min-h-[40px] text-sm hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200",
            "aria-label": `${showFilters ? "Hide" : "Show"} task filters`,
            "aria-expanded": showFilters,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Funnel, { className: "w-4 h-4 mr-2" }),
              "Filters"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => setShowColumnManagement(!showColumnManagement),
            className: "h-10 min-h-[40px] text-sm hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200",
            "aria-label": `${showColumnManagement ? "Hide" : "Show"} column management`,
            "aria-expanded": showColumnManagement,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Settings, { className: "w-4 h-4 mr-2" }),
              "Columns"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          Button,
          {
            size: "sm",
            variant: bulkMode ? "default" : "outline",
            onClick: () => {
              setBulkMode(!bulkMode);
              if (bulkMode) clearSelection();
            },
            className: "h-10 min-h-[40px] text-sm hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200",
            "aria-label": bulkMode ? "Exit bulk selection mode" : "Enter bulk selection mode",
            "aria-pressed": bulkMode,
            children: bulkMode ? "Exit Bulk" : "Bulk Select"
          }
        ),
        bulkMode && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: selectAllTasks,
            className: "h-10 min-h-[40px] text-sm hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200",
            "aria-label": "Select all visible tasks",
            children: "Select All"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          "button",
          {
            onClick: () => {
              setSelectedColumnId(columns[0]?.id || null);
              setShowCreatePanel(true);
            },
            className: "w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 transition-colors",
            "aria-label": "Create new task",
            title: "Create new task",
            children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Plus, { className: "w-4 h-4" })
          }
        )
      ] })
    ] }),
    showFilters && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "mx-2 mt-1 p-2 bg-gray-50 rounded border", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Priority" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "flex flex-wrap gap-2", children: ["high", "medium", "low"].map((priority) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          Badge,
          {
            variant: selectedPriorities.includes(priority) ? "default" : "outline",
            className: cn(
              "cursor-pointer capitalize",
              selectedPriorities.includes(priority) && getPriorityColor(priority)
            ),
            onClick: () => {
              setSelectedPriorities(
                (prev) => prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
              );
            },
            children: priority
          },
          priority
        )) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Assignees" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "text-sm text-gray-500", children: "Select team members to filter by..." })
      ] })
    ] }) }),
    showColumnManagement && /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "mx-2 mt-1 p-3 bg-white border rounded-lg shadow-sm", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("h3", { className: "font-medium text-gray-900", children: "Manage Columns" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          Button,
          {
            size: "sm",
            variant: "ghost",
            onClick: () => setShowColumnManagement(false),
            className: "h-6 w-6 p-0",
            children: "\xD7"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "mb-4 p-3 bg-gray-50 rounded border", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          FloatingInput,
          {
            label: "Column title",
            value: newColumnTitle,
            onChange: (e) => setNewColumnTitle(e.target.value),
            className: "flex-1 h-8 text-sm",
            onKeyPress: (e) => e.key === "Enter" && handleCreateColumn()
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
          "select",
          {
            value: newColumnColor,
            onChange: (e) => setNewColumnColor(e.target.value),
            className: "h-8 text-sm border rounded px-2",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#6B7280", children: "Gray" }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#3B82F6", children: "Blue" }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#10B981", children: "Green" }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#F59E0B", children: "Yellow" }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#EF4444", children: "Red" }),
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#8B5CF6", children: "Purple" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          "button",
          {
            onClick: handleCreateColumn,
            disabled: !newColumnTitle.trim() || createColumnMutation.isLoading,
            className: "w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 transition-colors disabled:opacity-50",
            title: "Add column",
            children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Plus, { className: "w-4 h-4" })
          }
        )
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "space-y-2", children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex items-center gap-2 p-2 border rounded hover:bg-gray-50", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(GripVertical, { className: "w-4 h-4 text-gray-400 cursor-move" }),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
          "div",
          {
            className: "w-3 h-3 rounded-full border",
            style: { backgroundColor: column.color }
          }
        ),
        editingColumn?.id === column.id ? /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            FloatingInput,
            {
              label: "Column title",
              value: editingColumn.title,
              onChange: (e) => setEditingColumn({ ...editingColumn, title: e.target.value }),
              className: "flex-1 h-7 text-sm",
              onKeyPress: (e) => {
                if (e.key === "Enter") {
                  handleUpdateColumn(column.id, editingColumn.title, editingColumn.color);
                }
              },
              autoFocus: true
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
            "select",
            {
              value: editingColumn.color,
              onChange: (e) => setEditingColumn({ ...editingColumn, color: e.target.value }),
              className: "h-7 text-sm border rounded px-1",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#6B7280", children: "Gray" }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#3B82F6", children: "Blue" }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#10B981", children: "Green" }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#F59E0B", children: "Yellow" }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#EF4444", children: "Red" }),
                /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("option", { value: "#8B5CF6", children: "Purple" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            "button",
            {
              onClick: () => handleUpdateColumn(column.id, editingColumn.title, editingColumn.color),
              className: "w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 transition-colors",
              title: "Save changes",
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            "button",
            {
              onClick: () => setEditingColumn(null),
              className: "w-8 h-8 bg-krushr-gray-light text-krushr-gray-dark rounded-md flex items-center justify-center hover:bg-krushr-gray transition-colors",
              title: "Cancel",
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) })
            }
          )
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(import_jsx_runtime19.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "flex-1 text-sm font-medium", children: column.title }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(Badge, { variant: "outline", className: "text-xs", children: [
            getTaskCount(column.id),
            " tasks"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            "button",
            {
              onClick: () => setEditingColumn({ id: column.id, title: column.title, color: column.color }),
              className: "w-8 h-8 bg-krushr-gray-light text-krushr-gray-dark rounded-md flex items-center justify-center hover:bg-krushr-gray transition-colors",
              title: "Edit column",
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(SquarePen, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            "button",
            {
              onClick: () => handleDeleteColumn(column.id),
              disabled: getTaskCount(column.id) > 0,
              className: "w-8 h-8 bg-krushr-secondary text-white rounded-md flex items-center justify-center hover:bg-krushr-secondary/90 transition-colors disabled:opacity-50",
              title: "Delete column",
              children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(Trash2, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }, column.id)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "flex-1 overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
      DndContext,
      {
        sensors,
        collisionDetection: closestCorners,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "flex gap-3 p-2 min-w-max h-full", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            SortableContext,
            {
              items: columns.map((col) => col.id),
              strategy: horizontalListSortingStrategy,
              children: columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
                KanbanColumnComponent,
                {
                  column,
                  tasks: tasksByColumn[column.id] || [],
                  taskCount: getTaskCount(column.id),
                  onTaskClick: (taskId) => setSelectedTaskId(taskId),
                  onAddTask: () => {
                    setSelectedColumnId(column.id);
                    setShowCreatePanel(true);
                  },
                  bulkMode,
                  selectedTasks,
                  onTaskSelect: toggleTaskSelection,
                  onEditColumn: () => setEditingColumn({ id: column.id, title: column.title, color: column.color }),
                  onDeleteColumn: () => handleDeleteColumn(column.id)
                },
                column.id
              ))
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(DragOverlay, { children: activeTask && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
            TaskCard,
            {
              task: activeTask,
              isDragOverlay: true
            }
          ) })
        ]
      }
    ) }),
    /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
      CompactTaskModal,
      {
        open: showCreatePanel,
        onClose: () => {
          setShowCreatePanel(false);
          setSelectedColumnId(null);
        },
        workspaceId: kanban.workspaceId,
        kanbanId: kanban.id,
        kanbanColumnId: selectedColumnId || void 0,
        onSuccess: () => {
          refetchTasks();
          refetchKanban();
          setShowCreatePanel(false);
          setSelectedColumnId(null);
        }
      }
    ),
    selectedTaskId && /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
      TaskDetail,
      {
        taskId: selectedTaskId,
        open: !!selectedTaskId,
        onClose: () => setSelectedTaskId(null),
        onUpdate: () => {
          refetchTasks();
          refetchKanban();
        }
      }
    )
  ] });
}

export {
  FocusScope,
  useFocusGuards,
  __awaiter,
  Combination_default,
  hideOthers,
  createDialogScope,
  WarningProvider,
  Root,
  Trigger,
  Portal2 as Portal,
  Overlay,
  Content2 as Content,
  Title,
  Description,
  Close,
  createCollection,
  usePrevious2 as usePrevious,
  Select2 as Select,
  SelectValue2 as SelectValue,
  SelectTrigger2 as SelectTrigger,
  SelectContent2 as SelectContent,
  SelectItem2 as SelectItem,
  differenceInCalendarMonths,
  getRoundingMethod,
  differenceInMilliseconds,
  formatDistanceToNow,
  Progress2 as Progress,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  createRovingFocusGroupScope,
  Root4 as Root2,
  Item2 as Item,
  confetti_module_default,
  DropdownMenu2 as DropdownMenu,
  DropdownMenuTrigger2 as DropdownMenuTrigger,
  DropdownMenuContent2 as DropdownMenuContent,
  DropdownMenuItem2 as DropdownMenuItem,
  DropdownMenuLabel2 as DropdownMenuLabel,
  DropdownMenuSeparator2 as DropdownMenuSeparator,
  DropdownMenuShortcut,
  isCelebrationEnabled,
  setCelebrationEnabled,
  KanbanBoard
};
//# sourceMappingURL=/chunks/chunk-JTDAWY4P.js.map
