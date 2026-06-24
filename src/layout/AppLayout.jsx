import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role || "";

  return (
    <div className="dark flex min-h-screen overflow-x-hidden" style={{ background: "var(--background)" }}>

      {/* Sidebar – full height */}
      <Sidebar sidebarOpen={sidebarOpen} userRole={userRole} />

      {/* Right Side (Navbar + Page Content) */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Navbar */}
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 p-4 overflow-auto" style={{ color: "var(--foreground)" }}>
          <Outlet />
        </main>

      </div>
    </div>
  );
}
