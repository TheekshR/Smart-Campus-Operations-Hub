// initiate MyBookingsPage.jsx
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function MyBookingsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  const fetchBookings = async (userId) => {
    try {
      const response = await api.get(`/api/bookings/user/${userId}`);
      setBookings(response.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchBookings(currentUser.id);
    }
  }, [currentUser]);

  // Handle booking cancellation
  const handleCancel = async (bookingId) => {
    try {
      await api.put(`/api/bookings/${bookingId}/cancel`, null, {
        params: {
          reason: "Cancelled by user",
          admin: currentUser?.name || "USER",
        },
      });
      setMessage("Booking cancelled successfully.");
      fetchBookings(currentUser.id);
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setMessage("Failed to cancel booking.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader
        title="My Bookings"
        subtitle="View your booking requests and their current status."
      />

      {message && (
        <Alert variant={message.includes("successfully") ? "success" : "destructive"} className="mb-4">
          {message}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold">Booking #{booking.id?.slice(-6)}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>Resource ID: {booking.resourceId}</p>
                <p>Date: {booking.date}</p>
                <p>Time: {booking.startTime} - {booking.endTime}</p>
                <p>Purpose: {booking.purpose}</p>
                <p>Attendees: {booking.attendees}</p>
                <p>Status: {booking.status}</p>
                <p>Review Reason: {booking.reviewReason || "-"}</p>
                <p>Approved By: {booking.approvedBy || "-"}</p>
              </div>

              {(booking.status === "PENDING" || booking.status === "APPROVED") && (
                <Button variant="destructive" size="sm" className="mt-3" onClick={() => handleCancel(booking.id)}>
                  Cancel Booking
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
