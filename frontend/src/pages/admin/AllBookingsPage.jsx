import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function AllBookingsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [resourceMap, setResourceMap] = useState({});
  const [message, setMessage] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPendingBookings = async () => {
    try {
      const [bookingsRes, resourcesRes] = await Promise.all([
        api.get("/api/bookings/status/PENDING"),
        api.get("/api/resources"),
      ]);

      setBookings(bookingsRes.data || []);

      const map = {};
      (resourcesRes.data || []).forEach((resource) => {
        map[resource.id] = resource;
      });
      setResourceMap(map);
    } catch (error) {
      console.error("Failed to fetch pending bookings:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchPendingBookings();
    }
  }, [currentUser]);

  const handleApprove = async (bookingId) => {
    try {
      await api.put(`/api/bookings/${bookingId}/approve`, null, {
        params: { admin: currentUser?.name || "ADMIN" },
      });
      setMessage("Booking approved successfully.");
      fetchPendingBookings();
    } catch (error) {
      console.error("Failed to approve booking:", error);
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to approve booking."
      );
    }
  };

  const openRejectDialog = (bookingId) => {
    setSelectedBookingId(bookingId);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    setSelectedBookingId(null);
    setRejectReason("");
  };

  const handleReject = async () => {
    try {
      await api.put(`/api/bookings/${selectedBookingId}/reject`, null, {
        params: {
          reason: rejectReason,
          admin: currentUser?.name || "ADMIN",
        },
      });
      setMessage("Booking rejected successfully.");
      closeRejectDialog();
      fetchPendingBookings();
    } catch (error) {
      console.error("Failed to reject booking:", error);
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to reject booking."
      );
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
      <PageHeader
        title="Booking Requests"
        subtitle="Review and process pending booking requests."
      />

      {message && (
        <Alert
          severity={message.includes("successfully") ? "success" : "error"}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {bookings.map((booking) => {
          const resource = resourceMap[booking.resourceId];

          return (
            <Grid item xs={12} md={6} lg={4} key={booking.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    Request #{booking.id?.slice(-6)}
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    Resource: {resource ? resource.name : booking.resourceId}
                  </Typography>
                  <Typography>
                    Location: {resource ? resource.location : "-"}
                  </Typography>
                  <Typography>User ID: {booking.userId}</Typography>
                  <Typography>Date: {booking.date}</Typography>
                  <Typography>
                    Time: {booking.startTime} - {booking.endTime}
                  </Typography>
                  <Typography>Purpose: {booking.purpose}</Typography>
                  <Typography>Attendees: {booking.attendees}</Typography>
                  <Typography>Status: {booking.status}</Typography>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(booking.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => openRejectDialog(booking.id)}
                    >
                      Reject
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={rejectDialogOpen}
        onClose={closeRejectDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reject Booking</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRejectDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={!rejectReason.trim()}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}