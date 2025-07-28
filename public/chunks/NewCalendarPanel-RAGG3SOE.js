import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  addDays,
  endOfWeek,
  formatDateShort,
  isToday,
  shouldProcessHotkey
} from "/chunks/chunk-JEIMLRKZ.js";
import {
  Badge,
  Card,
  CompactTaskModal,
  FloatingInput,
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths
} from "/chunks/chunk-75ZFDLKN.js";
import "/chunks/chunk-PFMVW4LI.js";
import {
  Button
} from "/chunks/chunk-KDAPYUH3.js";
import {
  trpc
} from "/chunks/chunk-BVY3CDO7.js";
import "/chunks/chunk-QHXVCZRG.js";
import "/chunks/chunk-O4RKJJFS.js";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  FileText,
  Funnel,
  List,
  MapPin,
  Phone,
  Plus,
  Search,
  Target,
  Users,
  Video,
  X,
  Zap,
  __toESM,
  cn,
  require_jsx_runtime,
  require_react
} from "/chunks/chunk-CR5PFQOW.js";

// src/components/calendar/NewCalendarPanel.tsx
var import_react2 = __toESM(require_react(), 1);

// src/components/calendar/AgendaView.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var TYPE_ICONS = {
  meeting: Users,
  task: CircleCheck,
  deadline: Zap,
  call: Phone,
  review: FileText,
  planning: Target
};
var PRIORITY_COLORS = {
  low: "bg-gray-400",
  medium: "bg-krushr-priority-medium",
  high: "bg-krushr-priority-high",
  critical: "bg-krushr-priority-critical"
};
function AgendaView({ workspaceId, className }) {
  const [expandedDays, setExpandedDays] = (0, import_react.useState)(/* @__PURE__ */ new Set(["today"]));
  const [selectedItem, setSelectedItem] = (0, import_react.useState)(null);
  const today = /* @__PURE__ */ new Date();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);
  const { data: calendarEvents } = trpc.calendar.list.useQuery({
    workspaceId,
    startDate: startOfDay(today).toISOString(),
    endDate: endOfDay(dayAfter).toISOString()
  });
  const groupedAgenda = (0, import_react.useMemo)(() => {
    if (!calendarEvents) {
      return [];
    }
    const agendaItems = calendarEvents.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description || void 0,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime),
      location: event.location || void 0,
      type: event.type === "MEETING" ? "meeting" : event.type === "TASK" ? "task" : event.type === "EVENT" ? "meeting" : "meeting",
      priority: "medium",
      // Calendar events don't have priority, default to medium
      status: "confirmed",
      attendees: event.attendees?.map((a) => a.user?.name || a.user?.email || "Unknown") || [],
      tags: event.type ? [event.type.toLowerCase()] : [],
      notes: event.description || void 0
    }));
    const groups = [
      {
        key: "today",
        label: "Today",
        date: today,
        items: agendaItems.filter((item) => isSameDay(item.startTime, today))
      },
      {
        key: "tomorrow",
        label: `Tomorrow (${formatDateShort(tomorrow)})`,
        date: tomorrow,
        items: agendaItems.filter((item) => isSameDay(item.startTime, tomorrow))
      },
      {
        key: "dayafter",
        label: formatDateShort(dayAfter),
        date: dayAfter,
        items: agendaItems.filter((item) => isSameDay(item.startTime, dayAfter))
      }
    ];
    return groups.filter((group) => group.items.length > 0);
  }, [calendarEvents, today, tomorrow, dayAfter]);
  const toggleDayExpansion = (dayKey) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey);
    } else {
      newExpanded.add(dayKey);
    }
    setExpandedDays(newExpanded);
  };
  const getTimeString = (startTime, endTime) => {
    return `${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`;
  };
  const getDayStats = (items) => {
    const meetings = items.filter((item) => item.type === "meeting" || item.type === "call").length;
    const tasks = items.filter((item) => item.type === "task" || item.type === "review").length;
    const critical = items.filter((item) => item.priority === "critical").length;
    return { meetings, tasks, critical };
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: cn("flex h-full bg-white", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 flex flex-col", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "px-3 py-1.5 border-b border-gray-200", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "text-sm font-medium text-gray-900 font-manrope", children: "Executive Agenda" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 overflow-y-auto", children: groupedAgenda.map((group) => {
        const isExpanded = expandedDays.has(group.key);
        const stats = getDayStats(group.items);
        const isToday3 = isSameDay(group.date, /* @__PURE__ */ new Date());
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "border-b border-gray-100/50", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              onClick: () => toggleDayExpansion(group.key),
              className: cn(
                "w-full px-3 py-1.5 flex items-center justify-between hover:bg-gray-50 transition-colors",
                isToday3 && "bg-krushr-primary/5"
              ),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                  isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-3 h-3 text-gray-400" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-3 h-3 text-gray-400" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { className: cn(
                    "font-medium text-xs font-manrope",
                    isToday3 ? "text-krushr-primary" : "text-gray-900"
                  ), children: [
                    group.label,
                    " (",
                    group.items.length,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                  stats.critical > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { variant: "destructive", className: "text-xs px-1 py-0 h-3.5 text-xs", children: stats.critical }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs text-gray-500 font-manrope", children: [
                    stats.meetings,
                    "m \u2022 ",
                    stats.tasks,
                    "t"
                  ] })
                ] })
              ]
            }
          ),
          isExpanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "px-3 pb-1", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-0.5", children: group.items.map((item) => {
            const IconComponent = TYPE_ICONS[item.type];
            const priorityColor = PRIORITY_COLORS[item.priority];
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "div",
              {
                className: cn(
                  "border-l-2 pl-2 py-1 cursor-pointer hover:bg-gray-50 transition-colors rounded-r text-xs",
                  item.priority === "critical" && "border-l-krushr-priority-critical bg-red-50/30",
                  item.priority === "high" && "border-l-krushr-priority-high bg-orange-50/30",
                  item.priority === "medium" && "border-l-krushr-priority-medium bg-yellow-50/30",
                  item.priority === "low" && "border-l-gray-400 bg-gray-50/30"
                ),
                onClick: () => setSelectedItem(item),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-1.5 mb-0.5", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComponent, { className: "w-2.5 h-2.5 text-krushr-primary flex-shrink-0" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("w-1 h-1 rounded-full flex-shrink-0", priorityColor) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "font-medium text-xs text-gray-900 font-manrope truncate flex-1", children: item.title }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-0.5 text-xs text-gray-500 font-manrope", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-2.5 h-2.5" }),
                      format(item.startTime, "h:mm a")
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between text-xs text-gray-600 pl-4", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-1.5 truncate", children: [
                      item.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-0.5", children: [
                        item.location.includes("Zoom") || item.location.includes("Teams") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "w-2.5 h-2.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "w-2.5 h-2.5" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "truncate text-xs", children: item.location })
                      ] }),
                      item.attendees && item.attendees.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-0.5", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "w-2.5 h-2.5" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs", children: item.attendees.length })
                      ] })
                    ] }),
                    item.tags && item.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex gap-0.5", children: [
                      item.tags.slice(0, 1).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { variant: "outline", className: "text-xs px-1 py-0 h-3.5", children: tag }, tag)),
                      item.tags.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "text-xs text-gray-400", children: [
                        "+",
                        item.tags.length - 1
                      ] })
                    ] })
                  ] })
                ]
              },
              item.id
            );
          }) }) })
        ] }, group.key);
      }) })
    ] }),
    selectedItem && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-72 border-l border-gray-200 bg-gray-50", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "font-medium text-sm text-gray-900 font-manrope", children: "Details" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => setSelectedItem(null),
            className: "p-1 h-5 w-5",
            children: "\u2715"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "font-medium text-sm text-gray-900 mb-1 font-manrope", children: selectedItem.title }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 mb-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { variant: "outline", className: "text-xs px-1 py-0", children: selectedItem.type }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("w-2 h-2 rounded-full", PRIORITY_COLORS[selectedItem.priority]) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-xs text-gray-600 capitalize", children: selectedItem.priority })
          ] }),
          selectedItem.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-gray-600 font-manrope leading-relaxed", children: selectedItem.description })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-1.5 text-xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3 h-3 text-gray-400" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-manrope", children: getTimeString(selectedItem.startTime, selectedItem.endTime) })
          ] }),
          selectedItem.location && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
            selectedItem.location.includes("Zoom") || selectedItem.location.includes("Teams") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "w-3 h-3 text-gray-400" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "w-3 h-3 text-gray-400" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-manrope", children: selectedItem.location })
          ] }),
          selectedItem.attendees && selectedItem.attendees.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "w-3 h-3 text-gray-400" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "font-manrope", children: [
              selectedItem.attendees.length,
              " attendees"
            ] })
          ] })
        ] }),
        selectedItem.attendees && selectedItem.attendees.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", { className: "font-medium text-xs text-gray-900 mb-1 font-manrope", children: "Attendees" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "space-y-0.5", children: [
            selectedItem.attendees.slice(0, 4).map((attendee) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-xs text-gray-600 font-manrope", children: attendee }, attendee)),
            selectedItem.attendees.length > 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-xs text-gray-400", children: [
              "+",
              selectedItem.attendees.length - 4,
              " more"
            ] })
          ] })
        ] }),
        selectedItem.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", { className: "font-medium text-xs text-gray-900 mb-1 font-manrope", children: "Notes" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-xs text-gray-600 font-manrope bg-white p-2 rounded border leading-relaxed", children: selectedItem.notes })
        ] }),
        selectedItem.tags && selectedItem.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", { className: "font-medium text-xs text-gray-900 mb-1 font-manrope", children: "Tags" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-wrap gap-1", children: selectedItem.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { variant: "outline", className: "text-xs px-1 py-0", children: tag }, tag)) })
        ] })
      ] })
    ] }) })
  ] });
}

