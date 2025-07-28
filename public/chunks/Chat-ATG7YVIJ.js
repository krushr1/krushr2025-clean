import {
  trpc
} from "/chunks/chunk-YG7Y4E3I.js";
import {
  Reply,
  Send,
  Smile,
  X,
  __toESM,
  cn,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-CR5PFQOW.js";

// src/components/chat/MessageBubble.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var MessageBubble = ({
  message,
  isOutgoing,
  onReaction,
  onReply,
  showEmojiPicker,
  setShowEmojiPicker,
  quickReactions: quickReactions2
}) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative inline-block", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: cn(
      "rounded-lg p-3 shadow-sm",
      isOutgoing ? "bg-krushr-primary text-white rounded-tr-none" : "bg-gray-100 rounded-tl-none"
    ), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: cn(
        "text-sm",
        isOutgoing ? "text-white" : "text-krushr-gray-dark"
      ), children: message.content }),
      message.type === "file" && !isOutgoing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-krushr-gray-bg border border-krushr-gray-200 rounded p-2 flex items-center space-x-2 mt-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-8 h-8 bg-krushr-info rounded flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-white text-xs", children: "File" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-sm font-medium", children: "dashboard-mockups.fig" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-xs text-krushr-gray", children: "2.4 MB \u2022 Figma File" })
        ] })
      ] })
    ] }),
    message.reactions && message.reactions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -top-2 right-2 flex items-center gap-1", children: message.reactions.map((reaction, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        onClick: () => onReaction(message.id, reaction.emoji),
        className: "inline-flex items-center gap-1 px-2 py-1 text-xs bg-white hover:bg-krushr-primary-50 border border-krushr-gray-200 hover:border-krushr-primary-200 rounded-full transition-all duration-200 shadow-sm hover:shadow-md",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-sm", children: reaction.emoji }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-medium text-krushr-gray", children: reaction.count })
        ]
      },
      index
    )) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: cn(
      "absolute -top-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-white border border-krushr-gray-200 rounded-lg px-2 py-1 shadow-sm",
      isOutgoing ? "left-2" : "left-2"
    ), children: [
      !isOutgoing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          onClick: () => onReply(message),
          className: "p-1 hover:bg-krushr-primary-50 hover:text-krushr-primary-600 rounded transition-colors duration-200",
          title: "Reply to message",
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reply, { className: "w-3.5 h-3.5" })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id),
            className: "p-1 hover:bg-krushr-warning-50 hover:text-krushr-warning-600 rounded transition-colors duration-200",
            title: "Add reaction",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "w-3.5 h-3.5" })
          }
        ),
        showEmojiPicker === message.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn(
          "absolute bottom-full mb-2 bg-white border border-krushr-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-50",
          isOutgoing ? "left-0" : "right-0"
        ), children: quickReactions2.map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => onReaction(message.id, emoji),
            className: "p-1 hover:bg-krushr-gray-100 rounded text-lg leading-none",
            title: `React with ${emoji}`,
            children: emoji
          },
          emoji
        )) })
      ] })
    ] })
  ] });
};

// src/components/chat/ReplyIndicator.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var ReplyIndicator = ({
  replyTo,
  isOutgoing
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: cn(
    "mb-2 border-l-2 border-krushr-primary pl-3 py-2",
    isOutgoing ? "mr-11 bg-krushr-primary-50 rounded-l-lg ml-16" : "ml-11 bg-krushr-gray-bg-light rounded-r-lg"
  ), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-1 mb-1", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Reply, { className: "w-3 h-3 text-krushr-primary" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-xs text-krushr-gray font-medium", children: replyTo.sender })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-xs text-krushr-gray-light truncate", children: replyTo.content })
  ] });
};

