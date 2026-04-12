import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function AdminNotificationsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try { const res = await api.get("/api/notifications/me"); setNotifications(res.data || []); } catch (err) { console.error("Failed to fetch notifications:", err); }
  };

  useEffect(() => { if (currentUser) fetchNotifications(); }, [currentUser]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader title="Notifications" subtitle="View system alerts and updates." />
      <Card>
        <CardContent className="pt-6">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground">No notifications available.</p>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <div key={n.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                  </div>
                  <Badge variant={n.read ? "secondary" : "default"}>{n.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
