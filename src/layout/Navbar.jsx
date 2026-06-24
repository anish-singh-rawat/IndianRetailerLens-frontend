import { useState } from "react";
import { FaBars, FaBell, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { logout } from "../features/auth/authSlice";
import { clearEmployees } from "../features/employees/employeeSlice";
import { clearSettings } from "../features/settings/settingSlice";
import { PiBrainFill } from "react-icons/pi";
import { FaCog } from "react-icons/fa";

const PAGE_TITLES = {
  "/":                   "Dashboard",
  "/stores":             "Stores",
  "/stores/create":      "Create Store",
  "/customer/add":       "Add New Customer",
  "/customers/list":     "Customer List",
  "/expense/add":        "Add Expense",
  "/expense/list":       "Expenses List",
  "/new-jc":             "New Job Card",
  "/inventory":          "Inventory",
  "/report/main":        "Main Report",
  "/report/daily":       "Daily Report",
  "/vendor/add":         "Add Vendor",
  "/vendors/list":       "Vendor List",
  "/vendors/order":      "Vendor Orders",
  "/jc/list":            "Job Card List",
  "/prescription/add":   "Add Prescription",
  "/prescription/list":  "Prescription List",
  "/sales/add":          "Add Sales",
  "/sales/list":         "Sales List",
  "/addtask":            "Add Task",
  "/task/list":          "Task List",
  "/edit/jc":            "Edit Job Card",
  "/add/repair":         "Add Repair",
  "/repair/list":        "Repair List",
  "/add/asset":          "Add Asset",
  "/asset/list":         "Asset List",
  "/digi/ai":            "Digi AI",
  "/link/whatsapp":      "Link WhatsApp",
  "/whats/new/media":    "What's New",
  "/store/settings":     "Store Settings",
};

function getBreadcrumbs(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "Dashboard", path: "/" }];
  return [
    { label: "Home", path: "/" },
    ...parts.map((part, i) => ({
      label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
      path: "/" + parts.slice(0, i + 1).join("/"),
    })),
  ];
}

