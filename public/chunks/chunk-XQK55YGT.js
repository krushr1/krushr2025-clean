import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-CR5PFQOW.js";

// ../node_modules/@radix-ui/number/dist/index.mjs
function clamp(value, [min, max]) {
  return Math.min(max, Math.max(min, value));
}

// ../node_modules/@radix-ui/react-direction/dist/index.mjs
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var DirectionContext = React.createContext(void 0);
function useDirection(localDir) {
  const globalDir = React.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}

export {
  clamp,
  useDirection
};
//# sourceMappingURL=/chunks/chunk-XQK55YGT.js.map
