import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";

const CURRENT_USER_ID = "USER001";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/api/bookings/user/${CURRENT_USER_ID}`);
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    try {
      await api.put(`/api/bookings/${bookingId}/cancel`, null, {
        params: {
          reason: "Cancelled by user",
          admin: "USER",
        },
      });
      setMessage("Booking cancelled successfully.");
      fetchBookings();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      setMessage("Failed to cancel booking.");
    }
  };

  return (
    <Box>
      <PageHeader
        title="My Bookings"
        subtitle="View your booking requests and their current status."
      />

      {message && (
        <Alert severity={message.includes("successfully") ? "success" : "error"} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {bookings.map((booking) => (
          <Grid item xs={12} md={6} lg={4} key={booking.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  Booking #{booking.id?.slice(-6)}
                </Typography>
                <Typography sx={{ mt: 1 }}>Resource ID: {booking.resourceId}</Typography>
                <Typography>Date: {booking.date}</Typography>
                <Typography>
                  Time: {booking.startTime} - {booking.endTime}
                </Typography>
                <Typography>Purpose: {booking.purpose}</Typography>
                <Typography>Attendees: {booking.attendees}</Typography>
                <Typography>Status: {booking.status}</Typography>
                <Typography>
                  Review Reason: {booking.reviewReason || "-"}
                </Typography>
                <Typography>
                  Approved By: {booking.approvedBy || "-"}
                </Typography>

                {(booking.status === "PENDING" || booking.status === "APPROVED") && (
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ mt: 2 }}
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel Booking
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}