// src/components/chat/MessageItem.tsx
var import_jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
var MessageItem = ({
  message,
  currentUserId,
  onReaction,
  onReply,
  showEmojiPicker,
  setShowEmojiPicker,
  quickReactions: quickReactions2
}) => {
  const isOutgoing = message.sender.id === currentUserId;
  const isSystem = message.type === "system";
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  if (isSystem) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-center", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "bg-krushr-gray-100 text-krushr-gray px-3 py-1 rounded-full text-xs inline-block", children: message.content }) });
  }
  if (isOutgoing) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "group", children: [
      message.replyTo && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReplyIndicator, { replyTo: message.replyTo, isOutgoing: true }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-start justify-end space-x-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex-1 text-right", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            MessageBubble,
            {
              message,
              isOutgoing: true,
              onReaction,
              onReply,
              showEmojiPicker,
              setShowEmojiPicker,
              quickReactions: quickReactions2
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-end space-x-2 mt-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs text-krushr-gray-light", children: formatTime(message.timestamp) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs text-krushr-gray-light", children: "\u2022" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs text-krushr-gray-light", children: "Read" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-8 h-8 bg-krushr-secondary rounded-full flex items-center justify-center text-white text-sm font-medium", children: "ME" })
      ] })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "group", children: [
    message.replyTo && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(ReplyIndicator, { replyTo: message.replyTo, isOutgoing: false }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-start space-x-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-8 h-8 bg-krushr-primary rounded-full flex items-center justify-center text-white text-sm font-medium", children: message.sender.avatar || message.sender.name.slice(0, 2).toUpperCase() }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          MessageBubble,
          {
            message,
            isOutgoing: false,
            onReaction,
            onReply,
            showEmojiPicker,
            setShowEmojiPicker,
            quickReactions: quickReactions2
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center space-x-2 mt-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs text-krushr-gray-light", children: message.sender.name }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs text-krushr-gray-light", children: "\u2022" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-xs text-krushr-gray-light", children: formatTime(message.timestamp) })
        ] })
      ] })
    ] })
  ] });
};

// src/components/chat/ReplyBanner.tsx
var import_jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
var ReplyBanner = ({
  replyingTo,
  onCancel
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex-shrink-0 px-4 py-2 bg-krushr-info-50 border-t border-krushr-info-200", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Reply, { className: "w-3 h-3 text-krushr-info-600" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "text-sm text-krushr-info-700 font-medium", children: [
          "Replying to ",
          replyingTo.sender.name
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          onClick: onCancel,
          className: "p-1 text-krushr-info-600 hover:text-krushr-info-800 hover:bg-krushr-info-100 rounded transition-colors duration-200",
          title: "Cancel reply",
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(X, { className: "w-3 h-3" })
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "text-xs text-krushr-info-600 mt-1 truncate pl-5", children: replyingTo.content })
  ] });
};

// src/components/chat/MessageInput.tsx
var import_jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
var MessageInput = ({
  message,
  onChange,
  onSend,
  onKeyPress,
  inputRef
}) => {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex-shrink-0 p-4 pt-3 border-t border-krushr-gray-200", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "relative flex items-center bg-white border border-gray-300 rounded-3xl shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md focus-within:border-krushr-primary h-[60px]", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex-1 min-w-0 relative", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        "input",
        {
          ref: inputRef,
          type: "text",
          value: message,
          onChange: (e) => onChange(e.target.value),
          onKeyPress,
          placeholder: "",
          className: "w-full min-h-[46px] h-[46px] text-sm resize-none border-0 bg-transparent focus:ring-0 focus:outline-none px-3 py-3 placeholder-transparent peer leading-relaxed font-manrope"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { className: cn(
        "absolute left-3 text-gray-500 duration-300 transform origin-[0] bg-white px-1 pointer-events-none select-none z-10",
        message.trim() ? "-top-2 text-xs scale-75 text-krushr-primary" : "top-1/2 -translate-y-1/2 text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:scale-75 peer-focus:text-krushr-primary"
      ), children: "Type a message..." })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex items-center pr-3", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      "button",
      {
        onClick: onSend,
        disabled: !message.trim(),
        className: "h-8 w-8 rounded-full flex items-center justify-center transition-all p-0 bg-krushr-primary text-white hover:bg-krushr-primary/90 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed",
        title: "Send message",
        children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Send, { className: "w-4 h-4" })
      }
    ) })
  ] }) });
};

// src/components/chat/useChatMessages.ts
var import_react = __toESM(require_react(), 1);

