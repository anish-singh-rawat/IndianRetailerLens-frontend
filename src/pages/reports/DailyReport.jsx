import { useState } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import {
  FiCalendar, FiSearch, FiTrendingUp, FiTrendingDown,
  FiDollarSign, FiFileText, FiAlertCircle, FiActivity,
} from "react-icons/fi";

const fmt = (n) =>
  `₹${Number(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const today = () => new Date().toISOString().split("T")[0];
const firstOfMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]; };

const StatCard = ({ icon: Icon, label, value, sub, color = "orange" }) => {
  const colors = { orange: "from-orange-500 to-orange-600", green: "from-emerald-500 to-emerald-600", red: "from-red-500 to-red-600", blue: "from-blue-500 to-blue-600", teal: "from-teal-500 to-teal-600" };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} flex-shrink-0`}>
        <Icon className="text-white w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

const DataCard = ({ title, children, footer }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
    <div className="px-5 py-3.5 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-700">{title}</h3></div>
    <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[300px]">
      {children}
    </div>
    {footer !== undefined && <div className="px-5 py-2 border-t border-gray-50 bg-gray-50/60"><p className="text-xs text-gray-400">{footer}</p></div>}
  </div>
);

const InnerTable = ({ headers, rows, emptyMsg = "No Data Available", highlightLast = false }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-gray-100">
        {headers.map((h, i) => <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>)}
      </tr>
    </thead>
    <tbody>
      {rows.length === 0
        ? <tr><td colSpan={headers.length} className="px-4 py-6 text-center text-sm text-gray-400 bg-gray-50/50">{emptyMsg}</td></tr>
        : rows.map((row, i) => {
          const hi = highlightLast && i === rows.length - 1;
          return (
            <tr key={i} className={`border-b border-gray-50 transition-colors ${hi ? "bg-orange-400" : "hover:bg-orange-50/40"}`}>
              {row.map((cell, j) => <td key={j} className={`px-4 py-2.5 whitespace-nowrap ${hi ? "text-white font-bold" : "text-gray-700"}`}>{cell}</td>)}
            </tr>
          );
        })
      }
    </tbody>
  </table>
);

const footerText = (arr, label = "entries") =>
  arr?.length ? `Showing 1 to ${arr.length} of ${arr.length} ${label}` : `Showing 0 to 0 of 0 ${label}`;

