import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Bell, Circle, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";
import ProfileDialog from "../common/ProfileDialog";

export default function Topbar({ role = "user", onToggleSidebar, sidebarOpen }) {
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const titleMap = {
    user: "User Portal",
    admin: "Admin Portal",
    technician: "Technician Portal",
  };

  const notificationRouteMap = {
    user: "/user/notifications",
    admin: "/admin/notifications",
    technician: "/technician/notifications",
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const latestNotifications = useMemo(
    () => notifications.slice(0, 5),
    [notifications]
  );

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications/me");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    setProfileUser(currentUser);
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleBellClick = () => setMenuOpen(!menuOpen);

  const handleViewAll = () => {
    setMenuOpen(false);
    navigate(notificationRouteMap[role] || "/user/notifications");
  };

  const handleOpenNotification = async (notification) => {
    try {
      if (!notification.read) {
        await api.put(`/api/notifications/${notification.id}/read`);
      }
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }

    setMenuOpen(false);
    navigate(notificationRouteMap[role] || "/user/notifications");
  };

  const confirmLogout = () => {
    window.location.href = "http://localhost:8081/logout";
  };

  return (
    <>
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-8 w-8">
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
          <h2 className="text-lg font-semibold">
            {titleMap[role] || "Smart Campus"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-[360px] bg-background border rounded-lg shadow-lg z-50">
                <div className="px-4 py-3 border-b">
                  <p className="font-bold">Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} unread
                  </p>
                </div>

                {latestNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground">
                    No notifications available.
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto">
                    {latestNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleOpenNotification(notification)}
                        className="w-full text-left px-4 py-3 hover:bg-muted flex items-start gap-2 border-b last:border-b-0"
                      >
                        <span className="mt-1.5">
                          {!notification.read && (
                            <Circle className="h-2.5 w-2.5 fill-blue-500 text-blue-500" />
                          )}
                        </span>
                        <div>
                          <p
                            className={`text-sm ${
                              notification.read ? "font-medium" : "font-bold"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleViewAll}
                  >
                    View All Notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Profile button */}
          {currentUser && (
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 rounded-full px-3 py-1 hover:bg-muted transition-colors"
            >
              <span className="text-sm">
                {currentUser.name} ({currentUser.role})
              </span>
              <Avatar
                src={currentUser.picture}
                alt={currentUser.name}
                className="h-8 w-8"
              />
            </button>
          )}

          {/* Logout button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setLogoutDialogOpen(true)}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Profile dialog */}
      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={profileUser}
        onProfileUpdated={(u) => setProfileUser(u)}
      />

      {/* Logout confirmation dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout from the system?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
