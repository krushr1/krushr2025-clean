import {
  Avatar,
  AvatarFallback
} from "/chunks/chunk-53N6ZYFC.js";
import {
  ScrollArea
} from "/chunks/chunk-BVYJYOML.js";
import "/chunks/chunk-XQK55YGT.js";
import "/chunks/chunk-QHXVCZRG.js";
import "/chunks/chunk-O4RKJJFS.js";
import {
  Building,
  GripVertical,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Star,
  Users,
  __toESM,
  cn,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-CR5PFQOW.js";

// src/components/contacts/Contacts.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
function Contacts({ workspaceId, className }) {
  const [selectedContact, setSelectedContact] = (0, import_react.useState)(null);
  const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
  const [leftPaneWidth, setLeftPaneWidth] = (0, import_react.useState)(320);
  const [isResizing, setIsResizing] = (0, import_react.useState)(false);
  const containerRef = (0, import_react.useRef)(null);
  const resizerRef = (0, import_react.useRef)(null);
  const mockContacts = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice.johnson@techcorp.com",
      phone: "+1 (555) 123-4567",
      company: "TechCorp Solutions",
      position: "Senior Product Manager",
      location: "San Francisco, CA",
      tags: ["client", "product"],
      isFavorite: true,
      avatar: "AJ",
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
      notes: "Key stakeholder for Q2 product launch. Prefers morning meetings."
    },
    {
      id: "2",
      name: "Bob Chen",
      email: "b.chen@designstudio.co",
      phone: "+1 (555) 987-6543",
      company: "Design Studio Co",
      position: "Creative Director",
      location: "New York, NY",
      tags: ["partner", "design"],
      isFavorite: false,
      avatar: "BC",
      lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString(),
      notes: "Excellent collaboration on branding projects. Very detail-oriented."
    },
    {
      id: "3",
      name: "Carol Smith",
      email: "carol@startup.io",
      phone: "+1 (555) 456-7890",
      company: "Startup.io",
      position: "Co-Founder & CEO",
      location: "Austin, TX",
      tags: ["investor", "startup"],
      isFavorite: true,
      avatar: "CS",
      lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString(),
      notes: "Interested in strategic partnership. Follow up on Q3 roadmap."
    },
    {
      id: "4",
      name: "David Rodriguez",
      email: "david.r@consultancy.com",
      phone: "+1 (555) 321-0987",
      company: "Business Consultancy",
      position: "Senior Consultant",
      location: "Chicago, IL",
      tags: ["consultant", "strategy"],
      isFavorite: false,
      avatar: "DR",
      lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1e3).toISOString(),
      notes: "Provided excellent market analysis. Available for future projects."
    }
  ];
  const filteredContacts = mockContacts.filter(
    (contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || contact.email.toLowerCase().includes(searchTerm.toLowerCase()) || contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) || contact.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const selectedContactData = mockContacts.find((contact) => contact.id === selectedContact);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };
  (0, import_react.useEffect)(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      const minWidth = 240;
      const maxWidth = containerRect.width * 0.7;
      setLeftPaneWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)));
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);
  (0, import_react.useEffect)(() => {
    if (filteredContacts.length > 0 && !selectedContact) {
      setSelectedContact(filteredContacts[0].id);
    }
  }, [filteredContacts, selectedContact]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ref: containerRef, className: cn("flex h-full bg-krushr-gray-50", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: leftPaneWidth }, className: "flex-shrink-0", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col h-full bg-white", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-4 border-b border-krushr-gray-200", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "font-medium text-sm text-krushr-gray-900", children: "Contacts" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "bg-krushr-primary text-white px-3 h-8 rounded-button text-sm font-medium hover:bg-krushr-coral-red transition-all duration-200 shadow-elevation-sm hover:shadow-elevation-md flex items-center justify-center flex-shrink-0",
              title: "Create new contact",
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-4 h-4" })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative flex-1 mr-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-krushr-gray-400 pointer-events-none z-10" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "text",
              placeholder: "Search contacts...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "w-full pl-10 pr-4 h-8 text-base font-manrope border border-krushr-gray-300 rounded-lg bg-white focus:border-krushr-primary focus:ring-2 focus:ring-krushr-primary-100 focus:shadow-elevation-sm transition-all duration-200 outline-none relative z-20 placeholder:text-krushr-gray-400 placeholder:font-manrope"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-1", children: filteredContacts.map((contact) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "div",
        {
          className: cn(
            "border rounded-lg p-3 cursor-pointer transition-all duration-200 mb-1",
            selectedContact === contact.id ? "border-2 border-krushr-primary shadow-lg bg-gradient-to-r from-krushr-primary-50 to-white ring-2 ring-krushr-primary/20 transform scale-[1.02]" : "border border-krushr-gray-200 hover:border-krushr-primary hover:shadow-md hover:bg-krushr-gray-50/50"
          ),
          onClick: () => setSelectedContact(contact.id),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, { className: "w-8 h-8 mt-0.5", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { className: "text-xs bg-blue-100 text-blue-700", children: contact.avatar || contact.name.slice(0, 2).toUpperCase() }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: cn(
                    "font-medium truncate flex-1 font-manrope",
                    selectedContact === contact.id ? "text-krushr-primary font-semibold" : "text-krushr-gray-900"
                  ), children: contact.name }),
                  contact.isFavorite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "w-3 h-3 text-krushr-warning fill-current flex-shrink-0" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "div",
                  {
                    className: "text-sm font-brand text-krushr-gray-600 line-clamp-2 mb-2 leading-relaxed",
                    children: contact.position && contact.company ? `${contact.position} at ${contact.company}` : contact.company || contact.email
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between text-xs font-brand text-krushr-gray-400", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(contact.lastContact) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center space-x-2", children: contact.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center space-x-1", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    contact.tags.length,
                    " tags"
                  ] }) }) })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-wrap gap-1 mt-2", children: [
              contact.tags.slice(0, 2).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "inline-flex items-center rounded-full border py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs h-4 px-1", children: tag }, tag)),
              contact.tags.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs text-krushr-gray-400", children: [
                "+",
                contact.tags.length - 2
              ] })
            ] })
          ]
        },
        contact.id
      )) }) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        ref: resizerRef,
        className: cn(
          "w-1 bg-krushr-gray-200 hover:bg-krushr-primary transition-colors cursor-col-resize relative group",
          isResizing && "bg-krushr-primary"
        ),
        onMouseDown: () => setIsResizing(true),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 -left-1 -right-1 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "w-3 h-3 text-krushr-gray-400 group-hover:text-krushr-primary opacity-0 group-hover:opacity-100 transition-opacity" }) })
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 flex flex-col bg-white", children: selectedContactData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "border-b border-krushr-gray-200 p-4 bg-white", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-start gap-3 flex-1 mr-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, { className: "w-12 h-12", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { className: "text-lg bg-blue-100 text-blue-700", children: selectedContactData.avatar || selectedContactData.name.slice(0, 2).toUpperCase() }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { className: "text-base font-brand font-semibold text-krushr-gray-800 flex-1 mr-4", children: selectedContactData.name }),
              selectedContactData.isFavorite && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "w-4 h-4 text-krushr-warning fill-current" })
            ] }),
            selectedContactData.position && selectedContactData.company && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "text-sm text-krushr-gray-600 mb-1", children: [
              selectedContactData.position,
              " at ",
              selectedContactData.company
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center gap-3 text-xs text-krushr-gray-500", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              "Last contact: ",
              formatDate(selectedContactData.lastContact)
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "bg-krushr-primary text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-krushr-primary-700 transition-colors shadow-elevation-sm hover:shadow-elevation-md flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "w-4 h-4" }),
          "Message"
        ] }) })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "p-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-sm font-medium text-krushr-gray-900 mb-2", children: "Contact Information" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "w-4 h-4 text-krushr-gray-400" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-krushr-gray-900", children: selectedContactData.email })
            ] }),
            selectedContactData.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "w-4 h-4 text-krushr-gray-400" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-krushr-gray-900", children: selectedContactData.phone })
            ] }),
            selectedContactData.company && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "w-4 h-4 text-krushr-gray-400" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-krushr-gray-900", children: selectedContactData.company })
            ] }),
            selectedContactData.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "w-4 h-4 text-krushr-gray-400" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-krushr-gray-900", children: selectedContactData.location })
            ] })
          ] })
        ] }),
        selectedContactData.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-sm font-medium text-krushr-gray-900 mb-2", children: "Tags" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-wrap gap-1", children: selectedContactData.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs", children: tag }, tag)) })
        ] }),
        selectedContactData.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-sm font-medium text-krushr-gray-900 mb-2", children: "Notes" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              className: "text-sm text-krushr-gray-700 font-brand leading-relaxed max-w-none prose prose-sm prose-headings:text-krushr-gray-800 prose-p:text-sm prose-p:text-krushr-gray-700 prose-p:font-brand prose-li:text-sm prose-li:text-krushr-gray-700 cursor-pointer hover:bg-krushr-gray-50 rounded-lg p-3 transition-colors border border-transparent hover:border-krushr-gray-200",
              title: "Click to edit notes",
              children: selectedContactData.notes
            }
          )
        ] })
      ] }) }) })
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 flex items-center justify-center bg-krushr-gray-50", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16 h-16 bg-krushr-gray-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "w-8 h-8 text-krushr-gray-400" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-base font-brand font-medium text-krushr-gray-700 mb-2", children: "Select a contact to view" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm font-brand text-krushr-gray-500", children: "Choose a contact from the list to start viewing details" })
    ] }) }) })
  ] });
}
export {
  Contacts as default
};
//# sourceMappingURL=/chunks/Contacts-7KNWQBBW.js.map
