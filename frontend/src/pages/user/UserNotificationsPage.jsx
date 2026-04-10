import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function UserNotificationsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/api/notifications/me");
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
      setMessage("Failed to mark notification as read.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setMessage("Failed to delete notification.");
    }
  };

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 3 }}>{error}</Box>;
  }

  return (
    <Box>
      <PageHeader title="Notifications" subtitle="View booking and ticket updates." />

      {message && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Stack spacing={2}>
        {notifications.map((notification) => (
          <Card key={notification.id} sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6">{notification.title}</Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {notification.message}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Type: {notification.type} | Read: {notification.read ? "Yes" : "No"}
              </Typography>

              <Stack direction="row" spacing={2}>
                {!notification.read && (
                  <Button variant="outlined" onClick={() => handleMarkRead(notification.id)}>
                    Mark as Read
                  </Button>
                )}
                <Button color="error" variant="outlined" onClick={() => handleDelete(notification.id)}>
                  Delete
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}