// import { useState } from "react";
// import { toast } from "react-toastify";
// import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table";
// import api from "../../utils/api";
// import { useMemo } from "react";
// import { useDispatch } from "react-redux";
// import { hideLoader, showLoader } from "../../features/loader/loaderSlice";

// export default function MainReport() {

//     const [fromDate, setFromDate] = useState("");
//     const [toDate, setToDate] = useState("");
//     // complete jc data
//     const [jobCards, setJobCards] = useState([]);
//     const [deliveredJC, setDeliveredJC] = useState([]);
//     const [commissionByDelivered, setCommissionByDelivered] = useState([]);
//     // Counts
//     const [totalJobCards, setTotalJobCards] = useState(0);
//     const [deliveredCount, setDeliveredCount] = useState(0);

//     const [totalAdvance, setTotalAdvance] = useState(0);
//     const [totalBalance, setTotalBalance] = useState(0);
//     const [deliveredTotalSum, setDeliveredTotalSum] = useState(0);
//     const [deliveredJcBalanceReceived, setDeliveredJcBalanceReceived] = useState(0);
//     const [transactionSummary, setTransactionSummary] = useState([]);
//     const [totalCommission, setTotalCommission] = useState(0);
//     const [afterDeliveryCommission, setAfterDeliveryCommission] = useState(0);
//     const dispatch = useDispatch();


//     // fetch job cards
//     const fetchMainReport = async () => {
//         if (!fromDate || !toDate) {
//             return toast.error("Please select date range");
//         }

//         if (toDate < fromDate) return toast.error("Please enter valid date range");
//         try {

//             dispatch(showLoader());

//             const res = await api.post("/jc/report/main", { startDate: fromDate, endDate: toDate });

//             if (res.data?.success) {
//                 console.log(res.data)
//                 const result = res.data;
//                 setJobCards(result?.jobCards || []);
//                 setDeliveredJC(result?.deliveredJobCards || []);
//                 setTotalAdvance(result?.totalAdvance || 0);
//                 setTotalBalance(result?.totalBalance || 0);
//                 setTotalJobCards(result?.totalJobCards || 0);
//                 setDeliveredTotalSum(result?.deliveredTotalSum || 0);
//                 setDeliveredJcBalanceReceived(result?.deliveredJcBalanceReceived || 0);
//                 setTransactionSummary(result?.transactionSummary || 0);
//                 setDeliveredCount(result?.deliveredCount || 0);
//                 setTotalCommission(result?.totalCommissionCreated || 0); // commission at the time of jc create
//                 setAfterDeliveryCommission(result?.totalCommissionDelivered || 0)   // commission after product delivered
//                 setCommissionByDelivered(result?.commissionByDelivered || [])   // commission after product delivered
//             }
//         } catch (error) {
//             console.error("Failed to fetch job card stats", error);
//         } finally {
//             dispatch(hideLoader());
//         }
//     };


//     // All job card Active or Delivered
//     const bookingTableColumns = useMemo(
//         () => [
//             {
//                 header: "Date", accessorKey: "createdAt",
//                 cell: ({ getValue }) => {
//                     const value = getValue();
//                     if (!value) return "-";

//                     const date = new Date(value);

//                     return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, });

//                 },
//             },
//             { header: "Cust Name", accessorKey: "name" },
//             { header: "Mobile", accessorKey: "mobile" },
//             {
//                 header: "Delivery Date", accessorKey: "deliveryDate",
//                 cell: ({ getValue }) => {
//                     const value = getValue();
//                     if (!value) return "-";

//                     const date = new Date(value);

//                     return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, });
//                 },
//             },
//             { header: "Transaction type", accessorKey: "transactionType" },
//             { header: "Total", accessorKey: "total", },
//             { header: "Advance", accessorKey: "advance", },
//             { header: "Balance", accessorKey: "balance", },
//             { header: "Status", accessorKey: "status", },
//             { header: "Process status", accessorKey: "pstatus" },
//         ],
//         []
//     );

//     const bookingTable = useReactTable({
//         data: jobCards,
//         columns: bookingTableColumns,
//         getCoreRowModel: getCoreRowModel(),
//         getFilteredRowModel: getFilteredRowModel(),
//     });

//     // Only delivered Job Cards
//     const deliveredTableColumns = useMemo(
//         () => [
//             {
//                 header: "Date", accessorKey: "createdAt",
//                 cell: ({ getValue }) => {
//                     const value = getValue();
//                     if (!value) return "-";

//                     const date = new Date(value);

//                     return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, });

//                 },
//             },
//             { header: "Cust Name", accessorKey: "name" },
//             { header: "Mobile", accessorKey: "mobile" },
//             {
//                 header: "Delivered Date", accessorKey: "deliveredDate",
//                 cell: ({ getValue }) => {
//                     const value = getValue();
//                     if (!value) return "-";

//                     const date = new Date(value);

//                     return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, });
//                 },
//             },
//             { header: "Transaction type", accessorKey: "transactionType" },
//             { header: "Total", accessorKey: "total", },
//             { header: "Advance", accessorKey: "advance", },
//             { header: "Balance", accessorKey: "balance", },
//             { header: "Status", accessorKey: "status", },
//             { header: "Process status", accessorKey: "pstatus" },
//         ],
//         []
//     );

//     const deliveredTable = useReactTable({
//         data: deliveredJC,
//         columns: deliveredTableColumns,
//         getCoreRowModel: getCoreRowModel(),
//         getFilteredRowModel: getFilteredRowModel(),
//     });

