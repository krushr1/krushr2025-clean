import {
  __toESM,
  cn,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-K44F2ZF7.js";

// src/components/ui/floating-input.tsx
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var FloatingInput = React.forwardRef(
  ({ className, type, label, id, ...props }, ref) => {
    const inputId = id || `floating_${Math.random().toString(36).substr(2, 9)}`;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type,
          id: inputId,
          className: cn(
            "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-krushr-primary peer",
            className
          ),
          placeholder: " ",
          ref,
          ...props
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "label",
        {
          htmlFor: inputId,
          className: "absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1",
          children: label
        }
      )
    ] });
  }
);
FloatingInput.displayName = "FloatingInput";

export {
  FloatingInput
};
//# sourceMappingURL=/chunks/chunk-7WCGT42X.js.map
