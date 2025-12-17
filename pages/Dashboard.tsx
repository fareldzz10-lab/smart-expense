import React, { useMemo, useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Save,
  FileText,
  Target,
  Wallet,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
  PieChart as PieChartIcon,
  Sun,
  Moon,
  Calendar,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { motion, Variants } from "framer-motion";
import confetti from "canvas-confetti";
import { Transaction, Budget } from "../types";
import { formatCurrency, formatDate } from "../utils/formatters";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getCategoryIcon } from "../utils/iconHelpers";

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  userName: string;
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
];

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  budgets,
  userName,
}) => {
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("en-US", dateOptions));
  }, []);

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((a, b) => a + b.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((a, b) => a + b.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const budgetSummary = useMemo(() => {
    const totalLimit = budgets.reduce((acc, curr) => acc + curr.limit, 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
    return { totalLimit, totalSpent };
  }, [budgets]);

  const healthScore = useMemo(() => {
    if (summary.income === 0 && summary.expense === 0) return 50;
    if (summary.income === 0) return 0;
    const savingsRate =
      ((summary.income - summary.expense) / summary.income) * 100;
    let score = 50;
    if (savingsRate > 20) score += 20;
    if (savingsRate > 40) score += 10;
    if (summary.expense < summary.income) score += 20;
    return Math.min(100, Math.max(0, Math.floor(score)));
  }, [summary]);

  const savingsRate = useMemo(() => {
    if (summary.income === 0) return 0;
    return Math.max(
      0,
      ((summary.income - summary.expense) / summary.income) * 100
    );
  }, [summary]);

  useEffect(() => {
    if (healthScore > 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [healthScore]);

  // PDF Export Logic
  const handleExportPDF = () => {
    if (transactions.length === 0) {
      alert("No data to export.");
      return;
    }

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString("en-US");

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Smart Expense Report", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${today}`, 14, 26);
    doc.text(`User: ${userName}`, 14, 31);

    // Summary Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 38, 182, 35, 3, 3, "FD");

    // Summary Headers
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("TOTAL INCOME", 24, 48);
    doc.text("TOTAL EXPENSE", 84, 48);
    doc.text("NET BALANCE", 144, 48);

    // Summary Values
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    doc.setTextColor(16, 185, 129); // Green
    doc.text(formatCurrency(summary.income), 24, 60);

    doc.setTextColor(244, 63, 94); // Red
    doc.text(formatCurrency(summary.expense), 84, 60);

    doc.setTextColor(59, 130, 246); // Blue
    doc.text(formatCurrency(summary.balance), 144, 60);

    // Table
    const tableColumn = ["Date", "Title", "Type", "Category", "Amount"];
    const tableRows = transactions.map((t) => [
      t.date.split("T")[0],
      t.title,
      t.type.toUpperCase(),
      t.category,
      formatCurrency(t.amount),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: "grid",
      headStyles: {
        fillColor: [79, 70, 229], // Indigo
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        4: { halign: "right", fontStyle: "bold" }, // Amount column
      },
      didParseCell: (data) => {
        // Color code the type column
        if (data.section === "body" && data.column.index === 2) {
          const text = data.cell.text[0];
          if (text === "INCOME") {
            data.cell.styles.textColor = [16, 185, 129];
          } else {
            data.cell.styles.textColor = [244, 63, 94];
          }
        }
      },
    });

    doc.save(
      `smart_expense_report_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  // CSV Export Logic
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert("No data to export.");
      return;
    }

    const headers = ["Date", "Title", "Type", "Category", "Amount", "Notes"];
    const rows = transactions.map((t) => [
      t.date.split("T")[0],
      `"${t.title.replace(/"/g, '""')}"`, // Escape quotes
      t.type,
      t.category,
      t.amount,
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `smart_expense_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bar Chart Data (30 Days) & Trend Calculation (Monthly)
  const { chartData, incomeTrend, expenseTrend } = useMemo(() => {
    // 1. Calculate Trends (Current Month vs Previous Month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Set to first day of previous month to avoid edge cases (e.g. March 31 -> Feb 28)
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    const currentMonthTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const prevMonthTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    const curInc = currentMonthTxs
      .filter((t) => t.type === "income")
      .reduce((a, b) => a + b.amount, 0);
    const prevInc = prevMonthTxs
      .filter((t) => t.type === "income")
      .reduce((a, b) => a + b.amount, 0);

    const curExp = currentMonthTxs
      .filter((t) => t.type === "expense")
      .reduce((a, b) => a + b.amount, 0);
    const prevExp = prevMonthTxs
      .filter((t) => t.type === "expense")
      .reduce((a, b) => a + b.amount, 0);

    const calculateTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    // 2. Calculate Chart Data (Last 30 Days)
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dayStr = date.toLocaleString("default", {
        day: "numeric",
        month: "short",
      });

      const dayTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        tDate.setHours(0, 0, 0, 0);
        return tDate.getTime() === date.getTime();
      });

      const inc = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((a, b) => a + b.amount, 0);
      const exp = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((a, b) => a + b.amount, 0);

      data.push({ name: dayStr, income: inc, expense: exp });
    }

    return {
      chartData: data,
      incomeTrend: calculateTrend(curInc, prevInc),
      expenseTrend: calculateTrend(curExp, prevExp),
    };
  }, [transactions]);

  // Breakdown Data
  const incomeBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "income")
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [transactions]);

  const expenseBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const gaugeData = [
    { name: "Score", value: healthScore },
    { name: "Remaining", value: 100 - healthScore },
  ];
  const gaugeColors = ["#eab308", "#334155"];

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-3 text-xs font-medium mb-1 last:mb-0"
            >
              <div className="flex items-center gap-1.5 min-w-[60px]">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-500 dark:text-slate-400 capitalize">
                  {entry.name}
                </span>
              </div>
              <span className="text-slate-900 dark:text-white font-mono ml-auto">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {greeting}, {userName} <span className="text-2xl">👋</span>
          </h2>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
            <Calendar size={14} />
            <span>{currentDate}</span>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 text-pink-600 dark:text-pink-500 rounded-lg text-sm font-medium hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-colors whitespace-nowrap active:scale-95 transform duration-100"
          >
            <FileText size={16} />
            <span>PDF Report</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors whitespace-nowrap active:scale-95 transform duration-100">
            <Save size={16} />
            <span>Backup</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap active:scale-95 transform duration-100"
          >
            <Download size={16} />
            <span>CSV Export</span>
          </button>
        </div>
      </motion.div>

      {/* Row 1: Budget & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Monthly Budget Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
                <Target className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-1">
                  Monthly Budget
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  <AnimatedCounter value={budgetSummary.totalLimit} />
                </h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                Spent
              </p>
              <p className="text-slate-900 dark:text-white font-bold">
                <AnimatedCounter value={budgetSummary.totalSpent} />
              </p>
            </div>
          </div>
          <div className="relative pt-2 z-10">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl h-3 mb-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    (budgetSummary.totalSpent /
                      (budgetSummary.totalLimit || 1)) *
                      100,
                    100
                  )}%`,
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-2xl shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
            </div>
            <div className="flex justify-end">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-500">
                {Math.max(
                  0,
                  100 -
                    (budgetSummary.totalSpent /
                      (budgetSummary.totalLimit || 1)) *
                      100
                ).toFixed(1)}
                % remaining
              </span>
            </div>
          </div>
        </motion.div>

        {/* Financial Health Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <Activity className="text-emerald-500" size={20} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Financial Health
            </h3>
          </div>

          <div className="w-full h-40 relative mt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="80%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={5}
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={gaugeColors[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-full text-center pointer-events-none">
              <span className="text-3xl font-bold text-amber-500 dark:text-amber-400 drop-shadow-sm">
                <AnimatedCounter value={healthScore} isCurrency={false} />
              </span>
            </div>
          </div>
          <div className="text-center -mt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Savings Rate:{" "}
              <span className="text-slate-900 dark:text-white">
                {savingsRate.toFixed(1)}%
              </span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, rotate: -1 }}
          className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/20 cursor-default"
        >
          <Wallet className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 transform rotate-12" />
          <div className="relative z-10 h-full flex flex-col justify-between min-h-[140px]">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
              <Wallet className="text-white" size={20} />
            </div>
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-1">
                Total Balance
              </p>
              <h3 className="text-4xl font-bold tracking-tight">
                <AnimatedCounter value={summary.balance} />
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Total Income
              </p>
              <h3 className="text-3xl font-bold text-emerald-500 mt-1">
                <AnimatedCounter value={summary.income} />
              </h3>
            </div>
            <button className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
              <ArrowUpRight size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-auto">
            {incomeTrend >= 0 ? (
              <TrendingUp size={16} className="text-emerald-500" />
            ) : (
              <TrendingDown size={16} className="text-rose-500" />
            )}
            <span
              className={`text-sm font-medium ${
                incomeTrend >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {Math.abs(incomeTrend).toFixed(1)}%
            </span>
            <span className="text-slate-400 text-xs">vs last month</span>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-rose-500/30 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Total Expense
              </p>
              <h3 className="text-3xl font-bold text-rose-500 mt-1">
                <AnimatedCounter value={summary.expense} />
              </h3>
            </div>
            <button className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
              <ArrowDownRight size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-auto">
            {expenseTrend <= 0 ? (
              <TrendingDown size={16} className="text-emerald-500" />
            ) : (
              <TrendingUp size={16} className="text-rose-500" />
            )}
            <span
              className={`text-sm font-medium ${
                expenseTrend <= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {Math.abs(expenseTrend).toFixed(1)}%
            </span>
            <span className="text-slate-400 text-xs">vs last month</span>
          </div>
        </motion.div>
      </div>

      {/* Row 3: Income vs Expense Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm"
        >
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center">
                <Activity className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Income vs Expense
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Last 30 days performance
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Income
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Expense
                </span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} barGap={4} barCategoryGap="20%">
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                  dy={10}
                  interval={2}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                  tickFormatter={(value) =>
                    `${
                      value >= 1000000
                        ? (value / 1000000).toFixed(1) + "M"
                        : (value / 1000).toFixed(0) + "k"
                    }`
                  }
                  dx={-10}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f1f5f9", opacity: 0.1 }}
                />
                <Bar
                  dataKey="income"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={15}
                  animationDuration={1500}
                />
                <Bar
                  dataKey="expense"
                  fill="#f43f5e"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={15}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <button className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium transition-colors">
              View All
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Activity size={20} />
                </div>
                <p className="text-sm">No recent transactions</p>
              </div>
            ) : (
              recentTransactions.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{
                    x: 4,
                    backgroundColor: "rgba(99, 102, 241, 0.05)",
                  }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between group p-3 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800`}
                    >
                      {getCategoryIcon(t.category)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                        {t.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        t.type === "income"
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}{" "}
                      {formatCurrency(t.amount)}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase">
                      {t.category}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Row 4: Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <PieChartIcon className="text-emerald-500" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Income Breakdown
            </h3>
          </div>

          <div className="h-64 flex flex-col md:flex-row items-center gap-4">
            <div className="w-full h-full md:w-1/2 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={incomeBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {incomeBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(0,0,0,0)"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
              {incomeBreakdown.length === 0 ? (
                <p className="text-slate-500 text-sm text-center">
                  No income data available
                </p>
              ) : (
                incomeBreakdown.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <PieChartIcon className="text-rose-500" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Expense Breakdown
            </h3>
          </div>

          <div className="h-64 flex flex-col md:flex-row items-center gap-4">
            <div className="w-full h-full md:w-1/2 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(0,0,0,0)"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
              {expenseBreakdown.length === 0 ? (
                <p className="text-slate-500 text-sm text-center">
                  No expense data available
                </p>
              ) : (
                expenseBreakdown.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
