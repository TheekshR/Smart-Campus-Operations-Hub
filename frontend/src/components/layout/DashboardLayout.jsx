import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ChatWidget from "../common/ChatWidget";

export default function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar role={role} collapsed={!sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex-1 min-w-0">
        <Topbar role={role} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} sidebarOpen={sidebarOpen} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      {role === "user" && <ChatWidget />}
    </div>
  );
}