export default function Navbar({ toggleSidebar }) {
  const { pathname }              = useLocation();
  const pageTitle                 = PAGE_TITLES[pathname] || "Admin Panel";
  const { user, store }           = useSelector((state) => state.auth);
  const breadcrumbs               = getBreadcrumbs(pathname);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AU";

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      background: "oklch(0.21 0.04 240)",
      color: "oklch(0.98 0.008 210)",
    });
    if (result.isConfirmed) {
      dispatch(logout());
      dispatch(clearEmployees());
      dispatch(clearSettings());
      navigate("/login", { replace: true });
      toast.success("Logged out successfully", { duration: 20 });
    }
  };

  return (
    <div className="sticky top-0 z-40 px-4 pt-3 pb-1" style={{ background: "var(--background)" }}>
      <header
        className="h-14 rounded-2xl flex items-center justify-between px-4 gap-4"
        style={{
          background: "color-mix(in oklab, var(--card) 65%, transparent)",
          backdropFilter: "blur(20px) saturate(160%)",
          border: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
          boxShadow: "0 0 0 1px color-mix(in oklab, var(--primary) 15%, transparent), 0 4px 24px -4px color-mix(in oklab, var(--primary) 20%, transparent)",
        }}
      >
        {/* LEFT: Title + Breadcrumb */}
        <div className="min-w-0">
          <h1
            className="text-sm font-bold leading-tight truncate"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--foreground)" }}
          >
            {pageTitle}
          </h1>
          <nav className="hidden sm:flex items-center gap-1 mt-0.5">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.path} className="flex items-center gap-1">
                {i > 0 && (
                  <span className="text-[10px]" style={{ color: "color-mix(in oklab, var(--primary) 40%, transparent)" }}>/</span>
                )}
                <span
                  className="text-[11px] leading-none transition-colors"
                  style={{
                    color: i === breadcrumbs.length - 1
                      ? "var(--primary-glow)"
                      : "var(--muted-foreground)",
                    fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
                  }}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1">

          {/* AI button */}
          {store !== undefined && store?.hasAI && (
            <button
              onClick={() => navigate("/digi/ai")}
              className="flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
              style={{
                color: "var(--primary-glow)",
                background: "color-mix(in oklab, var(--primary) 15%, transparent)",
                border: "1px solid color-mix(in oklab, var(--primary) 25%, transparent)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "color-mix(in oklab, var(--primary) 25%, transparent)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "color-mix(in oklab, var(--primary) 15%, transparent)"; }}
            >
              <PiBrainFill className="text-sm" />
              <span>AI</span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all relative"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "color-mix(in oklab, var(--foreground) 8%, transparent)";
                e.currentTarget.style.color = "var(--primary-glow)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--muted-foreground)";
              }}
            >
              <FaBell className="text-sm" />
            </button>

            {notifOpen && (
              <div
                className="absolute right-0 top-10 w-72 rounded-2xl overflow-hidden z-50"
                style={{
                  background: "color-mix(in oklab, var(--card) 90%, transparent)",
                  backdropFilter: "blur(20px) saturate(160%)",
                  border: "1px solid color-mix(in oklab, var(--foreground) 12%, transparent)",
                  boxShadow: "0 20px 60px -20px color-mix(in oklab, var(--primary) 40%, transparent)",
                }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: "1px solid color-mix(in oklab, var(--foreground) 8%, transparent)" }}
                >
                  <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>Notifications</span>
                  <span className="text-[10px] font-medium cursor-pointer hover:underline" style={{ color: "var(--primary-glow)" }}>
                    Mark all read
                  </span>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No new notifications</p>
                </div>
                <div
                  className="px-4 py-2.5 text-center"
                  style={{ borderTop: "1px solid color-mix(in oklab, var(--foreground) 8%, transparent)" }}
                >
                  <span className="text-[11px] font-medium cursor-pointer hover:underline" style={{ color: "var(--primary-glow)" }}>
                    View all
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <span
            className="w-px h-5 mx-1"
            style={{ background: "color-mix(in oklab, var(--foreground) 12%, transparent)" }}
          />

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-xl transition-all duration-200"
              onMouseEnter={e => { e.currentTarget.style.background = "color-mix(in oklab, var(--foreground) 6%, transparent)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)" }}
              >
                <span className="text-[9px] font-bold" style={{ color: "var(--primary-foreground)" }}>
                  {initials}
                </span>
              </div>
              <span
                className="hidden sm:block text-xs font-medium max-w-[80px] truncate"
                style={{ color: "var(--foreground)" }}
              >
                {user?.name || "Admin"}
              </span>
              <FaChevronDown
                className={`text-[9px] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                style={{ color: "var(--muted-foreground)" }}
              />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-10 w-48 rounded-2xl overflow-hidden z-50"
                style={{
                  background: "color-mix(in oklab, var(--card) 90%, transparent)",
                  backdropFilter: "blur(20px) saturate(160%)",
                  border: "1px solid color-mix(in oklab, var(--foreground) 12%, transparent)",
                  boxShadow: "0 20px 60px -20px color-mix(in oklab, var(--primary) 40%, transparent)",
                }}
              >
                <div
                  className="px-4 py-3"
                  style={{ borderBottom: "1px solid color-mix(in oklab, var(--foreground) 8%, transparent)" }}
                >
                  <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>
                    {user?.email || "admin@example.com"}
                  </p>
                </div>

                {user?.role === "ADMIN" && (
                  <div className="py-1">
                    <button
                      onClick={() => navigate("/store/settings")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-all"
                      style={{ color: "var(--muted-foreground)" }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "color-mix(in oklab, var(--foreground) 6%, transparent)";
                        e.currentTarget.style.color = "var(--foreground)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "var(--muted-foreground)";
                      }}
                    >
                      <FaCog className="text-sm" />
                      <span>Settings</span>
                    </button>
                  </div>
                )}

                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors"
                    style={{ color: "var(--destructive)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "color-mix(in oklab, var(--destructive) 10%, transparent)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <FaSignOutAlt className="text-sm" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ml-1"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "color-mix(in oklab, var(--foreground) 8%, transparent)";
              e.currentTarget.style.color = "var(--primary-glow)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--muted-foreground)";
            }}
            aria-label="Toggle sidebar"
          >
            <FaBars className="text-base" />
          </button>
        </div>
      </header>

      {/* Click-away overlay */}
      {(dropdownOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setDropdownOpen(false); setNotifOpen(false); }}
        />
      )}
    </div>
  );
}