//     // Delivered Job Cards Commission
//     const deliveredCommissionTableColumns = useMemo(
//         () => [
//             { header: "Eployee", accessorKey: "bookedByName", },
//             { header: "Total Commission", accessorKey: "totalCommission", },
//             { header: "Total Orders", accessorKey: "count", },
//         ],
//         []
//     );

//     const deliveredCommissionTable = useReactTable({
//         data: commissionByDelivered,
//         columns: deliveredCommissionTableColumns,
//         getCoreRowModel: getCoreRowModel(),
//         getFilteredRowModel: getFilteredRowModel(),
//     });


//     return (
//         <div className="min-h-screen bg-gray-100">


//             <div className="px-6 space-y-8">

//                 {/* ================= FILTER SECTION ================= */}
//                 <div className="bg-white rounded-xl shadow p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         {/* from date */}
//                         <div>
//                             <label className="text-sm font-medium">From Date</label>
//                             <input
//                                 type="date"
//                                 value={fromDate}
//                                 onChange={e => setFromDate(e.target.value)}
//                                 className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
//                             />
//                         </div>

//                         {/* to date */}
//                         <div>
//                             <label className="text-sm font-medium">To Date</label>
//                             <input
//                                 type="date"
//                                 value={toDate}
//                                 onChange={e => setToDate(e.target.value)}
//                                 className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none"
//                             />
//                         </div>

//                         {/* employees name */}
//                         {/* <div>
//                             <label className="text-sm font-medium">Employee</label>
//                             <select className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none">
//                                 <option>Select</option>
//                             </select>
//                         </div> */}

//                         {/* search button */}
//                         <div className="flex items-end">
//                             <button
//                                 type="button"
//                                 onClick={fetchMainReport}
//                                 className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2 transition cursor-pointer"
//                             >
//                                 Search
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* ================= BOOKING STATISTICS ================= */}
//                 <SectionHeader title="Booking Statistics" />

//                 <div className="bg-white rounded-xl shadow p-6">
//                     <h2 className="text-lg font-semibold mb-4">Booking Orders</h2>
//                     <div className="overflow-x-auto">
//                         <table className="min-w-max w-full border-collapse">
//                             <thead className="bg-gray-100">
//                                 {bookingTable.getHeaderGroups()?.map((hg) => (
//                                     <tr key={hg.id}>
//                                         {hg.headers.map((h) => (
//                                             <th key={h.id} className="px-3 py-2 border text-sm bg-blue-700 text-white w-auto whitespace-nowrap">
//                                                 {flexRender(h.column.columnDef.header, h.getContext())}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </thead>

//                             <tbody>
//                                 {bookingTable.getRowModel().rows.length === 0 && (
//                                     <tr>
//                                         <td colSpan={bookingTableColumns.length} className="text-center py-1">
//                                             No job card found
//                                         </td>
//                                     </tr>
//                                 )}

//                                 {bookingTable.getRowModel().rows.map((row) => (
//                                     <tr key={row.id} className="hover:bg-gray-50 text-center">
//                                         {row.getVisibleCells().map((cell) => (
//                                             <td key={cell.id} className="px-3 border text-sm w-auto whitespace-nowrap">
//                                                 {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
//                                             </td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow p-6">
//                     <h2 className="text-lg font-semibold mb-4">Booking Orders Total</h2>
//                     <div className="overflow-x-auto">

//                         <table className="min-w-max w-full text-sm border">
//                             <thead className="bg-gray-100">
//                                 <tr className="whitespace-nowrap bg-blue-700 text-white">
//                                     <th className="border p-2"></th>
//                                     <th className="border p-2">Orders</th>
//                                     <th className="border p-2">Cash</th>
//                                     <th className="border p-2">Card</th>
//                                     <th className="border p-2">UPI</th>
//                                     <th className="border p-2">Cash Rs.</th>
//                                     <th className="border p-2">Card Rs.</th>
//                                     <th className="border p-2">UPI Rs.</th>
//                                     <th className="border p-2">Total Rs.</th>
//                                     <th className="border p-2">Advance Rs.</th>
//                                     <th className="border p-2">Remaining Balance Rs.</th>
//                                     <th className="border p-2">Commission Rs.</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 <tr className="whitespace-nowrap text-center">
//                                     <td className="border p-2">Totals</td>
//                                     <td className="border p-2">{totalJobCards || 0}</td>
//                                     <td className="border p-2">{transactionSummary?.CASH?.count || 0}</td>
//                                     <td className="border p-2">{transactionSummary?.CARD?.count || 0}</td>
//                                     <td className="border p-2">{transactionSummary?.UPI?.count || 0}</td>
//                                     <td className="border p-2">{transactionSummary?.CASH?.totalAmount || 0}</td>
//                                     <td className="border p-2">{transactionSummary?.CARD?.totalAmount || 0}</td>
//                                     <td className="border p-2">{transactionSummary?.UPI?.totalAmount || 0}</td>

//                                     <td className="border p-2">{(transactionSummary?.CASH?.totalAmount + transactionSummary?.CARD?.totalAmount + transactionSummary?.UPI?.totalAmount) || 0}</td>
//                                     <td className="border p-2">{totalAdvance || 0}</td>
//                                     <td className="border p-2">{totalBalance || 0}</td>
//                                     <td className="border p-2">{totalCommission || 0}</td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>

//                 </div>

//                 {/* ================= DELIVERED STATISTICS ================= */}
//                 <SectionHeader title="Delivered Statistics" />

