import {
  Input,
  useAppStore
} from "/chunks/chunk-ZBBOV2AZ.js";
import {
  Button
} from "/chunks/chunk-XWDUADFP.js";
import {
  trpc
} from "/chunks/chunk-7WMTHTGL.js";
import {
  ScrollArea
} from "/chunks/chunk-YFNRHNVG.js";
import {
  Avatar,
  AvatarFallback
} from "/chunks/chunk-6PP5BWQ7.js";
import "/chunks/chunk-CPPR7KMG.js";
import "/chunks/chunk-ROKVQQM7.js";
import {
  Bot,
  Clock,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  User,
  Zap,
  __toESM,
  cn,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-K44F2ZF7.js";

// src/components/ai/WorkspaceAiChat.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function WorkspaceAiChat({ workspaceId, className }) {
  const [selectedConversation, setSelectedConversation] = (0, import_react.useState)(null);
  const [message, setMessage] = (0, import_react.useState)("");
  const [thinkingBudget, setThinkingBudget] = (0, import_react.useState)(8e3);
  const [isLoading, setIsLoading] = (0, import_react.useState)(false);
  const [showConversations, setShowConversations] = (0, import_react.useState)(false);
  const messageInputRef = (0, import_react.useRef)(null);
  const messagesEndRef = (0, import_react.useRef)(null);
  const { user } = useAppStore();
  const { data: conversations, refetch: refetchConversations } = trpc.ai.getConversations.useQuery({
    workspaceId
  });
  const { data: currentConversation } = trpc.ai.getConversation.useQuery({
    conversationId: selectedConversation
  }, {
    enabled: !!selectedConversation
  });
  const { data: usageStats } = trpc.ai.getUsageStats.useQuery({
    workspaceId,
    days: 30
  });
  const createConversation = trpc.ai.createConversation.useMutation({
    onSuccess: (conversation) => {
      setSelectedConversation(conversation.id);
      refetchConversations();
      setShowConversations(false);
    }
  });
  const sendMessage = trpc.ai.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    }
  });
  (0, import_react.useEffect)(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentConversation?.messages]);
  (0, import_react.useEffect)(() => {
    if (!selectedConversation && conversations && conversations.length > 0) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    let conversationId = selectedConversation;
    if (!conversationId) {
      setIsLoading(true);
      const newConversation = await createConversation.mutateAsync({
        workspaceId,
        title: void 0,
        context: "Workspace AI assistant"
      });
      conversationId = newConversation.id;
    }
    setIsLoading(true);
    await sendMessage.mutateAsync({
      conversationId,
      message,
      thinkingBudget
    });
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const formatCost = (cost) => {
    return cost < 0.01 ? "<$0.01" : `$${cost.toFixed(3)}`;
  };
  const formatTokens = (tokens) => {
    return tokens > 1e3 ? `${(tokens / 1e3).toFixed(1)}K` : tokens.toString();
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: cn("h-full flex flex-col bg-white", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-krushr-primary/5 to-transparent", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "w-5 h-5 text-krushr-primary" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3 h-3 text-yellow-500 absolute -top-1 -right-1" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "font-semibold text-sm text-gray-900", children: "AI Assistant" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-gray-500", children: "Gemini 2.5 Flash" })
          ] })
        ] }),
        usageStats && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "hidden md:flex items-center space-x-3 text-xs text-gray-500", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-3 h-3" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTokens(usageStats.totalStats.totalTokens) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center space-x-1", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatCost(usageStats.totalStats.totalCost) }) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1", children: [
        conversations && conversations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => setShowConversations(!showConversations),
            className: "h-7 px-2 text-xs",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "w-3 h-3 mr-1" }),
              conversations.length
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => createConversation.mutate({ workspaceId }),
            className: "h-7 px-2",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3 h-3" })
          }
        )
      ] })
    ] }),
    showConversations && conversations && conversations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-b border-gray-200 bg-gray-50 max-h-32 overflow-y-auto", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-2 space-y-1", children: conversations.map((conversation) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      Button,
      {
        variant: selectedConversation === conversation.id ? "secondary" : "ghost",
        size: "sm",
        className: "w-full justify-start h-auto p-2 text-left",
        onClick: () => {
          setSelectedConversation(conversation.id);
          setShowConversations(false);
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "font-medium text-xs truncate", children: conversation.title || "New Conversation" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-xs text-gray-500 truncate", children: conversation.messages[0]?.content || "No messages yet" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mt-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs text-gray-400", children: [
              conversation.messages.length,
              " messages"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs text-gray-400", children: formatCost(conversation.totalCost) })
          ] })
        ] })
      },
      conversation.id
    )) }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, { className: "flex-1 p-3", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-4", children: [
      selectedConversation && currentConversation ? currentConversation.messages.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start space-x-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, { className: "w-7 h-7 flex-shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { className: "text-xs", children: msg.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "w-4 h-4" }) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2 mb-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-medium text-xs text-gray-900", children: msg.role === "user" ? user?.name || "You" : "AI" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs text-gray-500", children: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            }) }),
            msg.role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-1 text-xs text-gray-400", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-3 h-3" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTokens(msg.tokenCount) }),
              msg.responseTime && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3 h-3 ml-1" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  msg.responseTime,
                  "ms"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn(
            "text-sm",
            msg.role === "user" ? "bg-krushr-primary/10 p-2 rounded-lg border border-krushr-primary/20" : "text-gray-900"
          ), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "whitespace-pre-wrap", children: msg.content }) })
        ] })
      ] }, msg.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        Button,
        {
          onClick: () => createConversation.mutate({ workspaceId }),
          size: "sm",
          className: "bg-krushr-primary hover:bg-krushr-primary/90",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3 h-3 mr-1" }),
            "Start Conversation"
          ]
        }
      ) }),
      isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start space-x-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, { className: "w-7 h-7", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { className: "text-xs", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "w-4 h-4" }) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bg-gray-100 p-2 rounded-lg", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "animate-spin rounded-full h-3 w-3 border-b-2 border-krushr-primary" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs text-gray-500", children: "AI is thinking..." })
        ] }) }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: messagesEndRef })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-3 border-t border-gray-200 bg-gray-50/50", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2 mb-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { className: "text-xs text-gray-500 flex-shrink-0", children: "Thinking:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "range",
            min: "0",
            max: "24576",
            value: thinkingBudget,
            onChange: (e) => setThinkingBudget(Number(e.target.value)),
            className: "flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs text-gray-500 w-12 text-right", children: thinkingBudget === 0 ? "Fast" : formatTokens(thinkingBudget) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Input,
          {
            ref: messageInputRef,
            placeholder: "Ask AI anything...",
            value: message,
            onChange: (e) => setMessage(e.target.value),
            onKeyPress: handleKeyPress,
            disabled: isLoading,
            className: "flex-1 h-8 text-sm"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Button,
          {
            onClick: handleSendMessage,
            disabled: !message.trim() || isLoading,
            size: "sm",
            className: "h-8 w-8 p-0",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "w-3 h-3" })
          }
        )
      ] })
    ] })
  ] });
}
export {
  WorkspaceAiChat as default
};
//# sourceMappingURL=/chunks/WorkspaceAiChat-DAG3VE62.js.map
