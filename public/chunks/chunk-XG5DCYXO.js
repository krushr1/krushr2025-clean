import {
  Button,
  useToast,
  useUndoStore
} from "/chunks/chunk-KDAPYUH3.js";
import {
  Undo2,
  __toESM,
  require_jsx_runtime
} from "/chunks/chunk-CR5PFQOW.js";

// src/hooks/use-optimistic-action.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function useOptimisticAction() {
  const { toast } = useToast();
  const { addUndoableAction, undo, removeAction } = useUndoStore();
  const execute = async ({
    type,
    action,
    undoAction,
    item,
    getMessage,
    getUndoMessage,
    ttl = 1e4,
    showUndo = true
  }) => {
    const message = getMessage();
    let actionId;
    if (showUndo) {
      actionId = addUndoableAction(
        type,
        message,
        item,
        undoAction,
        ttl
      );
      toast({
        title: message,
        duration: ttl,
        action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: async () => {
              try {
                await undo(actionId);
                toast({
                  title: getUndoMessage?.() || "Action undone",
                  duration: 3e3
                });
              } catch (error) {
                toast({
                  title: "Failed to undo",
                  description: "The action could not be undone",
                  variant: "destructive"
                });
              }
            },
            className: "ml-auto",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "mr-1 h-3 w-3" }),
              "Undo"
            ]
          }
        ),
        onOpenChange: (open) => {
          if (!open && actionId) {
            removeAction(actionId);
          }
        }
      });
    } else {
      toast({
        title: message,
        duration: 3e3
      });
    }
    try {
      await action();
      return true;
    } catch (error) {
      if (showUndo && actionId) {
        removeAction(actionId);
      }
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
      return false;
    }
  };
  return { execute };
}

export {
  useOptimisticAction
};
//# sourceMappingURL=/chunks/chunk-XG5DCYXO.js.map