//                 <div className="bg-white rounded-xl shadow p-6">
//                     <h2 className="text-lg font-semibold mb-4">Delivered Orders</h2>
//                     {/* <TablePlaceholder /> */}
//                     <div className="overflow-x-auto">
//                         <table className="min-w-max w-full border-collapse">
//                             <thead className="bg-gray-100">
//                                 {deliveredTable.getHeaderGroups()?.map((hg) => (
//                                     <tr key={hg.id}>
//                                         {hg.headers.map((h) => (
//                                             <th key={h.id} className="px-3 py-2 border text-sm bg-blue-700 text-white w-auto whitespace-nowrap">
//                                                 {flexRender(h.column.columnDef.header, h.getContext())}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </thead>

//                             <tbody>
//                                 {deliveredTable.getRowModel().rows.length === 0 && (
//                                     <tr>
//                                         <td colSpan={bookingTableColumns.length} className="text-center py-1">
//                                             No job card found
//                                         </td>
//                                     </tr>
//                                 )}

//                                 {deliveredTable.getRowModel().rows.map((row) => (
//                                     <tr key={row.id} className="hover:bg-gray-50 text-center">
//                                         {row.getVisibleCells().map((cell) => (
//                                             <td key={cell.id} className="px-3 border text-sm w-auto whitespace-nowrap">
//                                                 {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
//                                             </td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* Delivered Summary Cards */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                     <StatCard title="Total Delivered" value={deliveredCount || 0} />
//                     <StatCard title="Total Balance Received" value={"₹" + deliveredJcBalanceReceived || 0} />
//                     <StatCard title="Total Amount" value={"₹" + deliveredTotalSum || 0} />
//                     <StatCard title="Total Commission" value={"₹" + afterDeliveryCommission || 0} />
//                 </div>

//                 {/* ================= COMMISSION ================= */}
//                 <SectionHeader title="Commission Statistics" />


//                 <div className="bg-white rounded-xl shadow p-6">

//                     <h2 className="text-lg font-semibold mb-4">Commission Orders</h2>
//                     {/* <TablePlaceholder /> */}
//                     <div className="overflow-x-auto">
//                         <table className="min-w-max w-full border-collapse">
//                             <thead className="bg-gray-100">
//                                 {deliveredCommissionTable.getHeaderGroups()?.map((hg) => (
//                                     <tr key={hg.id}>
//                                         {hg.headers.map((h) => (
//                                             <th key={h.id} className="px-3 py-2 border text-sm bg-blue-700 text-white w-auto whitespace-nowrap">
//                                                 {flexRender(h.column.columnDef.header, h.getContext())}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </thead>

//                             <tbody>
//                                 {deliveredCommissionTable.getRowModel().rows.length === 0 && (
//                                     <tr>
//                                         <td colSpan={bookingTableColumns.length} className="text-center py-1">
//                                             No commission data found
//                                         </td>
//                                     </tr>
//                                 )}

//                                 {deliveredCommissionTable.getRowModel().rows.map((row) => (
//                                     <tr key={row.id} className="hover:bg-gray-50 text-center">
//                                         {row.getVisibleCells().map((cell) => (
//                                             <td key={cell.id} className="px-3 border text-sm w-auto whitespace-nowrap">
//                                                 {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
//                                             </td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>


//                 {/* ================= GST REPORT ================= */}
//                 {/* <SectionHeader title="Download GST Reports" /> */}


//                 {/* <div className="bg-white rounded-xl shadow p-6">

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <input type="date" className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" />
//                         <input type="date" className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400 outline-none" />
//                         <button className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2 transition">
//                             Generate
//                         </button>
//                     </div>
//                 </div> */}


//                 {/* ================= DOWNLOAD COMPLETE DATA ================= */}
//                 {/* <div className="bg-white rounded-xl shadow p-6">

//                     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//                         <h2 className="text-lg font-semibold">
//                             Download Complete Data
//                         </h2>

//                         <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition">
//                             Download
//                         </button>
//                     </div>
//                 </div> */}

//             </div>
//         </div >
//     );
// }

// /* ================= REUSABLE COMPONENTS ================= */

// const SectionHeader = ({ title }) => (
//     <div>
//         <h2 className="text-xl font-bold text-gray-800">{title}</h2>
//         <p className="text-sm text-gray-500">Summary</p>
//     </div>
// );


// const TablePlaceholder = () => (
//     <div className="overflow-x-auto">
//         <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
//             Table Data Here
//         </div>
//     </div>
// );

// const StatCard = ({ title, value }) => (
//     <div className="bg-white rounded-xl shadow p-6 text-center hover:shadow-md transition">
//         <div className="text-2xl font-bold text-orange-600">{value}</div>
//         <div className="text-sm text-gray-500 mt-2">{title}</div>
//     </div>
// );






// import { useState } from "react";
// import { toast } from "react-toastify";
// import {
//     useReactTable, getCoreRowModel, getPaginationRowModel,
//     getFilteredRowModel, flexRender
// } from "@tanstack/react-table";
// import api from "../../utils/api";
// import { useMemo } from "react";
// import { useDispatch } from "react-redux";
// import { hideLoader, showLoader } from "../../features/loader/loaderSlice";

// /* ─── Icon helpers (inline SVGs so no extra dep) ─────────────────────────── */
// const Icon = {
//     Search: () => (
//         <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//             <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
//         </svg>
//     ),
//     Calendar: () => (
//         <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//             <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
//         </svg>
//     ),
//     TrendUp: () => (
//         <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//             <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
//         </svg>
//     ),
//     Package: () => (
//         <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
//         </svg>
//     ),
//     Award: () => (
//         <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//             <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
//         </svg>
//     ),
//     ChevronDown: () => (
//         <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//             <polyline points="6 9 12 15 18 9" />
//         </svg>
//     ),
// };

