import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader title="Notifications" subtitle="View booking and ticket updates." />

      {message && (
        <Alert variant="destructive" className="mb-4">
          {message}
        </Alert>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id}>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold">{n.title}</h3>
              <p className="text-muted-foreground mb-2">{n.message}</p>
              <p className="text-sm mb-3">Type: {n.type} | Read: {n.read ? "Yes" : "No"}</p>
              <div className="flex gap-2">
                {!n.read && (
                  <Button variant="outline" size="sm" onClick={() => handleMarkRead(n.id)}>
                    Mark as Read
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleDelete(n.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
