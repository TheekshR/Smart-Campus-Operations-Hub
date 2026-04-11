import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Eye,
  CalendarPlus,
  CalendarCheck,
  AlertTriangle,
  Ticket,
  Bell,
  Settings,
  Users,
  ClipboardList,
  CalendarRange,
  ListChecks,
  UserCog,
  PlayCircle,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const iconMap = {
  Dashboard: LayoutDashboard,
  "View Resources": Eye,
  "Book Resource": CalendarPlus,
  "My Bookings": CalendarCheck,
  "Report Incident": AlertTriangle,
  "My Tickets": Ticket,
  Notifications: Bell,
  "Manage Resources": Settings,
  "Manage Users": Users,
  "Booking Requests": ClipboardList,
  "All Bookings": CalendarRange,
  "All Issues": ListChecks,
  "Assign Technician": UserCog,
  "Assigned Tickets": Ticket,
  "In Progress Tickets": PlayCircle,
  "Resolved Tickets": CheckCircle2,
};

const menuByRole = {
  user: [
    { label: "Dashboard", path: "/user/dashboard" },
    { label: "View Resources", path: "/user/resources" },
    { label: "Book Resource", path: "/user/book-resource" },
    { label: "My Bookings", path: "/user/my-bookings" },
    { label: "Report Incident", path: "/user/report-incident" },
    { label: "My Tickets", path: "/user/my-tickets" },
    { label: "Notifications", path: "/user/notifications" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Manage Resources", path: "/admin/resources" },
    { label: "Manage Users", path: "/admin/manage-users" },
    { label: "Booking Requests", path: "/admin/booking-requests" },
    { label: "All Bookings", path: "/admin/all-bookings" },
    { label: "All Issues", path: "/admin/all-issues" },
    { label: "Assign Technician", path: "/admin/assign-technician" },
    { label: "Notifications", path: "/admin/notifications" },
  ],
  technician: [
    { label: "Dashboard", path: "/technician/dashboard" },
    { label: "Assigned Tickets", path: "/technician/assigned-tickets" },
    { label: "In Progress Tickets", path: "/technician/in-progress-tickets" },
    { label: "Resolved Tickets", path: "/technician/resolved-tickets" },
    { label: "Notifications", path: "/technician/notifications" },
  ],
};

export default function Sidebar({ role = "user", collapsed = false, onToggle }) {
  const location = useLocation();
  const links = menuByRole[role] || [];

  return (
    <aside
      className={cn(
        "min-h-screen flex flex-col border-r bg-card transition-all duration-300 relative",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div className={cn("px-4 py-5 flex items-center border-b gap-3", collapsed ? "justify-center" : "")}>
        <div className="w-9 h-9 rounded-lg overflow-hidden shadow-md shrink-0">
          <img src="/logo.png" alt="Campus Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-widest text-foreground leading-tight">CAMPUS SYNC</h1>
            <span className="text-[11px] text-muted-foreground capitalize">{role} portal</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = iconMap[link.label] || LayoutDashboard;

          return (
            <Link
              key={link.path}
              to={link.path}
              title={collapsed ? link.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md text-sm font-medium transition-colors h-10",
                collapsed ? "justify-center px-2" : "px-3",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <div className="px-2 py-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn("w-full", collapsed ? "justify-center" : "justify-start gap-2")}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