// /* ─── Shared style tokens ────────────────────────────────────────────────── */
// const S = {
//     card: "bg-white rounded-2xl border border-gray-100 shadow-sm",
//     label: "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5",
//     input: "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder-gray-300",
//     thBase: "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border-b border-gray-100",
//     td: "px-4 py-3 text-sm text-gray-700 whitespace-nowrap border-b border-gray-50",
// };

// /* ─── Section header ─────────────────────────────────────────────────────── */
// const SectionHeader = ({ title, icon: Ic, count }) => (
//     <div className="flex items-center gap-3 mb-4">
//         <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
//             <Ic />
//         </div>
//         <div>
//             <h2 className="text-base font-bold text-gray-800 leading-none">{title}</h2>
//             {count !== undefined && (
//                 <p className="text-[11px] text-gray-400 mt-0.5">{count} records</p>
//             )}
//         </div>
//     </div>
// );

// /* ─── Stat card ──────────────────────────────────────────────────────────── */
// const StatCard = ({ title, value, accent = false }) => (
//     <div className={`rounded-2xl border p-5 flex flex-col gap-1 transition-shadow hover:shadow-md ${accent
//         ? "bg-orange-500 border-orange-400 text-white"
//         : "bg-white border-gray-100 shadow-sm"
//         }`}>
//         <span className={`text-[10px] font-bold uppercase tracking-widest ${accent ? "text-orange-100" : "text-gray-400"}`}>
//             {title}
//         </span>
//         <span className={`text-2xl font-black leading-none mt-1 ${accent ? "text-white" : "text-gray-800"}`}>
//             {value}
//         </span>
//     </div>
// );

// /* ─── Summary row card ───────────────────────────────────────────────────── */
// const SummaryItem = ({ label, value }) => (
//     <div className="flex flex-col gap-0.5 px-4 py-3 border-r border-gray-100 last:border-r-0">
//         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
//         <span className="text-sm font-bold text-gray-800">{value ?? 0}</span>
//     </div>
// );

// /* ─── Reusable DataTable ─────────────────────────────────────────────────── */
// function DataTable({ table, columns, emptyText = "No data found" }) {
//     const rows = table.getRowModel().rows;
//     return (
//         <div className="overflow-x-auto rounded-xl border border-gray-100">
//             <table className="min-w-max w-full border-collapse">
//                 <thead>
//                     {table.getHeaderGroups().map((hg) => (
//                         <tr key={hg.id} className="bg-gray-50">
//                             {hg.headers.map((h, i) => (
//                                 <th key={h.id} className={`${S.thBase} ${i === 0 ? "rounded-tl-xl" : ""} ${i === hg.headers.length - 1 ? "rounded-tr-xl" : ""} text-gray-500`}>
//                                     {flexRender(h.column.columnDef.header, h.getContext())}
//                                 </th>
//                             ))}
//                         </tr>
//                     ))}
//                 </thead>
//                 <tbody>
//                     {rows.length === 0 ? (
//                         <tr>
//                             <td colSpan={columns.length} className="text-center py-10 text-sm text-gray-400">
//                                 {emptyText}
//                             </td>
//                         </tr>
//                     ) : (
//                         rows.map((row, ri) => (
//                             <tr key={row.id} className={`hover:bg-orange-50/40 transition-colors ${ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
//                                 {row.getVisibleCells().map((cell) => (
//                                     <td key={cell.id} className={S.td}>
//                                         {flexRender(
//                                             cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey,
//                                             cell.getContext()
//                                         )}
//                                     </td>
//                                 ))}
//                             </tr>
//                         ))
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

// /* ══════════════════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════ */
// export default function MainReport() {

//     const [fromDate, setFromDate] = useState("");
//     const [toDate, setToDate] = useState("");
//     const [jobCards, setJobCards] = useState([]);
//     const [deliveredJC, setDeliveredJC] = useState([]);
//     const [commissionByDelivered, setCommissionByDelivered] = useState([]);
//     const [totalJobCards, setTotalJobCards] = useState(0);
//     const [deliveredCount, setDeliveredCount] = useState(0);
//     const [totalAdvance, setTotalAdvance] = useState(0);
//     const [totalBalance, setTotalBalance] = useState(0);
//     const [deliveredTotalSum, setDeliveredTotalSum] = useState(0);
//     const [deliveredJcBalanceReceived, setDeliveredJcBalanceReceived] = useState(0);
//     const [transactionSummary, setTransactionSummary] = useState([]);
//     const [totalCommission, setTotalCommission] = useState(0);
//     const [afterDeliveryCommission, setAfterDeliveryCommission] = useState(0);
//     const [searched, setSearched] = useState(false);
//     const dispatch = useDispatch();

