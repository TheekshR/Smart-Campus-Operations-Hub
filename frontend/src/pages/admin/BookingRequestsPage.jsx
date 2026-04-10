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

export default function BookingRequestsPage() {
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
    } catch (err) {
      console.error("Failed to fetch pending bookings:", err);
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
    } catch (err) {
      console.error("Failed to approve booking:", err);
      setMessage("Failed to approve booking.");
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
    } catch (err) {
      console.error("Failed to reject booking:", err);
      setMessage("Failed to reject booking.");
    }
  };

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>;
  if (error) return <Box sx={{ p: 3 }}>{error}</Box>;

  return (
    <Box sx={{ p: { xs: 3, md: 5 }, bgcolor: "#ffffff", minHeight: "100vh" }}>
      <PageHeader
        title="Booking Requests"
        subtitle="Review and process pending booking requests."
      />

      {message && (
        <Alert
          severity={message.includes("successfully") ? "success" : "error"}
          sx={{ mb: 4, borderRadius: 2 }}
        >
          {message}
        </Alert>
      )}

      <Grid container spacing={4}>
        {bookings.map((booking) => {
          const resource = resourceMap[booking.resourceId];

          return (
            <Grid item xs={12} md={6} lg={4} key={booking.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 12px 35px rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                <CardContent sx={{ p: 3.5 }}>
                  <Typography variant="h6" fontWeight="700" sx={{ color: "#000000", mb: 2.5 }}>
                    Request #{booking.id?.slice(-6)}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4, mb: 4 }}>
                    <Typography sx={{ color: "#555555", fontSize: "0.97rem" }}>
                      Resource: <strong>{resource ? resource.name : booking.resourceId}</strong>
                    </Typography>
                    <Typography sx={{ color: "#555555", fontSize: "0.97rem" }}>
                      Location: <strong>{resource ? resource.location : "-"}</strong>
                    </Typography>
                    <Typography sx={{ color: "#555555", fontSize: "0.97rem" }}>
                      User ID: <strong>{booking.userId}</strong>
                    </Typography>
                    <Typography sx={{ color: "#555555", fontSize: "0.97rem" }}>
                      Date: <strong>{booking.date}</strong>
                    </Typography>
                    <Typography sx={{ color: "#555555", fontSize: "0.97rem" }}>
                      Time: <strong>{booking.startTime} — {booking.endTime}</strong>
                    </Typography>
                    <Typography sx={{ color: "#555555", fontSize: "0.97rem" }}>
                      Purpose: <strong>{booking.purpose}</strong>
                    </Typography>
                    <Typography sx={{ color: "#555555", fontSize: "0.97rem" }}>
                      Attendees: <strong>{booking.attendees}</strong>
                    </Typography>
                    <Typography sx={{ color: "#555555", fontSize: "0.97rem" }}>
                      Status: <strong>{booking.status}</strong>
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => handleApprove(booking.id)}
                      sx={{
                        flex: 1,
                        bgcolor: "#000000",
                        color: "#ffffff",
                        py: 1.3,
                        borderRadius: 2,
                        fontWeight: 600,
                        "&:hover": { bgcolor: "#222222" },
                      }}
                    >
                      APPROVE
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => openRejectDialog(booking.id)}
                      sx={{
                        flex: 1,
                        borderColor: "#d32f2f",
                        color: "#d32f2f",
                        py: 1.3,
                        borderRadius: 2,
                        fontWeight: 600,
                        "&:hover": {
                          bgcolor: "#fff5f5",
                          borderColor: "#d32f2f",
                        },
                      }}
                    >
                      REJECT
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.35rem" }}>
          Reject Booking Request
        </DialogTitle>

        <DialogContent sx={{ mt: 1, pb: 3 }}>
          <TextField
            fullWidth
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            multiline
            minRows={4}
            placeholder="Enter reason for rejection..."
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeRejectDialog} sx={{ color: "#666666", fontWeight: 500 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={!rejectReason.trim()}
            sx={{
              px: 4,
              bgcolor: "#d32f2f",
              "&:hover": { bgcolor: "#b71c1c" },
            }}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}