export default function DailyReport() {
  const [form, setForm] = useState({ startDate: today(), endDate: today() });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.endDate) e.endDate = "End date is required";
    if (form.startDate && form.endDate && form.startDate > form.endDate) e.endDate = "End date must be after start date";
    if (form.endDate && form.endDate > today()) e.endDate = "End date cannot be in the future";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFetch = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/jc/report/daily", form);
      if (res.data.success) {
        setReport(res.data); toast.success("Report loaded");
        console.log(res.data)
      }
      else toast.error(res.data.message || "Failed to load report");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const presets = [
    { label: "Today", fn: () => ({ startDate: today(), endDate: today() }) },
    { label: "This Month", fn: () => ({ startDate: firstOfMonth(), endDate: today() }) },
    { label: "Last 7 Days", fn: () => { const d = new Date(); d.setDate(d.getDate() - 6); return { startDate: d.toISOString().split("T")[0], endDate: today() }; } },
    { label: "Last 30 Days", fn: () => { const d = new Date(); d.setDate(d.getDate() - 29); return { startDate: d.toISOString().split("T")[0], endDate: today() }; } },
  ];

  const inputCls = (err) =>
    `w-full pl-10 pr-3 py-2.5 text-sm text-gray-700 bg-gray-50 border rounded-xl outline-none transition-all ${err ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-orange-300"}`;

  const d = report;
  const ds = d?.dashboardSummary;

  const salesTxMap = {};
  (d?.sales?.transactionSummary || []).forEach(t => { salesTxMap[t._id] = t.totalAmount; });
  const jcTxMap = {};
  (d?.jobCardStatus?.transactionTypeSummary || []).forEach(t => { jcTxMap[t._id] = t.totalAmount; });

  const cashInHand = (jcTxMap["CASH"] || 0) + (salesTxMap["CASH"] || 0);
  const credit = (jcTxMap["CARD"] || 0) + (salesTxMap["CARD"] || 0);
  const upi = (jcTxMap["UPI"] || 0) + (salesTxMap["UPI"] || 0);
  const totalSales = (d?.sales?.totalSalesAmount || 0) + (d?.jobCards?.deliveredSummary?.totalAmount || 0);
  const expense = d?.expenses?.totalExpenseAmount || 0;

  const txRows = d?.jobCardStatus?.transactionTypeSummary || [];
  const txTotal = txRows.reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const txDisplay = [
    ...txRows.map(t => [t._id || "N/A", fmt(t.totalAmount)]),
    ["Total", fmt(txTotal)],
  ];

  return (
    <div className="min-h-screen bg-gray-50/70 px-4 py-2 max-w-7xl mx-auto">

      {/* Date Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map(({ label, fn }) => (
            <button key={label} type="button" onClick={() => { setForm(fn()); setErrors({}); }}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all">
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
            <div className="relative">
              <FiCalendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" value={form.startDate} max={today()}
                onChange={(e) => { setForm(p => ({ ...p, startDate: e.target.value })); setErrors(p => ({ ...p, startDate: "" })); }}
                className={inputCls(errors.startDate)} />
            </div>
            {errors.startDate && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><FiAlertCircle size={11} /> {errors.startDate}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
            <div className="relative">
              <FiCalendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" value={form.endDate} min={form.startDate} max={today()}
                onChange={(e) => { setForm(p => ({ ...p, endDate: e.target.value })); setErrors(p => ({ ...p, endDate: "" })); }}
                className={inputCls(errors.endDate)} />
            </div>
            {errors.endDate && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><FiAlertCircle size={11} /> {errors.endDate}</p>}
          </div>
          <button type="button" onClick={handleFetch} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 shadow-sm">
            {loading
              ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              : <FiSearch size={15} />}
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Instructions before report generate */}
      {!report && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
          <FiFileText size={52} className="mb-3" />
          <p className="text-sm font-medium">Select a date range and generate report</p>
        </div>
      )}

      {report && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard icon={FiTrendingUp} label="Net Collection" value={fmt(ds?.netCollection)} color="green" />
            <StatCard icon={FiActivity} label="Net Profit" value={fmt(ds?.netProfit)} color={ds?.netProfit >= 0 ? "teal" : "red"} />
            <StatCard icon={FiDollarSign} label="Addln sales" value={fmt(d?.sales?.totalSalesAmount)} sub={`${d?.sales?.totalRecords} records`} color="blue" />
            <StatCard icon={FiTrendingDown} label="Total Expenses" value={fmt(expense)} sub={`${d?.expenses?.totalRecords} records`} color="red" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={FiFileText} label="Total JCs" value={d?.jobCards?.deliveredSummary?.count ?? 0} color="orange" />
            <StatCard icon={FiDollarSign} label="JC Total" value={fmt(d?.jobCards?.deliveredSummary?.totalAmount)} color="blue" />
            <StatCard icon={FiDollarSign} label="JC Collected" value={fmt(d?.jobCards?.deliveredSummary?.totalCollected)} color="green" />
            <StatCard icon={FiDollarSign} label="JC Pending" value={fmt(d?.jobCards?.deliveredSummary?.totalBalance)} color="red" />
          </div>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

            {/* Daily Expense List */}
            <DataCard title="Daily Expense List" footer={footerText(d?.expenses?.data)}>
              <InnerTable
                headers={["Date", "Name", "Type", "Amount"]}
                rows={(d?.expenses?.data || []).map(e => [fmtDate(e.createdAt), e.name || e.title || "-", e.type || e.category || "-", fmt(e.amount)])}
              />
            </DataCard>

            {/* Job Cards Prodcuts - sold stocks */}
            <DataCard title="Sold Stock" footer={footerText(d?.products?.data)}>
              <InnerTable
                headers={["Booking Type", "Model"]}
                rows={(d?.products?.data || []).map(p => [p.finalCategory || "-", p.finalProductName || "-"])}
              />
            </DataCard>

            {/* Job Cards Prodcuts - Category wise count sold stocks */}
            <DataCard title="Sold Stock Count" footer={footerText(d?.products?.categoryCount)}>
              <InnerTable
                headers={["Booking Type", "Count"]}
                rows={(d?.products?.categoryCount || []).map(c => [c._id || "-", c.count])}
              />
            </DataCard>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

            {/* Daily Sales & Payment Method wise summary */}
            <DataCard title="Daily Sales & Payment Methods" footer="Showing 1 to 1 of 1 entry">
              <InnerTable
                headers={["Total", "Credit", "Cash", "UPI", "Expense", "Cash in Hand"]}
                rows={[[
                  <span className="font-semibold text-gray-800">{fmt(totalSales)}</span>,
                  fmt(credit), fmt(cashInHand), fmt(upi), fmt(expense),
                  <span className="font-semibold text-emerald-600">{fmt(cashInHand - expense)}</span>,
                ]]}
              />
            </DataCard>

            {/* Transaction Type list */}
            <DataCard title="List of Transactions" footer={footerText(txRows)}>
              <InnerTable headers={["Transaction Type", "Amount"]} highlightLast={true} rows={txDisplay} />
            </DataCard>

            {/* Sales List data */}
            <DataCard title="Sales Transactions" footer={footerText(d?.sales?.data)}>
              <InnerTable
                headers={["Date", "Name", "Type", "Amount"]}
                rows={(d?.sales?.data || []).map(s => [
                  fmtDate(s.createdAt),
                  s.item || "-",
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-600">{s.paymentMode || "-"}</span>,
                  <span className="font-semibold text-emerald-600">{fmt(s.amount)}</span>,
                ])}
              />
            </DataCard>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

            {/* Delivery Count */}
            <DataCard title="Delivery Count" footer={footerText(d?.jobCards?.data)}>

              <InnerTable
                headers={["Count", "Collected"]}
                rows={[
                  [
                    d?.jobCards?.deliveredSummary?.count ?? "-",
                    d?.jobCards?.deliveredSummary?.totalCollected || 0
                  ],
                ]}
              />
            </DataCard>

            {/* Prescription Count */}
            <DataCard title="Prescription Count">
              <InnerTable
                headers={["Count", "Total"]}
                rows={[
                  [
                    d?.prescriptions?.totalRecords ?? "-",
                    <span className="font-semibold text-emerald-600">
                      {fmt(d?.prescriptions?.totalAmount || 0)}
                    </span>,
                  ],
                ]}
              />
            </DataCard>
          </div>
        </>
      )}
    </div>
  );
}