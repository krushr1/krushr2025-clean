import {
  toast
} from "/chunks/chunk-XTC34SKS.js";
import {
  FloatingInput
} from "/chunks/chunk-KI66MM42.js";
import {
  trpc
} from "/chunks/chunk-BD2IZKPD.js";
import {
  Archive,
  ArrowLeft,
  Palette,
  PenLine,
  Plus,
  Search,
  Star,
  Trash2,
  __toESM,
  cn,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-CPGAIYPB.js";

// src/components/notes/NotesPanel.tsx
var import_react = __toESM(require_react(), 1);

// src/hooks/use-mobile.tsx
var React = __toESM(require_react(), 1);
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(void 0);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}

// src/components/notes/NotesPanel.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var NOTE_COLORS = [
  { name: "Yellow", value: "#fef3c7", bgValue: "#fffbeb", border: "#f59e0b" },
  { name: "Pink", value: "#fce7f3", bgValue: "#fdf2f8", border: "#ec4899" },
  { name: "Blue", value: "#dbeafe", bgValue: "#eff6ff", border: "#3b82f6" },
  { name: "Green", value: "#d1fae5", bgValue: "#f0fdf4", border: "#10b981" },
  { name: "Purple", value: "#e9d5ff", bgValue: "#faf5ff", border: "#8b5cf6" },
  { name: "Orange", value: "#fed7aa", bgValue: "#fff7ed", border: "#f97316" },
  { name: "Red", value: "#fecaca", bgValue: "#fef2f2", border: "#ef4444" },
  { name: "None", value: "#ffffff", bgValue: "#ffffff", border: "#e5e7eb" }
];
var getNoteColor = (note) => {
  const noteColor = note.color || note.folder?.color || "#ffffff";
  const colorConfig = NOTE_COLORS.find((c) => c.value.toLowerCase() === noteColor.toLowerCase()) || NOTE_COLORS[7];
  console.log("Note color debug:", {
    noteId: note.id,
    individualColor: note.color,
    folderColor: note.folder?.color,
    finalColor: noteColor,
    colorConfig
  });
  return colorConfig;
};
function NoteCard({ note, isActive, onClick, isFirst, isLast, onArchiveToggle }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = /* @__PURE__ */ new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const colorConfig = getNoteColor(note);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      onClick,
      className: cn(
        "border rounded-md p-2 cursor-pointer transition-all duration-200 mb-1",
        isActive ? "border border-krushr-primary shadow-md" : "border border-krushr-gray-200 hover:border-krushr-primary/50 hover:shadow-sm"
      ),
      style: {
        backgroundColor: isActive ? "rgba(20, 49, 151, 0.05)" : colorConfig.bgValue,
        borderLeftColor: colorConfig.border,
        borderLeftWidth: "3px",
        borderLeftStyle: "solid"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: cn(
            "font-medium line-clamp-2 flex-1 font-brand",
            isActive ? "text-krushr-primary" : "text-gray-900"
          ), children: note.title || "Untitled" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
            note.isPinned && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "w-3 h-3 text-amber-500 fill-current" }),
            note.isArchived && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "w-3 h-3 text-krushr-gray-400" })
          ] })
        ] }),
        note.content && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 mb-3 line-clamp-2 font-manrope", children: note.content }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between text-xs text-gray-500 font-manrope", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(note.updatedAt) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: new Date(note.updatedAt).toLocaleDateString() })
        ] })
      ]
    }
  );
}
function SearchBar({ value, onChange, onCreateNote, isCreating }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-3 border-b border-krushr-gray-200 w-full", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 w-full", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      FloatingInput,
      {
        label: "Search notes",
        value,
        onChange: (e) => onChange(e.target.value),
        className: "flex-1 min-w-0 h-8 text-sm font-manrope border border-krushr-gray-300 focus:border-krushr-primary focus:ring-2 focus:ring-krushr-primary/20 transition-all duration-200",
        type: "search"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        onClick: onCreateNote,
        disabled: isCreating,
        className: "bg-krushr-primary text-white w-8 h-8 rounded-md flex items-center justify-center hover:bg-krushr-primary/90 transition-all duration-200 disabled:opacity-50 flex-shrink-0",
        title: "Create new note",
        children: isCreating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-4 h-4" })
      }
    )
  ] }) });
}
function EditorHeader({ title, onTitleChange, onDelete, isSaving, isDeleting, note, onPin, onColorChange, onArchive, onExport, isSingleColumn, onBack }) {
  const [showColorPicker, setShowColorPicker] = (0, import_react.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-3 border-b border-krushr-gray-200 bg-white", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [
    isSingleColumn && onBack && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        onClick: onBack,
        className: "w-6 h-6 flex items-center justify-center text-krushr-gray-600 hover:text-krushr-primary transition-colors flex-shrink-0",
        type: "button",
        title: "Back to Notes",
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 relative", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type: "text",
          value: title,
          onChange: (e) => onTitleChange(e.target.value),
          placeholder: "Note title...",
          className: "w-full h-7 font-medium text-gray-900 font-brand bg-transparent border-0 outline-none placeholder:text-gray-400 focus:bg-krushr-gray-50 rounded px-2 pr-16 transition-colors"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs", children: isSaving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-amber-600 font-medium font-manrope", children: "Saving" })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-1.5 h-1.5 bg-green-500 rounded-full" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-green-600 font-medium font-manrope", children: "Saved" })
      ] }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-1", children: [
      note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => onPin(note.id),
            className: `w-6 h-6 flex items-center justify-center rounded transition-colors ${note.isPinned ? "text-amber-500" : "text-krushr-gray-400 hover:text-amber-500"}`,
            title: note.isPinned ? "Unpin" : "Pin",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `w-3 h-3 ${note.isPinned ? "fill-current" : ""}` })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: () => onArchive?.(note.id),
            className: `w-6 h-6 flex items-center justify-center rounded transition-colors ${note.isArchived ? "text-krushr-primary" : "text-krushr-gray-400 hover:text-krushr-primary"}`,
            title: note.isArchived ? "Unarchive" : "Archive",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "w-3 h-3" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              onClick: () => setShowColorPicker(!showColorPicker),
              className: "w-6 h-6 flex items-center justify-center rounded transition-colors text-krushr-gray-400 hover:text-krushr-gray-600",
              title: "Color",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "w-3 h-3" })
            }
          ),
          showColorPicker && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: "fixed inset-0 z-40",
                onClick: () => setShowColorPicker(false)
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-full right-0 mt-1 bg-white border border-krushr-gray-200 rounded-lg shadow-xl p-2 z-50", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "4px"
                },
                children: NOTE_COLORS.map((color) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    onClick: () => {
                      onColorChange(note.id, color.value);
                      setShowColorPicker(false);
                    },
                    className: `w-6 h-6 rounded border hover:scale-110 transition-transform ${getNoteColor(note).value === color.value ? "border-krushr-primary ring-2 ring-krushr-primary/30" : "border-krushr-gray-300 hover:border-krushr-primary/50"}`,
                    style: { backgroundColor: color.bgValue },
                    title: color.name
                  },
                  color.value
                ))
              }
            ) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          onClick: onDelete,
          disabled: isDeleting,
          className: "w-6 h-6 text-krushr-gray-400 hover:text-red-500 rounded flex items-center justify-center transition-colors disabled:opacity-50",
          title: "Delete",
          children: isDeleting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3 h-3" })
        }
      )
    ] })
  ] }) });
}
var NotesPanel = import_react.default.forwardRef(
  ({ workspaceId, className }, ref) => {
    const [activeNoteId, setActiveNoteId] = (0, import_react.useState)(null);
    const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
    const [noteTitle, setNoteTitle] = (0, import_react.useState)("");
    const [noteContent, setNoteContent] = (0, import_react.useState)("");
    const [saveTimer, setSaveTimer] = (0, import_react.useState)(null);
    const [isSingleColumn, setIsSingleColumn] = (0, import_react.useState)(false);
    const [showEditor, setShowEditor] = (0, import_react.useState)(false);
    const containerRef = (0, import_react.useRef)(null);
    const isMobile = useIsMobile();
    const notesQuery = trpc.notes.list.useQuery({
      workspaceId,
      search: searchQuery || void 0
    });
    const activeNoteQuery = trpc.notes.get.useQuery(
      { id: activeNoteId },
      { enabled: !!activeNoteId }
    );
    const createNote = trpc.notes.create.useMutation({
      onSuccess: (note) => {
        setActiveNoteId(note.id);
        setNoteTitle(note.title);
        setNoteContent(note.content || "");
        notesQuery.refetch();
        toast.success("Note created");
      }
    });
    const updateNote = trpc.notes.update.useMutation({
      onSuccess: () => {
        notesQuery.refetch();
        activeNoteQuery.refetch();
      }
    });
    const deleteNote = trpc.notes.delete.useMutation({
      onSuccess: () => {
        setActiveNoteId(null);
        setNoteTitle("");
        setNoteContent("");
        notesQuery.refetch();
        toast.success("Note deleted");
      }
    });
    const togglePin = trpc.notes.togglePin.useMutation({
      onSuccess: () => {
        notesQuery.refetch();
        activeNoteQuery.refetch();
        toast.success("Note pin status updated");
      },
      onError: (error) => {
        toast.error("Failed to update pin status");
      }
    });
    const toggleArchive = trpc.notes.toggleArchive.useMutation({
      onSuccess: () => {
        notesQuery.refetch();
        activeNoteQuery.refetch();
        toast.success("Note archive status updated");
      },
      onError: (error) => {
        toast.error("Failed to update archive status");
      }
    });
    const handleExportNotes = () => {
      try {
        const notesToExport = filteredNotes.filter((note) => !note.isArchived);
        let exportContent = "# Notes Export\\n\\n";
        notesToExport.forEach((note) => {
          exportContent += `## ${note.title}\\n\\n`;
          exportContent += `${note.content || "No content"}\\n\\n`;
          exportContent += `*Updated: ${new Date(note.updatedAt).toLocaleDateString()}*\\n\\n`;
          exportContent += "---\\n\\n";
        });
        const blob = new Blob([exportContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `notes-export-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Notes exported successfully");
      } catch (error) {
        toast.error("Failed to export notes");
      }
    };
    const updateNoteFolder = trpc.notes.update.useMutation({
      onSuccess: () => {
        notesQuery.refetch();
        toast.success("Note folder updated");
      },
      onError: (error) => {
        toast.error("Failed to update note folder");
      }
    });
    (0, import_react.useEffect)(() => {
      if (activeNoteQuery.data) {
        setNoteTitle(activeNoteQuery.data.title);
        setNoteContent(activeNoteQuery.data.content || "");
      }
    }, [activeNoteQuery.data]);
    (0, import_react.useEffect)(() => {
      const checkSize = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          const shouldBeSingleColumn = width < 600 || isMobile;
          setIsSingleColumn(shouldBeSingleColumn);
          if (shouldBeSingleColumn && activeNoteId && !showEditor) {
            setShowEditor(true);
          }
          console.log("Notes panel size check:", { width, shouldBeSingleColumn, isMobile, activeNoteId, showEditor });
        }
      };
      checkSize();
      const resizeObserver = new ResizeObserver(checkSize);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      return () => resizeObserver.disconnect();
    }, [activeNoteId, isMobile, showEditor]);
    (0, import_react.useEffect)(() => {
      if (activeNoteId && (noteTitle || noteContent)) {
        if (saveTimer) clearTimeout(saveTimer);
        const timer = setTimeout(() => {
          updateNote.mutate({
            id: activeNoteId,
            title: noteTitle || "Untitled",
            content: noteContent
          });
        }, 1e3);
        setSaveTimer(timer);
      }
      return () => {
        if (saveTimer) clearTimeout(saveTimer);
      };
    }, [noteTitle, noteContent, activeNoteId]);
    const handleCreateNote = () => {
      createNote.mutate({
        title: "New Note",
        content: "",
        workspaceId,
        tags: []
      });
    };
    const handleDeleteNote = () => {
      if (activeNoteId && confirm("Delete this note?")) {
        deleteNote.mutate({ id: activeNoteId });
      }
    };
    const handleSelectNote = (note) => {
      setActiveNoteId(note.id);
      if (isSingleColumn) {
        setShowEditor(true);
      }
    };
    const handleBackToList = () => {
      setShowEditor(false);
      setActiveNoteId(null);
    };
    const handleTogglePin = (noteId) => {
      togglePin.mutate({ id: noteId });
    };
    const handleToggleArchive = (noteId) => {
      toggleArchive.mutate({ id: noteId });
    };
    const handleColorChange = (noteId, color) => {
      updateNote.mutate({
        id: noteId,
        color
      });
      toast.success("Note color updated");
    };
    const filteredNotes = notesQuery.data?.notes || [];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ref: containerRef, className: cn("flex h-full bg-krushr-gray-50", className), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: cn(
        "bg-white flex flex-col shadow-sm transition-all duration-300",
        isSingleColumn ? showEditor ? "hidden" : "w-full" : "w-80 border-r border-krushr-gray-200"
      ), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          SearchBar,
          {
            value: searchQuery,
            onChange: setSearchQuery,
            onCreateNote: handleCreateNote,
            isCreating: createNote.isPending
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 overflow-y-auto", children: notesQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-krushr-primary" }) }) : filteredNotes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-6 text-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-10 h-10 bg-krushr-gray-100 rounded-full flex items-center justify-center mx-auto mb-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-5 h-5 text-krushr-gray-400" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-gray-900 font-medium font-brand", children: "No notes found" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-gray-400 text-sm mt-1 font-manrope", children: searchQuery ? "Try different keywords" : "Create your first note" })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-2", children: filteredNotes.map((note, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          NoteCard,
          {
            note,
            isActive: activeNoteId === note.id,
            onClick: () => handleSelectNote(note),
            isFirst: index === 0,
            isLast: index === filteredNotes.length - 1,
            onArchiveToggle: handleToggleArchive
          },
          note.id
        )) }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn(
        "flex flex-col transition-all duration-300",
        isSingleColumn ? showEditor ? "w-full" : "hidden" : "flex-1"
      ), children: activeNoteId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          EditorHeader,
          {
            title: noteTitle,
            onTitleChange: setNoteTitle,
            onDelete: handleDeleteNote,
            isSaving: updateNote.isPending,
            isDeleting: deleteNote.isPending,
            note: filteredNotes.find((n) => n.id === activeNoteId),
            onPin: handleTogglePin,
            onColorChange: handleColorChange,
            onArchive: handleToggleArchive,
            onExport: handleExportNotes,
            isSingleColumn,
            onBack: handleBackToList
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 p-3", style: { backgroundColor: activeNoteId ? getNoteColor(filteredNotes.find((n) => n.id === activeNoteId) || {}).bgValue : "#ffffff" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "textarea",
          {
            value: noteContent,
            onChange: (e) => setNoteContent(e.target.value),
            placeholder: "Start writing your note...",
            className: cn(
              "w-full h-full min-h-[400px] border-0 outline-none resize-none bg-transparent",
              "font-manrope text-sm text-gray-700 placeholder:text-gray-400"
            )
          }
        ) })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 flex items-center justify-center", style: { backgroundColor: "#ffffff" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-center max-w-md mx-auto p-6", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 bg-gradient-to-br from-krushr-primary/10 to-krushr-primary/20 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "w-8 h-8 text-krushr-primary" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: cn(
          "font-medium text-gray-900 mb-2 font-manrope",
          isSingleColumn ? "text-base" : "text-lg"
        ), children: "Select a note to edit" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: cn(
          "text-gray-500 leading-relaxed mb-4 font-manrope",
          isSingleColumn ? "text-xs" : "text-sm"
        ), children: isSingleColumn ? "Tap a note to start editing" : "Choose a note from the sidebar to start editing, or create a new note to get started." }),
        !isSingleColumn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            onClick: handleCreateNote,
            disabled: createNote.isPending,
            className: "w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 disabled:opacity-50 transition-colors",
            title: "Create your first note",
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-4 h-4" })
          }
        )
      ] }) }) })
    ] });
  }
);
NotesPanel.displayName = "NotesPanel";
var NotesPanel_default = NotesPanel;

export {
  NotesPanel_default
};
//# sourceMappingURL=/chunks/chunk-4TQQ7EHU.js.map
