import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.id) return;

      try {
        const [bookingsRes, issuesRes, notificationsRes] = await Promise.all([
          api.get(`/api/bookings/user/${currentUser.id}`),
          api.get(`/api/issues/user/${currentUser.id}`),
          api.get("/api/notifications/me/unread"),
        ]);

        setBookings(bookingsRes.data);
        setIssues(issuesRes.data);
        setUnreadNotifications(notificationsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 3 }}>{error}</Box>;
  }

  const activeBookings = bookings.filter(
    (booking) => booking.status === "APPROVED" || booking.status === "PENDING"
  ).length;

  const openTickets = issues.filter(
    (issue) => issue.status !== "FIXED"
  ).length;

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

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Welcome, {currentUser?.name}
          </Typography>
          <Typography color="text.secondary">
            Use the left menu to browse resources, submit booking requests,
            track your bookings, manage tickets, and view notifications.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}