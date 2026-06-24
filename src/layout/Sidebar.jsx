import { useState, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard, Store, Plus, Briefcase, List, UserPlus, Users, Truck,
  FileText, ShoppingCart, Receipt, Package, BarChart3, LogOut, ChevronDown,
  Megaphone, ClipboardList, MessageCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { logout } from "../features/auth/authSlice";
import { clearEmployees } from "../features/employees/employeeSlice";
import { clearSettings } from "../features/settings/settingSlice";

const LOGO_IMG = "https://digibysr.com/wp-content/uploads/2025/01/DigiOptics.png";

export default function AppSidebar({ sidebarOpen, userRole = "ADMIN" }) {
  const [openGroups, setOpenGroups] = useState({});
  const navigate   = useNavigate();
  const location   = useLocation();
  const dispatch   = useDispatch();
  const user       = useSelector((state) => state.auth.user);

  const allowedPages = user?.pages || [];
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const hasAccess    = (page) => allowedPages.includes(page);

  const toggleGroup = (label) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

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

  /* ── Super Admin groups ── */
  const superAdminGroups = [
    {
      label: "Stores",
      icon: <Store className="h-4 w-4" />,
      items: [
        { to: "/stores",        label: "Stores List",  icon: <List className="h-4 w-4" /> },
        { to: "/stores/create", label: "Create Store", icon: <Plus className="h-4 w-4" /> },
      ],
    },
  ];

  /* ── Store groups ── */
  const storeGroups = useMemo(
    () =>
      [
        {
          label: "Job Cards",
          icon: <Briefcase className="h-4 w-4" />,
          items: [
            hasAccess("NEW JOB CARDS")  && { to: "/new-jc",  label: "New Job Card",  icon: <Plus className="h-4 w-4" /> },
            hasAccess("JOB CARDS LIST") && { to: "/jc/list", label: "Job Card List", icon: <List className="h-4 w-4" /> },
          ].filter(Boolean),
        },
        {
          label: "Customers",
          icon: <Users className="h-4 w-4" />,
          items: [
            hasAccess("ADD CUSTOMERS")  && { to: "/customer/add",   label: "Add Customer",  icon: <UserPlus className="h-4 w-4" /> },
            hasAccess("CUSTOMERS LIST") && { to: "/customers/list", label: "Customer List", icon: <List className="h-4 w-4" /> },
          ].filter(Boolean),
        },
        {
          label: "Vendors",
          icon: <Truck className="h-4 w-4" />,
          items: [
            hasAccess("ADD VENDORS")   && { to: "/vendor/add",    label: "Add Vendor",    icon: <Plus className="h-4 w-4" /> },
            hasAccess("VENDORS LIST")  && { to: "/vendors/list",  label: "Vendor List",   icon: <List className="h-4 w-4" /> },
            hasAccess("VENDOR ORDERS") && { to: "/vendors/order", label: "Vendor Orders", icon: <List className="h-4 w-4" /> },
          ].filter(Boolean),
        },
        {
          label: "Sales",
          icon: <ShoppingCart className="h-4 w-4" />,
          items: [
            hasAccess("ADD SALES")  && { to: "/sales/add",  label: "Add Sales",  icon: <Plus className="h-4 w-4" /> },
            hasAccess("SALES LIST") && { to: "/sales/list", label: "Sales List", icon: <List className="h-4 w-4" /> },
          ].filter(Boolean),
        },
        {
          label: "Expenses",
          icon: <Receipt className="h-4 w-4" />,
          items: [
            hasAccess("ADD EXPENSES")  && { to: "/expense/add",  label: "Add Expense",    icon: <Plus className="h-4 w-4" /> },
            hasAccess("EXPENSES LIST") && { to: "/expense/list", label: "Expenses List",  icon: <List className="h-4 w-4" /> },
          ].filter(Boolean),
        },
        {
          label: "Prescription",
          icon: <FileText className="h-4 w-4" />,
          items: [
            hasAccess("ADD PRESCRIPTION")   && { to: "/prescription/add",  label: "Add Prescription",  icon: <Plus className="h-4 w-4" /> },
            hasAccess("PRESCRIPTIONS LIST") && { to: "/prescription/list", label: "Prescription List", icon: <List className="h-4 w-4" /> },
          ].filter(Boolean),
        },
        {
          label: "Report",
          icon: <BarChart3 className="h-4 w-4" />,
          items: [
            hasAccess("MAIN REPORTS")  && { to: "/report/main",  label: "Main Report",  icon: <BarChart3 className="h-4 w-4" /> },
            hasAccess("DAILY REPORTS") && { to: "/report/daily", label: "Daily Report", icon: <List className="h-4 w-4" /> },
          ].filter(Boolean),
        },
        {
          label: "Task",
          icon: <ClipboardList className="h-4 w-4" />,
          items: [
            hasAccess("ADD TASK")  && { to: "/addtask",   label: "Add Task",  icon: <Plus className="h-4 w-4" /> },
            hasAccess("TASK LIST") && { to: "/task/list", label: "Task List", icon: <List className="h-4 w-4" /> },
          ].filter(Boolean),
        },
        {
          label: "Repair",
          icon: <ClipboardList className="h-4 w-4" />,
          items: [
            hasAccess("ADD REPAIR")   && { to: "/add/repair",   label: "Add Repair",   icon: <Plus className="h-4 w-4" /> },
            hasAccess("REPAIR LIST")  && { to: "/repair/list",  label: "Repair List",  icon: <List className="h-4 w-4" /> },
          ].filter(Boolean),
        },
        {
          label: "Assets",
          icon: <ClipboardList className="h-4 w-4" />,
          items: [
            hasAccess("ADD ASSETS")  && { to: "/add/asset",  label: "Add Asset",   icon: <Plus className="h-4 w-4" /> },
            hasAccess("ASSETS LIST") && { to: "/asset/list", label: "Assets List", icon: <List className="h-4 w-4" /> },
          ].filter(Boolean),
        },
      ].filter((g) => g.items.length > 0),
    [allowedPages]
  );

  const bottomItems = [
    hasAccess("INVENTORY") && { to: "/inventory",        label: "Inventory",    icon: <Package className="h-4 w-4" /> },
    hasAccess("USERS")     && { to: "/user",             label: "Users",        icon: <Users className="h-4 w-4" /> },
    { to: "/link/whatsapp",  label: "Link WhatsApp",    icon: <MessageCircle className="h-4 w-4" /> },
    { to: "/whats/new/media", label: "What's New",      icon: <Megaphone className="h-4 w-4" /> },
  ].filter(Boolean);

  const groups = isSuperAdmin ? superAdminGroups : storeGroups;

  return (
    <aside
      className={`
        fixed lg:relative top-0 left-0 z-50 h-screen
        flex flex-col
        transition-all duration-300 ease-in-out
        sidebar-scroll overflow-hidden
        ${sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-0"}
      `}
      style={{
        background: "color-mix(in oklab, var(--card) 75%, transparent)",
        backdropFilter: "blur(28px) saturate(180%)",
        borderRight: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
      }}
    >
      {/* ── Logo ── */}
      <div
        className="shrink-0 flex items-center justify-center px-5 py-4"
        style={{ borderBottom: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)" }}
      >
        <img src={LOGO_IMG} alt="Indian Lens Wholesale" className="h-7 object-contain" />
      </div>

      {/* ── Scrollable nav ── */}
      <nav className="flex-1 min-h-0 overflow-y-auto sidebar-scroll px-2.5 pb-3 pt-2 space-y-0.5">

        {/* Dashboard */}
        {!isSuperAdmin && hasAccess("DASHBOARD") && (
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "text-[var(--primary-foreground)] shadow-sm"
                  : "hover:text-[var(--foreground)]"
              }`
            }
            style={({ isActive }) => isActive ? {
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)",
              color: "var(--primary-foreground)",
            } : {
              color: "var(--muted-foreground)",
            }}
          >
            {({ isActive }) => (
              <>
                <span
                  className="p-1 rounded-lg transition-all"
                  style={isActive
                    ? { background: "oklch(1 0 0 / 20%)" }
                    : { background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }
                  }
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                </span>
                Dashboard
              </>
            )}
          </NavLink>
        )}

        {/* Groups */}
        {groups.map((group) => {
          const isActiveGroup = group.items.some((item) => location.pathname.startsWith(item.to));
          const isOpen = openGroups[group.label] ?? isActiveGroup;

          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                style={isActiveGroup ? {
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)",
                  color: "var(--primary-foreground)",
                } : {
                  color: "var(--muted-foreground)",
                }}
                onMouseEnter={e => { if (!isActiveGroup) e.currentTarget.style.background = "color-mix(in oklab, var(--foreground) 6%, transparent)"; }}
                onMouseLeave={e => { if (!isActiveGroup) e.currentTarget.style.background = "transparent"; }}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="p-1 rounded-lg transition-all"
                    style={isActiveGroup
                      ? { background: "oklch(1 0 0 / 20%)" }
                      : { background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }
                    }
                  >
                    {group.icon}
                  </span>
                  {group.label}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 opacity-60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div
                  className="submenu-enter ml-3 pl-3 mt-0.5 mb-1 space-y-0.5"
                  style={{ borderLeft: "2px solid color-mix(in oklab, var(--primary) 30%, transparent)" }}
                >
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                      style={({ isActive }) => isActive ? {
                        background: "color-mix(in oklab, var(--primary) 18%, transparent)",
                        color: "var(--primary-glow)",
                      } : {
                        color: "var(--muted-foreground)",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "color-mix(in oklab, var(--foreground) 6%, transparent)"; }}
                      onMouseLeave={e => {
                        const isActive = location.pathname === item.to;
                        e.currentTarget.style.background = isActive
                          ? "color-mix(in oklab, var(--primary) 18%, transparent)"
                          : "transparent";
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <span style={{ opacity: isActive ? 1 : 0.5 }}>{item.icon}</span>
                          {item.label}
                          {isActive && (
                            <span
                              className="ml-auto w-1.5 h-1.5 rounded-full"
                              style={{ background: "var(--primary-glow)" }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom items */}
        {!isSuperAdmin && bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            style={({ isActive }) => isActive ? {
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)",
              color: "var(--primary-foreground)",
            } : {
              color: "var(--muted-foreground)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "color-mix(in oklab, var(--foreground) 6%, transparent)"; }}
            onMouseLeave={e => {
              const isActive = location.pathname === item.to;
              e.currentTarget.style.background = isActive
                ? "linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)"
                : "transparent";
            }}
          >
            {({ isActive }) => (
              <>
                <span
                  className="p-1 rounded-lg transition-all"
                  style={isActive
                    ? { background: "oklch(1 0 0 / 20%)" }
                    : { background: "color-mix(in oklab, var(--foreground) 8%, transparent)" }
                  }
                >
                  {item.icon}
                </span>
                {item.label}

                {/* What's New badge */}
                {item.to === "/whats/new/media" && !isActive && (
                  <span className="ml-auto flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ background: "var(--primary-glow)" }}
                      />
                      <span
                        className="relative inline-flex rounded-full h-2 w-2"
                        style={{ background: "var(--primary)" }}
                      />
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        color: "var(--primary-glow)",
                        background: "color-mix(in oklab, var(--primary) 18%, transparent)",
                        border: "1px solid color-mix(in oklab, var(--primary) 30%, transparent)",
                      }}
                    >
                      NEW
                    </span>
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Logout ── */}
      <div
        className="shrink-0 px-2.5 py-3"
        style={{ borderTop: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)" }}
      >
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group"
          style={{ color: "var(--destructive)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "color-mix(in oklab, var(--destructive) 10%, transparent)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <span
            className="p-1 rounded-lg transition-all"
            style={{ background: "color-mix(in oklab, var(--destructive) 12%, transparent)" }}
          >
            <LogOut className="h-3.5 w-3.5" />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}