// src/components/calendar/NewCalendarPanel.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var EVENT_COLORS = {
  blue: { bg: "bg-krushr-primary/10", border: "border-krushr-primary/20", text: "text-krushr-primary" },
  green: { bg: "bg-krushr-success/10", border: "border-krushr-success/20", text: "text-krushr-success" },
  purple: { bg: "bg-krushr-purple/10", border: "border-krushr-purple/20", text: "text-krushr-purple" },
  orange: { bg: "bg-krushr-orange/10", border: "border-krushr-orange/20", text: "text-krushr-orange" },
  red: { bg: "bg-krushr-secondary/10", border: "border-krushr-secondary/20", text: "text-krushr-secondary" }
};
var EVENT_TYPE_ICONS = {
  MEETING: Users,
  TASK: CircleCheck,
  REMINDER: CircleAlert,
  EVENT: Calendar,
  DEADLINE: Zap,
  MILESTONE: CircleCheck
};
var PRIORITY_COLORS2 = {
  LOW: "bg-krushr-priority-low",
  MEDIUM: "bg-krushr-priority-medium",
  HIGH: "bg-krushr-priority-high",
  CRITICAL: "bg-krushr-priority-critical"
};
function NewCalendarPanel({
  workspaceId,
  className,
  showHolidays = true,
  holidayCountry = "US"
  // Currently only US holidays supported
}) {
  const [currentDate, setCurrentDate] = (0, import_react2.useState)(/* @__PURE__ */ new Date());
  const [selectedDate, setSelectedDate] = (0, import_react2.useState)(null);
  const [view, setView] = (0, import_react2.useState)("month");
  const [showEventModal, setShowEventModal] = (0, import_react2.useState)(false);
  const [selectedEvent, setSelectedEvent] = (0, import_react2.useState)(null);
  const [searchQuery, setSearchQuery] = (0, import_react2.useState)("");
  const [showFilters, setShowFilters] = (0, import_react2.useState)(false);
  const [showSearch, setShowSearch] = (0, import_react2.useState)(false);
  const [panelSize, setPanelSize] = (0, import_react2.useState)({ width: 0, height: 0 });
  const containerRef = (0, import_react2.useRef)(null);
  const usHolidays = (0, import_react2.useMemo)(() => {
    if (!showHolidays) return [];
    const holidays = [
      // 2024 Holidays
      { date: "2024-01-01", name: "New Year's Day", type: "Federal Holiday" },
      { date: "2024-01-15", name: "Martin Luther King Jr. Day", type: "Federal Holiday" },
      { date: "2024-02-19", name: "Presidents Day", type: "Federal Holiday" },
      { date: "2024-05-27", name: "Memorial Day", type: "Federal Holiday" },
      { date: "2024-06-19", name: "Juneteenth", type: "Federal Holiday" },
      { date: "2024-07-04", name: "Independence Day", type: "Federal Holiday" },
      { date: "2024-09-02", name: "Labor Day", type: "Federal Holiday" },
      { date: "2024-10-14", name: "Columbus Day", type: "Federal Holiday" },
      { date: "2024-11-11", name: "Veterans Day", type: "Federal Holiday" },
      { date: "2024-11-28", name: "Thanksgiving Day", type: "Federal Holiday" },
      { date: "2024-12-25", name: "Christmas Day", type: "Federal Holiday" },
      // 2025 Holidays
      { date: "2025-01-01", name: "New Year's Day", type: "Federal Holiday" },
      { date: "2025-01-20", name: "Martin Luther King Jr. Day", type: "Federal Holiday" },
      { date: "2025-02-17", name: "Presidents Day", type: "Federal Holiday" },
      { date: "2025-05-26", name: "Memorial Day", type: "Federal Holiday" },
      { date: "2025-06-19", name: "Juneteenth", type: "Federal Holiday" },
      { date: "2025-07-04", name: "Independence Day", type: "Federal Holiday" },
      { date: "2025-09-01", name: "Labor Day", type: "Federal Holiday" },
      { date: "2025-10-13", name: "Columbus Day", type: "Federal Holiday" },
      { date: "2025-11-11", name: "Veterans Day", type: "Federal Holiday" },
      { date: "2025-11-27", name: "Thanksgiving Day", type: "Federal Holiday" },
      { date: "2025-12-25", name: "Christmas Day", type: "Federal Holiday" }
    ];
    return holidays;
  }, [showHolidays]);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const { data: eventsData, isLoading } = trpc.calendar.list.useQuery({
    workspaceId,
    startDate: calendarStart,
    endDate: calendarEnd
  }, {
    retry: false,
    refetchOnWindowFocus: false
  });
  const events = (0, import_react2.useMemo)(() => {
    if (!eventsData) return [];
    return eventsData.map((event) => ({
      ...event,
      startTime: new Date(event.startTime),
      endTime: new Date(event.endTime)
    }));
  }, [eventsData]);
  const getEventsForDay = (date) => {
    return events.filter(
      (event) => isSameDay(new Date(event.startTime), date) || event.allDay && isSameDay(new Date(event.startTime), date)
    );
  };
  const getHolidayForDate = (date) => {
    if (!showHolidays) return null;
    const dateString = format(date, "yyyy-MM-dd");
    return usHolidays.find((holiday) => holiday.date === dateString) || null;
  };
  (0, import_react2.useEffect)(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPanelSize({ width: rect.width, height: rect.height });
      }
    };
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateSize();
    }
    return () => resizeObserver.disconnect();
  }, []);
  const layoutConfig = (0, import_react2.useMemo)(() => {
    const { width, height } = panelSize;
    if (width < 300 || height < 200) {
      return {
        size: "micro",
        showSidebar: false,
        showSearch: true,
        showFilters: true,
        showToday: false,
        showViewToggle: true,
        showEventButton: true,
        headerPadding: "p-2",
        headerGap: "gap-1",
        gridCols: 7,
        dayHeight: "min-h-[40px]",
        fontSize: "text-xs",
        buttonSize: "h-8 w-8",
        // Minimum 32px touch targets
        iconSize: "w-3 h-3",
        maxEventsPerDay: 0,
        compactMode: true
      };
    }
    if (width < 500 || height < 300) {
      return {
        size: "small",
        showSidebar: false,
        showSearch: true,
        showFilters: true,
        showToday: false,
        showViewToggle: true,
        showEventButton: true,
        headerPadding: "p-2",
        headerGap: "gap-1",
        gridCols: 7,
        dayHeight: "min-h-[50px]",
        fontSize: "text-xs",
        buttonSize: "h-8 w-8",
        // Better touch targets
        iconSize: "w-3 h-3",
        maxEventsPerDay: 1,
        compactMode: true
      };
    }
    if (width < 800 || height < 500) {
      return {
        size: "medium",
        showSidebar: !!selectedDate,
        showSearch: true,
        showFilters: true,
        showToday: true,
        showViewToggle: true,
        showEventButton: true,
        headerPadding: "p-3",
        headerGap: "gap-2",
        gridCols: 7,
        dayHeight: "min-h-[70px]",
        fontSize: "text-sm",
        buttonSize: "h-9 w-9",
        // Approaching ideal 44px touch targets
        iconSize: "w-4 h-4",
        maxEventsPerDay: 2,
        compactMode: false
      };
    }
    return {
      size: "large",
      showSidebar: true,
      showSearch,
      showFilters: true,
      showToday: true,
      showViewToggle: true,
      showEventButton: true,
      headerPadding: "p-4",
      headerGap: "gap-3",
      gridCols: 7,
      dayHeight: "min-h-[90px]",
      fontSize: "text-sm",
      buttonSize: "h-10 w-10",
      // Ideal 40px touch targets
      iconSize: "w-4 h-4",
      maxEventsPerDay: 3,
      compactMode: false
    };
  }, [panelSize, selectedDate, showSearch]);
  const filteredEvents = (0, import_react2.useMemo)(() => {
    if (!searchQuery) return events;
    return events.filter(
      (event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.description?.toLowerCase().includes(searchQuery.toLowerCase()) || event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);
  const navigateMonth = (direction) => {
    setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };
  const handleDateClick = (date) => {
    if (!isSameMonth(date, currentDate)) {
      setCurrentDate(date);
      setSelectedDate(date);
    } else {
      setSelectedDate(isSameDay(date, selectedDate || /* @__PURE__ */ new Date()) ? null : date);
    }
  };
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };
  import_react2.default.useEffect(() => {
    if (searchQuery === "" && showSearch) {
      const timer = setTimeout(() => {
        setShowSearch(false);
      }, 2e3);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, showSearch]);
  import_react2.default.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!shouldProcessHotkey(e)) {
        return;
      }
      switch (e.key) {
        case "Escape":
          if (showSearch) {
            setShowSearch(false);
            setSearchQuery("");
          } else if (selectedDate) {
            setSelectedDate(null);
          }
          break;
        case "/":
          if (layoutConfig.showSearch !== false) {
            e.preventDefault();
            setShowSearch(true);
          }
          break;
        case "ArrowLeft":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            navigateMonth("prev");
          }
          break;
        case "ArrowRight":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            navigateMonth("next");
          }
          break;
        case "t":
          if (!e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            setCurrentDate(/* @__PURE__ */ new Date());
          }
          break;
        case "m":
          if (layoutConfig.showViewToggle && !e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            setView("month");
          }
          break;
        case "a":
          if (layoutConfig.showViewToggle && !e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            setView("agenda");
          }
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showSearch, selectedDate, layoutConfig, navigateMonth]);
  if (isLoading) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ref: containerRef, className: cn("flex h-full bg-white", className), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "text-center", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Calendar, { className: cn(
        "text-krushr-primary mx-auto mb-2 animate-pulse",
        panelSize.width < 200 ? "w-4 h-4" : "w-8 h-8"
      ) }),
      panelSize.width >= 200 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-sm text-gray-500 font-manrope", children: "Loading..." })
    ] }) }) });
  }
  if (layoutConfig.size === "micro" && panelSize.height < 150) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ref: containerRef, className: cn("flex h-full bg-white", className), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex-1 flex flex-col", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "p-2 border-b border-gray-200 bg-white", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => navigateMonth("prev"),
              className: "p-1 h-6 w-6 focus:ring-2 focus:ring-krushr-primary focus:outline-none",
              title: "Previous month",
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ChevronLeft, { className: "w-3 h-3" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-xs font-semibold text-gray-900 font-manrope min-w-0 px-1", children: format(currentDate, "M/yy") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => navigateMonth("next"),
              className: "p-1 h-6 w-6 focus:ring-2 focus:ring-krushr-primary focus:outline-none",
              title: "Next month",
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ChevronRight, { className: "w-3 h-3" })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          Button,
          {
            variant: "default",
            size: "sm",
            onClick: () => setShowEventModal(true),
            className: "bg-krushr-primary hover:bg-krushr-primary/90 text-white p-1 h-6 w-6 focus:ring-2 focus:ring-krushr-primary focus:outline-none",
            title: "Create new task",
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Plus, { className: "w-3 h-3" })
          }
        )
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex-1 p-1", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden text-xs", children: [
        ["S", "M", "T", "W", "T", "F", "S"].map((day, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bg-gray-50 text-center p-0.5", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-xs font-medium text-gray-600", children: day }) }, index)),
        calendarDays.map((date) => {
          const dayEvents = getEventsForDay(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isCurrentDay = isToday(date);
          const holiday = getHolidayForDate(date);
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "div",
            {
              onClick: () => handleDateClick(date),
              className: cn(
                "bg-white cursor-pointer border-r border-b border-gray-100 hover:bg-gray-50 transition-colors min-h-[20px] p-0.5 text-center",
                !isCurrentMonth && "bg-gray-50/50 text-gray-400 hover:bg-gray-100",
                isCurrentDay && "bg-krushr-primary/10 text-krushr-primary font-semibold",
                holiday && "bg-red-50 border-red-200"
              ),
              title: (() => {
                const tooltipParts = [];
                if (holiday) {
                  tooltipParts.push(`\u{1F389} ${holiday.name}`);
                  if (holiday.type) {
                    tooltipParts.push(`(${holiday.type})`);
                  }
                }
                if (dayEvents.length > 0) {
                  if (tooltipParts.length > 0) tooltipParts.push("\n---\n");
                  tooltipParts.push(`\u{1F4C5} ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}:`);
                  dayEvents.slice(0, 3).forEach((event) => {
                    const timeStr = event.allDay ? "All day" : format(new Date(event.startTime), "h:mm a");
                    tooltipParts.push(`\u2022 ${timeStr}: ${event.title}`);
                  });
                  if (dayEvents.length > 3) {
                    tooltipParts.push(`\u2022 +${dayEvents.length - 3} more events`);
                  }
                }
                return tooltipParts.length > 0 ? tooltipParts.join("\n") : void 0;
              })(),
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center justify-center h-full", children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cn(
                  "text-xs",
                  holiday && "text-red-600 font-medium"
                ), children: format(date, "d") }),
                (dayEvents.length > 0 || holiday) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: cn(
                  "w-1 h-1 rounded-full ml-0.5",
                  holiday ? "bg-red-500" : "bg-krushr-primary"
                ) })
              ] })
            },
            date.toISOString()
          );
        })
      ] }) })
    ] }) });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TooltipProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ref: containerRef, className: cn("flex h-full bg-white", className), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex-1 flex flex-col", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "border-b border-gray-200/80 bg-gradient-to-r from-white to-gray-50/30", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: cn("flex items-center justify-between", layoutConfig.headerPadding), children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center min-w-0 flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => navigateMonth("prev"),
                  className: cn(
                    "h-9 w-9 rounded-l-xl border-r border-gray-100/80 hover:bg-krushr-primary/5 hover:text-krushr-primary transition-all duration-200",
                    "focus:ring-2 focus:ring-krushr-primary/20 focus:outline-none"
                  ),
                  title: "Previous month",
                  children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ChevronLeft, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: cn(
                "text-center py-2",
                layoutConfig.size === "micro" ? "px-1 min-w-[50px]" : layoutConfig.size === "small" ? "px-1.5 min-w-[60px]" : "px-2 min-w-[80px]"
              ), children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "font-semibold text-gray-900 font-manrope text-sm leading-none", children: layoutConfig.size === "micro" ? format(currentDate, "M/yy") : layoutConfig.size === "small" ? format(currentDate, "MMM yy") : layoutConfig.size === "medium" ? format(currentDate, "MMM yyyy") : format(currentDate, "MMMM yyyy") }),
                layoutConfig.size === "large" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-xs text-gray-500 mt-0.5 font-manrope", children: format(currentDate, "yyyy") })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => navigateMonth("next"),
                  className: cn(
                    "h-9 w-9 rounded-r-xl border-l border-gray-100/80 hover:bg-krushr-primary/5 hover:text-krushr-primary transition-all duration-200",
                    "focus:ring-2 focus:ring-krushr-primary/20 focus:outline-none"
                  ),
                  title: "Next month",
                  children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ChevronRight, { className: "w-4 h-4" })
                }
              )
            ] }),
            layoutConfig.showToday && layoutConfig.size !== "micro" && layoutConfig.size !== "small" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setCurrentDate(/* @__PURE__ */ new Date()),
                className: cn(
                  "ml-3 bg-white/80 backdrop-blur-sm border-gray-200/60 hover:bg-krushr-primary hover:text-white hover:border-krushr-primary",
                  "shadow-sm transition-all duration-200 font-manrope px-3 h-9",
                  "focus:ring-2 focus:ring-krushr-primary/20 focus:outline-none"
                ),
                title: "Go to today",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Clock, { className: "w-3.5 h-3.5 mr-1.5" }),
                  "Today"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2 ml-4", children: [
            layoutConfig.showViewToggle && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm p-1", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => setView("month"),
                  className: cn(
                    "h-8 px-3 rounded-lg transition-all duration-200 relative",
                    view === "month" ? "bg-krushr-primary text-white shadow-md" : "text-gray-600 hover:bg-gray-50 hover:text-krushr-primary"
                  ),
                  title: "Month view",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Calendar, { className: "w-3.5 h-3.5" }),
                    layoutConfig.size === "large" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ml-1.5 text-xs font-medium", children: "Month" })
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => setView("agenda"),
                  className: cn(
                    "h-8 px-3 rounded-lg transition-all duration-200 relative",
                    view === "agenda" ? "bg-krushr-primary text-white shadow-md" : "text-gray-600 hover:bg-gray-50 hover:text-krushr-primary"
                  ),
                  title: "Agenda view",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(List, { className: "w-3.5 h-3.5" }),
                    layoutConfig.size === "large" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ml-1.5 text-xs font-medium", children: "Agenda" })
                  ]
                }
              )
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-sm", children: [
              layoutConfig.showSearch !== false && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => setShowSearch(!showSearch),
                  className: cn(
                    "transition-all duration-200",
                    layoutConfig.size === "micro" ? "h-8 w-8 rounded-l-lg" : "h-9 w-9 rounded-l-xl",
                    showSearch ? "bg-krushr-primary/10 text-krushr-primary" : "hover:bg-gray-50 hover:text-krushr-primary text-gray-500",
                    "focus:ring-2 focus:ring-krushr-primary/20 focus:outline-none"
                  ),
                  title: "Search events",
                  children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Search, { className: cn(
                    layoutConfig.size === "micro" ? "w-3.5 h-3.5" : "w-4 h-4"
                  ) })
                }
              ),
              layoutConfig.showFilters && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => setShowFilters(!showFilters),
                  className: cn(
                    "border-l border-gray-100/80 hover:bg-gray-50 hover:text-krushr-primary text-gray-500 transition-all duration-200",
                    layoutConfig.size === "micro" ? "h-8 w-8" : "h-9 w-9",
                    "focus:ring-2 focus:ring-krushr-primary/20 focus:outline-none"
                  ),
                  title: "Filter events",
                  children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Funnel, { className: cn(
                    layoutConfig.size === "micro" ? "w-3.5 h-3.5" : "w-4 h-4"
                  ) })
                }
              ),
              layoutConfig.showEventButton && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
                Button,
                {
                  variant: "default",
                  size: "sm",
                  onClick: () => setShowEventModal(true),
                  className: cn(
                    "bg-krushr-primary hover:bg-krushr-primary/90 text-white transition-all duration-200 shadow-md",
                    "focus:ring-2 focus:ring-krushr-primary/40 focus:outline-none",
                    layoutConfig.size === "micro" ? "h-8 rounded-r-lg" : "h-9 rounded-r-xl",
                    layoutConfig.showSearch !== false ? "border-l border-krushr-primary/20" : "rounded-xl",
                    layoutConfig.size === "micro" ? "px-2" : "px-3"
                  ),
                  title: "Create new task",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Plus, { className: cn(
                      layoutConfig.size === "micro" ? "w-3.5 h-3.5" : "w-4 h-4"
                    ) }),
                    layoutConfig.size === "large" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ml-1.5 text-xs font-medium", children: "New Task" })
                  ]
                }
              )
            ] })
          ] })
        ] }),
        showSearch && layoutConfig.showSearch !== false && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "px-4 pb-3 animate-in slide-in-from-top-2 duration-300", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "relative bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-lg", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Search, { className: cn(
            "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400",
            layoutConfig.size === "micro" ? "w-3.5 h-3.5" : "w-4 h-4"
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            FloatingInput,
            {
              label: "Search events, locations, or attendees...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "pl-12 pr-4 h-12 border-0 bg-transparent font-manrope text-sm focus:ring-2 focus:ring-krushr-primary/20",
              autoFocus: true
            }
          ),
          searchQuery && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => {
                setSearchQuery("");
                setShowSearch(false);
              },
              className: "absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-gray-100",
              children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(X, { className: "w-4 h-4" })
            }
          )
        ] }) })
      ] }),
      view === "agenda" ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(AgendaView, { workspaceId, className: "flex-1" }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: cn("flex-1", layoutConfig.headerPadding), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden", children: [
        (layoutConfig.size === "micro" ? ["S", "M", "T", "W", "T", "F", "S"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).map((day, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: cn("bg-gray-50 text-center", layoutConfig.size === "micro" ? "p-1" : "p-2"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cn("font-medium text-gray-600 font-manrope", layoutConfig.fontSize), children: day }) }, index)),
        calendarDays.map((date) => {
          const dayEvents = getEventsForDay(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isCurrentDay = isToday(date);
          const holiday = getHolidayForDate(date);
          const maxEvents = layoutConfig.maxEventsPerDay;
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "div",
            {
              onClick: () => handleDateClick(date),
              className: cn(
                "bg-white cursor-pointer border-r border-b border-gray-100 hover:bg-gray-50 transition-colors",
                layoutConfig.dayHeight,
                layoutConfig.size === "micro" ? "p-1" : "p-2",
                !isCurrentMonth && "bg-gray-50/50 text-gray-400 hover:bg-gray-100",
                isSelected && "bg-krushr-primary/5 border-krushr-primary",
                isCurrentDay && "bg-krushr-primary/10",
                holiday && "bg-red-50/50 border-red-200/50"
              ),
              title: (() => {
                const tooltipParts = [];
                if (holiday) {
                  tooltipParts.push(`\u{1F389} ${holiday.name}`);
                  if (holiday.type) {
                    tooltipParts.push(`(${holiday.type})`);
                  }
                }
                if (dayEvents.length > 0) {
                  if (tooltipParts.length > 0) tooltipParts.push("\n---\n");
                  tooltipParts.push(`\u{1F4C5} ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}:`);
                  dayEvents.slice(0, 3).forEach((event) => {
                    const timeStr = event.allDay ? "All day" : format(new Date(event.startTime), "h:mm a");
                    tooltipParts.push(`\u2022 ${timeStr}: ${event.title}`);
                  });
                  if (dayEvents.length > 3) {
                    tooltipParts.push(`\u2022 +${dayEvents.length - 3} more events`);
                  }
                }
                return tooltipParts.length > 0 ? tooltipParts.join("\n") : void 0;
              })(),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: cn("flex items-center justify-between", layoutConfig.size !== "micro" && "mb-1"), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cn(
                    "font-manrope",
                    layoutConfig.fontSize,
                    isCurrentDay && "font-semibold text-krushr-primary",
                    !isCurrentMonth && "text-gray-400 opacity-75",
                    holiday && isCurrentMonth && "text-red-600 font-medium"
                  ), children: format(date, "d") }),
                  dayEvents.length > 0 && layoutConfig.size !== "micro" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { variant: "secondary", className: cn("px-1 py-0", layoutConfig.fontSize === "text-xs" ? "text-xs" : "text-xs"), children: dayEvents.length }),
                  holiday && layoutConfig.size !== "micro" && dayEvents.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Tooltip, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "w-1.5 h-1.5 bg-red-500 rounded-full cursor-pointer" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TooltipContent, { side: "right", className: "max-w-xs", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "space-y-1", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "font-semibold text-sm flex items-center gap-2", children: [
                        "\u{1F389} ",
                        holiday.name
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-xs text-gray-600", children: holiday.type }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-xs text-gray-500", children: format(date, "EEEE, MMMM d, yyyy") })
                    ] }) })
                  ] }),
                  (dayEvents.length > 0 || holiday) && layoutConfig.size === "micro" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Tooltip, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: cn(
                      "w-1.5 h-1.5 rounded-full cursor-pointer",
                      holiday ? "bg-red-500" : "bg-krushr-primary"
                    ) }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TooltipContent, { side: "right", className: "max-w-xs", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "space-y-1", children: [
                      holiday && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "font-semibold text-sm flex items-center gap-2", children: [
                          "\u{1F389} ",
                          holiday.name
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-xs text-gray-600", children: holiday.type })
                      ] }),
                      dayEvents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
                        holiday && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "border-t border-gray-100 pt-1 mt-1" }),
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "text-xs text-gray-600", children: [
                          "\u{1F4C5} ",
                          dayEvents.length,
                          " event",
                          dayEvents.length > 1 ? "s" : ""
                        ] }),
                        dayEvents.slice(0, 3).map((event) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "text-xs text-gray-500", children: [
                          "\u2022 ",
                          event.title
                        ] }, event.id)),
                        dayEvents.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "text-xs text-gray-400", children: [
                          "+",
                          dayEvents.length - 3,
                          " more"
                        ] })
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "text-xs text-gray-500 border-t border-gray-100 pt-1", children: format(date, "EEEE, MMMM d, yyyy") })
                    ] }) })
                  ] })
                ] }),
                maxEvents > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "space-y-0.5", children: [
                  dayEvents.slice(0, maxEvents).map((event) => {
                    const colorConfig = EVENT_COLORS[event.color] || EVENT_COLORS.blue;
                    const IconComponent = EVENT_TYPE_ICONS[event.type];
                    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Tooltip, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                        "div",
                        {
                          onClick: (e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          },
                          className: cn(
                            "rounded truncate cursor-pointer transition-colors hover:opacity-80 border",
                            colorConfig.bg,
                            colorConfig.border,
                            colorConfig.text,
                            layoutConfig.size === "small" ? "p-0.5" : "p-1",
                            !isCurrentMonth && "opacity-60"
                          ),
                          children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-1", children: [
                            layoutConfig.size !== "small" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconComponent, { className: cn("flex-shrink-0", layoutConfig.iconSize) }),
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cn("truncate font-manrope", layoutConfig.fontSize), children: event.title }),
                            event.priority !== "LOW" && layoutConfig.size !== "small" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: cn(
                              "rounded-full flex-shrink-0",
                              PRIORITY_COLORS2[event.priority],
                              layoutConfig.size === "medium" ? "w-1 h-1" : "w-1.5 h-1.5"
                            ) })
                          ] })
                        }
                      ) }),
                      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TooltipContent, { side: "right", className: "max-w-xs", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "space-y-2", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "font-semibold text-sm", children: event.title }),
                        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "text-xs space-y-1", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "font-medium", children: "Type:" }),
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { variant: "secondary", className: "text-xs", children: event.type })
                          ] }),
                          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Clock, { className: "w-3 h-3" }),
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: event.allDay ? "All day" : `${format(event.startTime, "h:mm a")} - ${format(event.endTime, "h:mm a")}` })
                          ] }),
                          event.location && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(MapPin, { className: "w-3 h-3" }),
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: event.location })
                          ] }),
                          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "font-medium", children: "Priority:" }),
                            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                              Badge,
                              {
                                variant: event.priority === "HIGH" ? "destructive" : event.priority === "MEDIUM" ? "default" : "secondary",
                                className: "text-xs",
                                children: event.priority
                              }
                            )
                          ] }),
                          event.description && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "mt-2 pt-2 border-t border-gray-100", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "text-gray-700", children: event.description }) })
                        ] })
                      ] }) })
                    ] }, event.id);
                  }),
                  dayEvents.length > maxEvents && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: cn("text-gray-500 font-manrope pl-1", layoutConfig.fontSize), children: [
                    "+",
                    dayEvents.length - maxEvents,
                    " more"
                  ] })
                ] })
              ]
            },
            date.toISOString()
          );
        })
      ] }) })
    ] }),
    selectedDate && layoutConfig.showSidebar && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: cn(
      "border-l border-gray-200 bg-gray-50",
      layoutConfig.size === "medium" ? "w-64" : "w-80"
    ), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: layoutConfig.headerPadding, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h3", { className: cn("font-semibold text-gray-900 mb-2 font-manrope", layoutConfig.fontSize), children: layoutConfig.size === "medium" ? format(selectedDate, "MMM d") : format(selectedDate, "EEEE, MMMM d") }),
      (() => {
        const holiday = getHolidayForDate(selectedDate);
        return holiday ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mb-3 p-2 bg-red-50 border border-red-200 rounded-lg", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "w-2 h-2 bg-red-500 rounded-full" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cn("text-red-700 font-medium font-manrope", layoutConfig.fontSize), children: holiday.name })
          ] }),
          holiday.type && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: cn("text-red-600 mt-1 font-manrope", layoutConfig.fontSize === "text-sm" ? "text-xs" : "text-xs"), children: holiday.type })
        ] }) : null;
      })(),
      getEventsForDay(selectedDate).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Calendar, { className: cn("text-gray-400 mx-auto mb-2", layoutConfig.iconSize === "w-4 h-4" ? "w-6 h-6" : "w-8 h-8") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: cn("text-gray-500 font-manrope", layoutConfig.fontSize), children: "No events scheduled" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setShowEventModal(true),
            className: cn("mt-2", layoutConfig.buttonSize),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Plus, { className: layoutConfig.iconSize }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "ml-1", children: "Add Event" })
            ]
          }
        )
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: cn("space-y-2", layoutConfig.size === "medium" && "space-y-1"), children: getEventsForDay(selectedDate).map((event) => {
        const colorConfig = EVENT_COLORS[event.color] || EVENT_COLORS.blue;
        const IconComponent = EVENT_TYPE_ICONS[event.type];
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Card, { className: cn(
          "hover:shadow-sm transition-shadow cursor-pointer",
          layoutConfig.size === "medium" ? "p-2" : "p-3"
        ), onClick: () => handleEventClick(event), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: cn("rounded-lg", colorConfig.bg, layoutConfig.size === "medium" ? "p-1.5" : "p-2"), children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(IconComponent, { className: cn(colorConfig.text, layoutConfig.iconSize) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { className: cn("font-medium text-gray-900 truncate font-manrope", layoutConfig.fontSize), children: event.title }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2 mt-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Clock, { className: cn("text-gray-400", layoutConfig.iconSize) }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cn("text-gray-600 font-manrope", layoutConfig.fontSize), children: event.allDay ? "All day" : `${format(event.startTime, "h:mm a")} - ${format(event.endTime, "h:mm a")}` })
            ] }),
            event.location && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2 mt-1", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(MapPin, { className: cn("text-gray-400", layoutConfig.iconSize) }),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: cn("text-gray-600 truncate font-manrope", layoutConfig.fontSize), children: event.location })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex items-center gap-2 mt-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Badge, { variant: "outline", className: layoutConfig.fontSize, children: event.type }),
              event.priority !== "LOW" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: cn(
                "rounded-full",
                PRIORITY_COLORS2[event.priority],
                layoutConfig.size === "medium" ? "w-1.5 h-1.5" : "w-2 h-2"
              ) })
            ] })
          ] })
        ] }) }, event.id);
      }) })
    ] }) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      CompactTaskModal,
      {
        open: showEventModal,
        onClose: () => {
          setShowEventModal(false);
          setSelectedEvent(null);
        },
        onTaskCreated: () => {
          window.location.reload();
        },
        workspaceId,
        task: selectedEvent,
        isEditMode: !!selectedEvent,
        mode: "calendar",
        selectedDate
      }
    )
  ] }) });
}
export {
  NewCalendarPanel as default
};
//# sourceMappingURL=/chunks/NewCalendarPanel-RAGG3SOE.js.map
