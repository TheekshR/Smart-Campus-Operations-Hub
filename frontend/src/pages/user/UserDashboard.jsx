import { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import api from "../../api/axios";

const CURRENT_USER_ID = "USER001";

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get(`/api/bookings/user/${CURRENT_USER_ID}`);
        setBookings(response.data);
      } catch (error) {
        console.error("Failed to fetch user bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  const activeBookings = bookings.filter(
    (booking) => booking.status === "APPROVED" || booking.status === "PENDING"
  ).length;

  const openTickets = 0;
  const unreadNotifications = 0;

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
          <StatCard title="Unread Notifications" value={unreadNotifications} />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Welcome
          </Typography>
          <Typography color="text.secondary">
            Use the left menu to browse resources, submit booking requests,
            track your bookings, and manage future tickets and notifications.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}