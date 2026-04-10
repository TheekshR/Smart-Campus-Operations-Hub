import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CircleIcon from "@mui/icons-material/Circle";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function Topbar({ role = "user" }) {
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);

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

  const open = Boolean(anchorEl);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const latestNotifications = useMemo(() => {
    return notifications.slice(0, 5);
  }, [notifications]);

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

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleBellClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleViewAll = () => {
    handleCloseMenu();
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

    handleCloseMenu();
    navigate(notificationRouteMap[role] || "/user/notifications");
  };

  const handleLogout = () => {
    window.location.href = "http://localhost:8081/logout";
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "white",
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="600">
          {titleMap[role] || "Smart Campus"}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={handleBellClick}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            PaperProps={{
              sx: {
                width: 360,
                maxWidth: "90vw",
                mt: 1,
                borderRadius: 2,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="700">
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount} unread
              </Typography>
            </Box>

            <Divider />

            {latestNotifications.length === 0 ? (
              <Box sx={{ px: 2, py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications available.
                </Typography>
              </Box>
            ) : (
              latestNotifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleOpenNotification(notification)}
                  sx={{
                    alignItems: "flex-start",
                    py: 1.5,
                    whiteSpace: "normal",
                  }}
                >
                  <Box sx={{ mr: 1, mt: 0.5 }}>
                    {!notification.read && (
                      <CircleIcon sx={{ fontSize: 10, color: "#1976d2" }} />
                    )}
                  </Box>

                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                    primaryTypographyProps={{
                      fontWeight: notification.read ? 500 : 700,
                      fontSize: 14,
                    }}
                    secondaryTypographyProps={{
                      fontSize: 12,
                    }}
                  />
                </MenuItem>
              ))
            )}

            <Divider />

            <Box sx={{ p: 1.5 }}>
              <Button fullWidth variant="outlined" onClick={handleViewAll}>
                View All Notifications
              </Button>
            </Box>
          </Menu>

          {currentUser && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="body2">
                {currentUser.name} ({currentUser.role})
              </Typography>
              <Avatar src={currentUser.picture} alt={currentUser.name} />
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}