//     const fetchMainReport = async () => {
//         if (!fromDate || !toDate) return toast.error("Please select date range");
//         if (toDate < fromDate) return toast.error("Please enter valid date range");
//         try {
//             dispatch(showLoader());
//             const res = await api.post("/jc/report/main", { startDate: fromDate, endDate: toDate });
//             if (res.data?.success) {
//                 const r = res.data;
//                 setJobCards(r.jobCards || []);
//                 setDeliveredJC(r.deliveredJobCards || []);
//                 setTotalAdvance(r.totalAdvance || 0);
//                 setTotalBalance(r.totalBalance || 0);
//                 setTotalJobCards(r.totalJobCards || 0);
//                 setDeliveredTotalSum(r.deliveredTotalSum || 0);
//                 setDeliveredJcBalanceReceived(r.deliveredJcBalanceReceived || 0);
//                 setTransactionSummary(r.transactionSummary || {});
//                 setDeliveredCount(r.deliveredCount || 0);
//                 setTotalCommission(r.totalCommissionCreated || 0);
//                 setAfterDeliveryCommission(r.totalCommissionDelivered || 0);
//                 setCommissionByDelivered(r.commissionByDelivered || []);
//                 setSearched(true);
//             }
//         } catch (err) {
//             console.error(err);
//             toast.error("Failed to fetch report");
//         } finally {
//             dispatch(hideLoader());
//         }
//     };

//     const fmt = (v) => v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

//     /* ── Status badge ── */
//     const StatusBadge = ({ value }) => {
//         const map = {
//             Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
//             Delivered: "bg-blue-50 text-blue-700 border-blue-200",
//             Draft: "bg-gray-100 text-gray-600 border-gray-200",
//             "In-process": "bg-amber-50 text-amber-700 border-amber-200",
//         };
//         return (
//             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[value] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
//                 {value || "—"}
//             </span>
//         );
//     };

//     const bookingTableColumns = useMemo(() => [
//         { header: "Date", accessorKey: "createdAt", cell: ({ getValue }) => fmt(getValue()) },
//         { header: "Customer", accessorKey: "name" },
//         { header: "Mobile", accessorKey: "mobile" },
//         { header: "Delivery Date", accessorKey: "deliveryDate", cell: ({ getValue }) => fmt(getValue()) },
//         { header: "Transaction", accessorKey: "transactionType" },
//         { header: "Total ₹", accessorKey: "total" },
//         { header: "Advance ₹", accessorKey: "advance" },
//         { header: "Balance ₹", accessorKey: "balance" },
//         { header: "Status", accessorKey: "status", cell: ({ getValue }) => <StatusBadge value={getValue()} /> },
//         { header: "Process", accessorKey: "pstatus", cell: ({ getValue }) => <StatusBadge value={getValue()} /> },
//     ], []);

//     const deliveredTableColumns = useMemo(() => [
//         { header: "Date", accessorKey: "createdAt", cell: ({ getValue }) => fmt(getValue()) },
//         { header: "Customer", accessorKey: "name" },
//         { header: "Mobile", accessorKey: "mobile" },
//         { header: "Delivered", accessorKey: "deliveredDate", cell: ({ getValue }) => fmt(getValue()) },
//         { header: "Transaction", accessorKey: "transactionType" },
//         { header: "Total ₹", accessorKey: "total" },
//         { header: "Advance ₹", accessorKey: "advance" },
//         { header: "Balance ₹", accessorKey: "balance" },
//         { header: "Status", accessorKey: "status", cell: ({ getValue }) => <StatusBadge value={getValue()} /> },
//         { header: "Process", accessorKey: "pstatus", cell: ({ getValue }) => <StatusBadge value={getValue()} /> },
//     ], []);

//     const commissionColumns = useMemo(() => [
//         { header: "Employee", accessorKey: "bookedByName" },
//         { header: "Total Commission ₹", accessorKey: "totalCommission" },
//         { header: "Total Orders", accessorKey: "count" },
//     ], []);

//     const bookingTable = useReactTable({ data: jobCards, columns: bookingTableColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel() });
//     const deliveredTable = useReactTable({ data: deliveredJC, columns: deliveredTableColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel() });
//     const commissionTable = useReactTable({ data: commissionByDelivered, columns: commissionColumns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel() });

//     const bookingTotal = (transactionSummary?.CASH?.totalAmount || 0) + (transactionSummary?.CARD?.totalAmount || 0) + (transactionSummary?.UPI?.totalAmount || 0);

//     return (
//         <div className="min-h-screen bg-gray-50/70 p-6 space-y-6">

//             {/* ── Page title ── */}
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-2xl font-black text-gray-900 tracking-tight">Main Report</h1>
//                     <p className="text-xs text-gray-400 mt-0.5">Booking · Delivery · Commission Overview</p>
//                 </div>
//                 {searched && (
//                     <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full uppercase tracking-widest">
//                         {fromDate} → {toDate}
//                     </span>
//                 )}
//             </div>

//             {/* ── Filter card ── */}
//             <div className={`${S.card} p-5`}>
//                 <p className={S.label}>
//                     <span className="flex items-center gap-1.5">
//                         <Icon.Calendar /> Date Range
//                     </span>
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
//                     <div>
//                         <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">From</label>
//                         <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={S.input} />
//                     </div>
//                     <div>
//                         <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">To</label>
//                         <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={S.input} />
//                     </div>
//                     <div className="flex items-end">
//                         <button
//                             onClick={fetchMainReport}
//                             className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-sm rounded-xl py-2.5 transition-all shadow-sm shadow-orange-200"
//                         >
//                             <Icon.Search />
//                             Generate Report
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* ══ BOOKING SECTION ══════════════════════════════════════════════ */}
//             <div className={`${S.card} p-6`}>
//                 <SectionHeader title="Booking Statistics" icon={Icon.TrendUp} count={jobCards.length} />

