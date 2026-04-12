import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function UserDashboard() {
  const { currentUser, loading, error } = useCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.id) return;

      try {
        const [bookingsRes, issuesRes, notificationsRes, resourcesRes] = await Promise.all([
          api.get(`/api/bookings/user/${currentUser.id}`),
          api.get(`/api/issues/user/${currentUser.id}`),
          api.get("/api/notifications/me/unread"),
          api.get("/api/resources"),
        ]);

        setBookings(bookingsRes.data || []);
        setIssues(issuesRes.data || []);
        setUnreadNotifications(notificationsRes.data || []);
        setResources(resourcesRes.data || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const activeBookings = bookings.filter(
    (booking) => booking.status === "APPROVED" || booking.status === "PENDING"
  ).length;

  const openTickets = issues.filter(
    (issue) => issue.status !== "FIXED"
  ).length;

  const resourceMap = useMemo(() => {
    const map = {};
    resources.forEach((resource) => {
      map[resource.id] = resource.name;
    });
    return map;
  }, [resources]);

  const insights = useMemo(() => {
    const totalBookings = bookings.length;

    const resourceCounts = {};
    bookings.forEach((booking) => {
      resourceCounts[booking.resourceId] = (resourceCounts[booking.resourceId] || 0) + 1;
    });

    let mostUsedResourceId = null;
    let maxResourceCount = 0;
    Object.entries(resourceCounts).forEach(([resourceId, count]) => {
      if (count > maxResourceCount) {
        maxResourceCount = count;
        mostUsedResourceId = resourceId;
      }
    });

    const hourCounts = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
    };

    bookings.forEach((booking) => {
      const hour = Number((booking.startTime || "00:00").split(":")[0]);
      if (hour < 12) hourCounts.Morning += 1;
      else if (hour < 17) hourCounts.Afternoon += 1;
      else hourCounts.Evening += 1;
    });

    let preferredTime = "No history";
    let maxTimeCount = 0;
    Object.entries(hourCounts).forEach(([slot, count]) => {
      if (count > maxTimeCount) {
        maxTimeCount = count;
        preferredTime = slot;
      }
    });

    return {
      totalBookings,
      mostUsedResource:
        mostUsedResourceId ? resourceMap[mostUsedResourceId] || mostUsedResourceId : "No bookings yet",
      preferredTime,
    };
  }, [bookings, resourceMap]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6">{error}</div>;
  }

  return (
    <div>
      <PageHeader
        title="User Dashboard"
        subtitle="Lecturers and staff can browse resources, request bookings, and track requests here."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard title="My Active Bookings" value={activeBookings} />
        <StatCard title="My Open Tickets" value={openTickets} />
        <StatCard title="Unread Notifications" value={unreadNotifications.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>My Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                Total bookings: <strong>{insights.totalBookings}</strong>
              </p>
              <p>
                Most used resource: <strong>{insights.mostUsedResource}</strong>
              </p>
              <p>
                Preferred booking time: <strong>{insights.preferredTime}</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