// src/components/chat/mockData.ts
var mockMessages = [
  {
    id: "1",
    content: "Hey team, how's the progress on the dashboard redesign?",
    type: "text",
    sender: { id: "1", name: "John Doe", avatar: "JD" },
    timestamp: new Date(Date.now() - 10 * 60 * 1e3).toISOString(),
    reactions: [{ emoji: "\u{1F44D}", count: 2, users: ["2", "3"] }]
  },
  {
    id: "2",
    content: "We're about 70% done! Should be ready for review by Friday.",
    type: "text",
    sender: { id: "2", name: "You", avatar: "ME" },
    timestamp: new Date(Date.now() - 8 * 60 * 1e3).toISOString(),
    replyTo: { id: "1", content: "Hey team, how's the progress...", sender: "John Doe" }
  },
  {
    id: "3",
    content: "Alice joined the conversation",
    type: "system",
    sender: { id: "system", name: "System", avatar: "" },
    timestamp: new Date(Date.now() - 6 * 60 * 1e3).toISOString()
  },
  {
    id: "4",
    content: "Here are the latest mockups for review:",
    type: "file",
    sender: { id: "3", name: "Alice Smith", avatar: "AS" },
    timestamp: new Date(Date.now() - 4 * 60 * 1e3).toISOString(),
    reactions: [
      { emoji: "\u{1F680}", count: 1, users: ["2"] },
      { emoji: "\u{1F4AF}", count: 1, users: ["1"] }
    ]
  }
];
var quickReactions = ["\u{1F44D}", "\u2764\uFE0F", "\u{1F60A}", "\u{1F680}", "\u{1F4AF}", "\u{1F44F}"];

// src/components/chat/useChatMessages.ts
var useChatMessages = (threadId) => {
  const messagesEndRef = (0, import_react.useRef)(null);
  const { data: messagesData } = trpc.chat.getMessages.useQuery(
    { threadId: threadId || "default" },
    { enabled: !!threadId }
  );
  const messages = messagesData?.messages || [];
  const displayMessages = threadId ? messages : mockMessages;
  (0, import_react.useEffect)(() => {
    const scrollContainer = messagesEndRef.current?.closest("[data-radix-scroll-area-viewport]");
    if (scrollContainer && messagesEndRef.current) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [displayMessages]);
  return {
    messages: displayMessages,
    messagesEndRef
  };
};

// src/components/chat/useChatActions.ts
var import_react2 = __toESM(require_react(), 1);
var useChatActions = (threadId) => {
  const [message, setMessage] = (0, import_react2.useState)("");
  const [replyingTo, setReplyingTo] = (0, import_react2.useState)(null);
  const [showEmojiPicker, setShowEmojiPicker] = (0, import_react2.useState)(null);
  const messageInputRef = (0, import_react2.useRef)(null);
  const sendChatMessage = trpc.chat.sendMessage.useMutation({});
  const addReaction = trpc.chat.addReaction.useMutation({});
  const removeReaction = trpc.chat.removeReaction.useMutation({});
  const handleSendMessage = () => {
    if (!message.trim()) return;
    if (threadId) {
      sendChatMessage.mutate({
        threadId,
        content: message,
        type: "TEXT",
        replyToId: replyingTo?.id
      });
    }
    setMessage("");
    setReplyingTo(null);
  };
  const handleReaction = (messageId, emoji) => {
    if (threadId) {
      addReaction.mutate({ messageId, emoji });
    } else {
      console.log(`Adding reaction ${emoji} to message ${messageId}`);
    }
    setShowEmojiPicker(null);
  };
  const handleReply = (message2) => {
    setReplyingTo(message2);
    messageInputRef.current?.focus();
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return {
    message,
    setMessage,
    replyingTo,
    setReplyingTo,
    showEmojiPicker,
    setShowEmojiPicker,
    messageInputRef,
    handleSendMessage,
    handleReaction,
    handleReply,
    handleKeyPress
  };
};

// src/components/chat/Chat.tsx
var import_jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
function Chat({ threadId, className }) {
  const { messages, messagesEndRef } = useChatMessages(threadId);
  const {
    message,
    setMessage,
    replyingTo,
    setReplyingTo,
    showEmojiPicker,
    setShowEmojiPicker,
    messageInputRef,
    handleSendMessage,
    handleReaction,
    handleReply,
    handleKeyPress
  } = useChatActions(threadId);
  const currentUserId = "2";
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: cn("bg-white h-full flex flex-col", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex-1 space-y-4 p-4 pb-0 overflow-y-auto", children: [
      messages.map((message2) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        MessageItem,
        {
          message: message2,
          currentUserId,
          onReaction: handleReaction,
          onReply: handleReply,
          showEmojiPicker,
          setShowEmojiPicker,
          quickReactions
        },
        message2.id
      )),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { ref: messagesEndRef })
    ] }),
    replyingTo && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      ReplyBanner,
      {
        replyingTo,
        onCancel: () => setReplyingTo(null)
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      MessageInput,
      {
        message,
        onChange: setMessage,
        onSend: handleSendMessage,
        onKeyPress: handleKeyPress,
        inputRef: messageInputRef
      }
    )
  ] });
}
export {
  Chat as default
};
//# sourceMappingURL=/chunks/Chat-ATG7YVIJ.js.map
