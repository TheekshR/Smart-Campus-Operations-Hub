import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function AdminNotificationsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications/me");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 3 }}>{error}</Box>;
  }

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="View system alerts and updates."
      />

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          {notifications.length === 0 ? (
            <Typography>No notifications available.</Typography>
          ) : (
            <List>
              {notifications.map((n) => (
                <ListItem key={n.id} divider>
                  <ListItemText
                    primary={n.title}
                    secondary={n.message}
                  />
                  <Chip
                    label={n.type}
                    color={n.read ? "default" : "primary"}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}