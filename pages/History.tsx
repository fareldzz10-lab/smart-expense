import React, { useState, useMemo, useRef, useEffect } from "react";
import { Transaction } from "../types";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
  Search,
  Settings,
  List,
  Inbox,
  Calendar as CalendarIcon,
  Check,
  Globe,
  Upload,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { storageService } from "../services/storageService";
import { motion, AnimatePresence } from "framer-motion";
import { QuickAddModal } from "../components/QuickAddModal";
import { getCategoryIcon } from "../utils/iconHelpers";

interface HistoryProps {
  transactions: Transaction[];
  onUpdate: () => void;
  onOpenQuickAdd?: () => void;
}

const currencies = [
  { code: "IDR", label: "Indonesian Rupiah" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "JPY", label: "Japanese Yen" },
];

export const History: React.FC<HistoryProps> = ({
  transactions,
  onUpdate,
  onOpenQuickAdd,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Edit State
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());

  const currentCurrency = localStorage.getItem("currency") || "IDR";

  // Toggle selection for a single item
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Handle Currency Change
  const handleCurrencyChange = (code: string) => {
    localStorage.setItem("currency", code);
    window.location.reload();
  };

  // Handle Edit
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // Handle Delete Single
  const handleDelete = async (id?: string) => {
    if (id) {
      if (window.confirm("Are you sure you want to delete this transaction?")) {
        await storageService.deleteTransaction(id);
        onUpdate();
      }
    }
  };

  // Handle Delete Selected
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} transactions?`)) {
      for (const id of selectedIds) {
        await storageService.deleteTransaction(id);
      }
      setSelectedIds(new Set());
      onUpdate();
    }
  };

  // Handle Import
  const handleImportClick = () => {
    fileInputRef.current?.click();
    setIsSettingsOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        const success = await storageService.importData(text);
        if (success) {
          alert("Data imported successfully!");
          onUpdate();
        } else {
          alert("Failed to import data. Check JSON format.");
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle Reset
  const handleReset = async () => {
    if (
      window.confirm(
        "DANGER: This will permanently delete ALL data (Transactions, Budgets, Goals). Are you sure?"
      )
    ) {
      await storageService.clearAllData();
      onUpdate();
      setIsSettingsOpen(false);
    }
  };

  // Close dropdown on outside click
  const settingsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = filterType === "all" || t.type === filterType;
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchQuery]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach((t) => {
      const dateKey = t.date.split("T")[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const getDateLabel = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return formatDate(dateString);
  };

  // Calendar Logic
  const calendarData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Explicit type for days array to avoid 'unknown' inference
    type CalendarDay = {
      day: number;
      income: number;
      expense: number;
      dateStr: string;
      hasTx: boolean;
    };
    const days: (CalendarDay | null)[] = [];

    // Padding
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        i
      ).padStart(2, "0")}`;
      const dayTxs = transactions.filter((t) => t.date.startsWith(dateStr));
      const income = dayTxs
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTxs
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      days.push({ day: i, income, expense, dateStr, hasTx: dayTxs.length > 0 });
    }
    return days;
  }, [calendarDate, transactions]);

  const changeMonth = (delta: number) => {
    setCalendarDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + delta);
      return newDate;
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json"
      />

      {/* Header - Stacked on Mobile */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1 relative">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Transactions
            </h2>
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`transition-colors p-1.5 rounded-lg ${
                  isSettingsOpen
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                    : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Settings size={20} />
              </button>

              {/* Settings Dropdown */}
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute left-0 md:left-auto md:right-auto md:top-full top-8 ml-2 md:ml-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setSelectionMode(!selectionMode);
                          setIsSettingsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            selectionMode
                              ? "bg-indigo-500 border-indigo-500"
                              : "border-slate-400 dark:border-slate-600"
                          }`}
                        >
                          {selectionMode && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        Enable Selection Mode
                      </button>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 my-1 mx-2"></div>

                      <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <span>Currency</span>
                        <Globe size={12} />
                      </div>
                      {currencies.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => handleCurrencyChange(c.code)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs opacity-50 w-6">
                              {c.code}
                            </span>
                            <span>{c.label}</span>
                          </div>
                          {currentCurrency === c.code && (
                            <Check size={14} className="text-indigo-500" />
                          )}
                        </button>
                      ))}
                      <div className="h-px bg-slate-200 dark:bg-slate-800 my-1 mx-2"></div>
                      <button
                        onClick={handleImportClick}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Upload size={16} className="text-slate-400" />
                        Import Data (JSON)
                      </button>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 my-1 mx-2"></div>
                      <button
                        onClick={handleReset}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
                        Reset Data
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
            Manage and view your financial history.
          </p>
        </div>

        {/* Actions - Hidden on mobile if not in selection mode (since we have FAB in mobile nav) */}
        <div className={`gap-3 ${selectionMode ? "flex" : "hidden md:flex"}`}>
          {selectionMode && selectedIds.size > 0 ? (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-900/20 transition-all animate-in fade-in zoom-in duration-200"
            >
              <Trash2 size={18} />
              <span>Delete ({selectedIds.size})</span>
            </button>
          ) : (
            <>
              <button
                onClick={onOpenQuickAdd}
                className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5"
              >
                <ArrowUpCircle size={18} />
                <span>Add Income</span>
              </button>
              <button
                onClick={onOpenQuickAdd}
                className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-900/20 transition-all transform hover:-translate-y-0.5"
              >
                <ArrowDownCircle size={18} />
                <span>Add Expense</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Controls Section - Wrap on mobile */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* View Toggles & Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <List size={16} /> List
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${
                  viewMode === "calendar"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <CalendarIcon size={16} /> Calendar
              </button>
            </div>

            {/* Filters (Only in List Mode) */}
            {viewMode === "list" && (
              <div className="inline-flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                    filterType === "all"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                      : "text-slate-500"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("income")}
                  className={`px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                    filterType === "income"
                      ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                      : "text-slate-500"
                  }`}
                >
                  Inc
                </button>
                <button
                  onClick={() => setFilterType("expense")}
                  className={`px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                    filterType === "expense"
                      ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
                      : "text-slate-500"
                  }`}
                >
                  Exp
                </button>
              </div>
            )}
          </div>

          {/* Selection Trigger */}
          {viewMode === "list" && !selectionMode && (
            <label className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors px-2 ml-auto">
              <input
                type="checkbox"
                checked={selectionMode}
                onChange={() => setSelectionMode(!selectionMode)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium">Select</span>
            </label>
          )}
        </div>

        {/* Search Input (List Mode Only) */}
        {viewMode === "list" && (
          <div className="relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px] pb-20 md:pb-0">
        {viewMode === "list" ? (
          filteredTransactions.length === 0 ? (
            <div className="w-full h-96 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30">
              <div className="w-20 h-20 bg-white dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-sm ring-1 ring-slate-200 dark:ring-white/5">
                <Inbox
                  size={36}
                  className="text-slate-400 dark:text-slate-600"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                No results found
              </h3>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                  <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      {selectionMode && <th className="w-12 px-6 py-5"></th>}
                      <th className="px-6 py-5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-5 text-slate-500 font-medium text-xs uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-5 text-slate-500 font-medium text-xs uppercase tracking-wider text-right">
                        Amount
                      </th>
                      <th className="px-6 py-5 text-slate-500 font-medium text-xs uppercase tracking-wider text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {Object.entries(groupedTransactions).map(([date, txs]) => (
                      <React.Fragment key={date}>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                          <td
                            colSpan={selectionMode ? 5 : 4}
                            className="px-6 py-2 text-xs font-bold text-slate-500 uppercase tracking-wide"
                          >
                            {getDateLabel(date)}
                          </td>
                        </tr>
                        {txs.map((t) => (
                          <tr
                            key={t.id}
                            className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            {selectionMode && (
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={!!t.id && selectedIds.has(t.id)}
                                  onChange={() => t.id && toggleSelection(t.id)}
                                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                />
                              </td>
                            )}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 shrink-0`}
                                >
                                  {getCategoryIcon(t.category)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                    {t.title}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {t.type}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                {t.category}
                              </span>
                            </td>
                            <td
                              className={`px-6 py-4 text-right font-bold text-sm ${
                                t.type === "income"
                                  ? "text-emerald-600 dark:text-emerald-500"
                                  : "text-rose-600 dark:text-rose-500"
                              }`}
                            >
                              {t.type === "income" ? "+" : "-"}{" "}
                              {formatCurrency(t.amount)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(t)}
                                  className="p-2 text-slate-400 hover:text-indigo-500"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(t.id)}
                                  className="p-2 text-slate-400 hover:text-rose-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Calendar View */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <ChevronLeft size={20} className="text-slate-500" />
              </button>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                {calendarDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <ChevronRight size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                <div
                  key={day}
                  className="text-xs font-bold text-slate-400 uppercase py-2"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 lg:gap-2">
              {calendarData.map((d, i) => {
                if (!d)
                  return (
                    <div
                      key={`empty-${i}`}
                      className="aspect-square bg-slate-50/50 dark:bg-slate-800/30 rounded-lg"
                    ></div>
                  );
                return (
                  <div
                    key={i}
                    className={`aspect-square bg-slate-50 dark:bg-slate-800 rounded-lg md:rounded-xl p-0.5 md:p-1 flex flex-col justify-between relative group hover:ring-2 hover:ring-indigo-500 transition-all ${
                      d.hasTx ? "cursor-pointer" : ""
                    }`}
                  >
                    <span
                      className={`text-[10px] md:text-xs font-semibold p-0.5 md:p-1 ${
                        d.hasTx
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {d.day}
                    </span>
                    <div className="flex flex-col gap-0.5 items-end px-0.5 md:px-1 pb-1">
                      {d.income > 0 && (
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                          title={`Income: ${formatCurrency(d.income)}`}
                        ></div>
                      )}
                      {d.expense > 0 && (
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-rose-500"
                          title={`Expense: ${formatCurrency(d.expense)}`}
                        ></div>
                      )}
                    </div>
                    {d.hasTx && (
                      <div className="hidden md:group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-900 text-white text-[10px] p-2 rounded-lg z-10 text-center shadow-xl">
                        {d.income > 0 && (
                          <div className="text-emerald-400">
                            +{formatCurrency(d.income)}
                          </div>
                        )}
                        {d.expense > 0 && (
                          <div className="text-rose-400">
                            -{formatCurrency(d.expense)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <QuickAddModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        onTransactionAdded={onUpdate}
        initialData={editingTransaction}
      />
    </div>
  );
};
