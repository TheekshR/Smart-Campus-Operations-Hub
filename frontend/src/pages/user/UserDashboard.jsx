import { useEffect, useMemo, useState } from "react";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
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
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 3 }}>{error}</Box>;
  }

  return (
    <Box>
      <PageHeader
        title="User Dashboard"
        subtitle="Lecturers and staff can browse resources, request bookings, and track requests here."
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StatCard title="My Active Bookings" value={activeBookings} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="My Open Tickets" value={openTickets} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Unread Notifications" value={unreadNotifications.length} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        

        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                My Insights
              </Typography>
              <Typography sx={{ mb: 1 }}>
                Total bookings: <strong>{insights.totalBookings}</strong>
              </Typography>
              <Typography sx={{ mb: 1 }}>
                Most used resource: <strong>{insights.mostUsedResource}</strong>
              </Typography>
              
              <Typography>
                Preferred booking time: <strong>{insights.preferredTime}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}