//                 {/* Quick summary bar */}
//                 <div className="flex flex-wrap rounded-xl border border-gray-100 bg-gray-50 mb-5 overflow-hidden">
//                     <SummaryItem label="Total Orders" value={totalJobCards} />
//                     <SummaryItem label="Cash Orders" value={transactionSummary?.CASH?.count ?? 0} />
//                     <SummaryItem label="Card Orders" value={transactionSummary?.CARD?.count ?? 0} />
//                     <SummaryItem label="UPI Orders" value={transactionSummary?.UPI?.count ?? 0} />
//                     <SummaryItem label="Cash ₹" value={`₹${transactionSummary?.CASH?.totalAmount ?? 0}`} />
//                     <SummaryItem label="Card ₹" value={`₹${transactionSummary?.CARD?.totalAmount ?? 0}`} />
//                     <SummaryItem label="UPI ₹" value={`₹${transactionSummary?.UPI?.totalAmount ?? 0}`} />
//                     <SummaryItem label="Total ₹" value={`₹${bookingTotal}`} />
//                     <SummaryItem label="Advance ₹" value={`₹${totalAdvance}`} />
//                     <SummaryItem label="Balance ₹" value={`₹${totalBalance}`} />
//                     <SummaryItem label="Commission ₹" value={`₹${totalCommission}`} />
//                 </div>

//                 <DataTable table={bookingTable} columns={bookingTableColumns} emptyText="No job cards found for selected range" />
//             </div>

//             {/* ══ DELIVERED SECTION ════════════════════════════════════════════ */}
//             <div className={`${S.card} p-6`}>
//                 <SectionHeader title="Delivered Statistics" icon={Icon.Package} count={deliveredJC.length} />

//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
//                     <StatCard title="Total Delivered" value={deliveredCount} />
//                     <StatCard title="Balance Received" value={`₹${deliveredJcBalanceReceived}`} />
//                     <StatCard title="Total Amount" value={`₹${deliveredTotalSum}`} />
//                     <StatCard title="Commission" value={`₹${afterDeliveryCommission}`} accent />
//                 </div>

//                 <DataTable table={deliveredTable} columns={deliveredTableColumns} emptyText="No delivered job cards found" />
//             </div>

//             {/* ══ COMMISSION SECTION ═══════════════════════════════════════════ */}
//             <div className={`${S.card} p-6`}>
//                 <SectionHeader title="Commission Statistics" icon={Icon.Award} count={commissionByDelivered.length} />
//                 <DataTable table={commissionTable} columns={commissionColumns} emptyText="No commission data found" />
//             </div>

//         </div>
//     );
// }














import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
    useReactTable, getCoreRowModel,
    getFilteredRowModel, flexRender
} from "@tanstack/react-table";
import api from "../../utils/api";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../features/loader/loaderSlice";

/* ─── Date helpers ──────────────────────────────────────────────────────── */
const today = () => new Date().toISOString().split("T")[0];
const firstOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
};

const PRESETS = [
    { label: "Today", fn: () => ({ startDate: today(), endDate: today() }) },
    { label: "This Month", fn: () => ({ startDate: firstOfMonth(), endDate: today() }) },
    {
        label: "Last 7 Days", fn: () => {
            const d = new Date(); d.setDate(d.getDate() - 6);
            return { startDate: d.toISOString().split("T")[0], endDate: today() };
        }
    },
    {
        label: "Last 30 Days", fn: () => {
            const d = new Date(); d.setDate(d.getDate() - 29);
            return { startDate: d.toISOString().split("T")[0], endDate: today() };
        }
    },
];

/* ─── Inline SVG icons ──────────────────────────────────────────────────── */
const Ico = {
    Booking: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" /></svg>,
    Delivered: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12l5 5L20 7" /></svg>,
    Commission: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>,
    Calendar: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>,
    Refresh: () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
};

/* ─── Status badge ──────────────────────────────────────────────────────── */
const Badge = ({ v }) => {
    const cfg = {
        Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        Delivered: "bg-sky-50 text-sky-700 ring-sky-200",
        Draft: "bg-gray-100 text-gray-500 ring-gray-200",
        "In-process": "bg-amber-50 text-amber-700 ring-amber-200",
        Pending: "bg-rose-50 text-rose-700 ring-rose-200",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ring-1 ${cfg[v] || "bg-gray-100 text-gray-500 ring-gray-200"}`}>
            {v || "—"}
        </span>
    );
};

/* ─── Metric card ───────────────────────────────────────────────────────── */
const MetricCard = ({ label, value, sub, highlight }) => (
    <div className={`relative rounded-2xl p-5 overflow-hidden border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg
        ${highlight
            ? "bg-white border-gray-100 shadow-sm"
            : "bg-white border-gray-100 shadow-sm"
        }`}>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-400`}>{label}</p>
        <p className={`text-xl font-black leading-none text-gray-800`}>{value ?? 0}</p>
        {sub && <p className={`text-[11px] mt-1.5 text-gray-400`}>{sub}</p>}
    </div>
);

/* ─── Transaction pill ──────────────────────────────────────────────────── */
const TxnPill = ({ label, count, amount, color }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${color}`}>
        <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
            <p className="text-base font-black text-gray-800 mt-0.5">{count ?? 0} orders</p>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-gray-400 font-semibold">Amount</p>
            <p className="text-sm font-bold text-gray-700">&#8377;{amount ?? 0}</p>
        </div>
    </div>
);

/* ─── Section wrapper ───────────────────────────────────────────────────── */
const Section = ({ icon: Ic, title, badge, children }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center">
                    <Ic />
                </span>
                <span className="text-sm font-bold text-gray-800">{title}</span>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

/* ─── Data table ────────────────────────────────────────────────────────── */
const DataTable = ({ table, colCount, empty = "No data found" }) => {
    const rows = table.getRowModel().rows;
    return (
        // <div className="overflow-x-auto rounded-xl border border-gray-100">
        <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-xl border border-gray-100">
            <table className="min-w-max w-full border-collapse text-sm">
                {/* <thead> */}
                <thead className="sticky top-0 z-20 bg-gray-50">
                    {table.getHeaderGroups().map(hg => (
                        <tr key={hg.id} className="bg-gray-50/80">
                            {hg.headers.map(h => (
                                <th key={h.id} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 whitespace-nowrap">
                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={colCount} className="text-center py-12 text-sm text-gray-300 font-medium">
                                {empty}
                            </td>
                        </tr>
                    ) : rows.map((row, i) => (
                        <tr key={row.id} className={`hover:bg-orange-50/30 transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : "bg-white"}`}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-4 py-3 text-gray-700 whitespace-nowrap border-b border-gray-50/80">
                                    {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function MainReport() {
    const dispatch = useDispatch();

    /* ── Date state ── */
    const [activePreset, setActivePreset] = useState(0); // "Today" by default
    const [fromDate, setFromDate] = useState(() => today());
    const [toDate, setToDate] = useState(() => today());

    /* ── Data state ── */
    const [jobCards, setJobCards] = useState([]);
    const [deliveredJC, setDeliveredJC] = useState([]);
    const [commissionByDelivered, setCommissionByDelivered] = useState([]);
    const [totalJobCards, setTotalJobCards] = useState(0);
    const [deliveredCount, setDeliveredCount] = useState(0);
    const [totalAdvance, setTotalAdvance] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);
    const [deliveredTotalSum, setDeliveredTotalSum] = useState(0);
    const [deliveredJcBalanceReceived, setDeliveredJcBalanceReceived] = useState(0);
    const [transactionSummary, setTransactionSummary] = useState({});
    const [totalCommission, setTotalCommission] = useState(0);
    const [afterDeliveryCommission, setAfterDeliveryCommission] = useState(0);
    const [fetched, setFetched] = useState(false);

    /* ── Apply preset ── */
    const applyPreset = (idx) => {
        setActivePreset(idx);
        const { startDate, endDate } = PRESETS[idx].fn();
        setFromDate(startDate);
        setToDate(endDate);
        return { startDate, endDate };
    };

    /* ── Fetch ── */
    const fetchReport = useCallback(async (start, end) => {
        if (!start || !end) return toast.error("Please select date range");
        if (end < start) return toast.error("Invalid date range");
        try {
            dispatch(showLoader());
            const res = await api.post("/jc/report/main", { startDate: start, endDate: end });
            if (res.data?.success) {
                const r = res.data;
                setJobCards(r.jobCards || []);
                setDeliveredJC(r.deliveredJobCards || []);
                setTotalAdvance(r.totalAdvance || 0);
                setTotalBalance(r.totalBalance || 0);
                setTotalJobCards(r.totalJobCards || 0);
                setDeliveredTotalSum(r.deliveredTotalSum || 0);
                setDeliveredJcBalanceReceived(r.deliveredJcBalanceReceived || 0);
                setTransactionSummary(r.transactionSummary || {});
                setDeliveredCount(r.deliveredCount || 0);
                setTotalCommission(r.totalCommissionCreated || 0);
                setAfterDeliveryCommission(r.totalCommissionDelivered || 0);
                setCommissionByDelivered(r.commissionByDelivered || []);
                setFetched(true);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch report");
        } finally {
            dispatch(hideLoader());
        }
    }, [dispatch]);

    /* ── Auto-fetch Today on mount ── */
    useEffect(() => {
        const { startDate, endDate } = PRESETS[0].fn();
        fetchReport(startDate, endDate);
    }, []);

    /* ── Date formatting ── */
    const fmt = (v) => v ? new Date(v).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true
    }) : "—";

    /* ── Columns ── */
    const bookingCols = useMemo(() => [
        { header: "Date", accessorKey: "createdAt", cell: ({ getValue }) => <span className="text-gray-500 text-xs">{fmt(getValue())}</span> },
        { header: "Customer", accessorKey: "name", cell: ({ getValue }) => <span className="font-semibold text-gray-800">{getValue() || "—"}</span> },
        { header: "Mobile", accessorKey: "mobile" },
        { header: "Delivery Date", accessorKey: "deliveryDate", cell: ({ getValue }) => <span className="text-gray-500 text-xs">{fmt(getValue())}</span> },
        {
            header: "Txn", accessorKey: "transactionType",
            cell: ({ getValue }) => <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{getValue() || "—"}</span>
        },
        { header: "Total", accessorKey: "total", cell: ({ getValue }) => <span className="font-bold text-gray-800">&#8377;{getValue() ?? 0}</span> },
        { header: "Advance", accessorKey: "advance" },
        {
            header: "Balance", accessorKey: "balance",
            cell: ({ getValue }) => <span className={`font-semibold ${Number(getValue()) > 0 ? "text-rose-600" : "text-emerald-600"}`}>&#8377;{getValue() ?? 0}</span>
        },
        { header: "Status", accessorKey: "status", cell: ({ getValue }) => <Badge v={getValue()} /> },
        { header: "Process", accessorKey: "pstatus", cell: ({ getValue }) => <Badge v={getValue()} /> },
    ], []);

    const deliveredCols = useMemo(() => [
        { header: "Date", accessorKey: "createdAt", cell: ({ getValue }) => <span className="text-gray-500 text-xs">{fmt(getValue())}</span> },
        { header: "Customer", accessorKey: "name", cell: ({ getValue }) => <span className="font-semibold text-gray-800">{getValue() || "—"}</span> },
        { header: "Mobile", accessorKey: "mobile" },
        { header: "Delivered", accessorKey: "deliveredDate", cell: ({ getValue }) => <span className="text-gray-500 text-xs">{fmt(getValue())}</span> },
        {
            header: "Txn", accessorKey: "transactionType",
            cell: ({ getValue }) => <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{getValue() || "—"}</span>
        },
        { header: "Total", accessorKey: "total", cell: ({ getValue }) => <span className="font-bold text-gray-800">&#8377;{getValue() ?? 0}</span> },
        { header: "Advance", accessorKey: "advance" },
        {
            header: "Balance", accessorKey: "balance",
            cell: ({ getValue }) => <span className={`font-semibold ${Number(getValue()) > 0 ? "text-rose-600" : "text-emerald-600"}`}>&#8377;{getValue() ?? 0}</span>
        },
        { header: "Status", accessorKey: "status", cell: ({ getValue }) => <Badge v={getValue()} /> },
        { header: "Process", accessorKey: "pstatus", cell: ({ getValue }) => <Badge v={getValue()} /> },
    ], []);

    const commissionCols = useMemo(() => [
        { header: "Employee", accessorKey: "bookedByName", cell: ({ getValue }) => <span className="font-semibold text-gray-800">{getValue() || "—"}</span> },
        { header: "Commission", accessorKey: "totalCommission", cell: ({ getValue }) => <span className="font-bold text-orange-600">&#8377;{getValue() ?? 0}</span> },
        { header: "Orders", accessorKey: "count", cell: ({ getValue }) => <span className="font-bold text-gray-700">{getValue() ?? 0}</span> },
    ], []);

    const bookingTable = useReactTable({ data: jobCards, columns: bookingCols, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel() });
    const deliveredTable = useReactTable({ data: deliveredJC, columns: deliveredCols, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel() });
    const commissionTable = useReactTable({ data: commissionByDelivered, columns: commissionCols, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel() });

    const bookingTotal = (transactionSummary?.CASH?.totalAmount || 0)
        + (transactionSummary?.CARD?.totalAmount || 0)
        + (transactionSummary?.UPI?.totalAmount || 0);

    const rangeLabel = activePreset !== null ? PRESETS[activePreset].label : `${fromDate} → ${toDate}`;

    return (
        <div className="min-h-screen bg-[#f7f8fa] p-5 space-y-5">

            {/* ══ FILTER BAR ══════════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">

                    {/* Preset pills */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                            <Ico.Calendar /> Quick Select
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {PRESETS.map((p, i) => (
                                <button
                                    key={p.label}
                                    onClick={() => {
                                        const { startDate, endDate } = applyPreset(i);
                                    }}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer
                                        ${activePreset === i
                                            ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200"
                                            : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom date range */}
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">From</p>
                            <input
                                type="date" value={fromDate}
                                onChange={e => { setFromDate(e.target.value); setActivePreset(null); }}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                            />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">To</p>
                            <input
                                type="date" value={toDate}
                                onChange={e => { setToDate(e.target.value); setActivePreset(null); }}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => fetchReport(fromDate, toDate)}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-orange-200 cursor-pointer whitespace-nowrap"
                        >
                            <Ico.Refresh /> Generate
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ BOOKING ══════════════════════════════════════════════════════ */}
            <Section icon={Ico.Booking} title="Booking Statistics" badge={jobCards.length}>
                {/* Transaction breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    <TxnPill label="Cash" count={transactionSummary?.CASH?.count} amount={transactionSummary?.CASH?.totalAmount} color="bg-emerald-50/60 border-emerald-100" />
                    <TxnPill label="UPI" count={transactionSummary?.UPI?.count} amount={transactionSummary?.UPI?.totalAmount} color="bg-sky-50/60 border-sky-100" />
                    <TxnPill label="Card" count={transactionSummary?.CARD?.count} amount={transactionSummary?.CARD?.totalAmount} color="bg-violet-50/60 border-violet-100" />
                </div>

                {/* Summary metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <MetricCard label="Total Orders" value={totalJobCards} />
                    <MetricCard label="Total Amount" value={`${bookingTotal}`} />
                    <MetricCard label="Total Advance" value={`${totalAdvance}`} />
                </div>

                <DataTable table={bookingTable} colCount={bookingCols.length} empty="No job cards found for selected range" />
            </Section>

            {/* ══ DELIVERED ════════════════════════════════════════════════════ */}
            <Section icon={Ico.Delivered} title="Delivered Statistics" badge={deliveredJC.length}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <MetricCard label="Total Delivered" value={deliveredCount} />
                    <MetricCard label="Balance Received" value={`${deliveredJcBalanceReceived}`} />
                    <MetricCard label="Total Amount" value={`${deliveredTotalSum}`} />
                    <MetricCard label="Commission" value={`${afterDeliveryCommission}`} highlight />
                </div>
                <DataTable table={deliveredTable} colCount={deliveredCols.length} empty="No delivered orders in this range" />
            </Section>

            {/* ══ COMMISSION ═══════════════════════════════════════════════════ */}
            <Section icon={Ico.Commission} title="Commission Statistics" badge={commissionByDelivered.length}>
                <DataTable table={commissionTable} colCount={commissionCols.length} empty="No commission data found" />
            </Section>

        </div>
    );
}