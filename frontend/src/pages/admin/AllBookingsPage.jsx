import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
      const [bookingsRes, resourcesRes] = await Promise.all([api.get("/api/bookings/status/PENDING"), api.get("/api/resources")]);
      setBookings(bookingsRes.data || []);
      const map = {};
      (resourcesRes.data || []).forEach((r) => { map[r.id] = r; });
      setResourceMap(map);
    } catch (error) { console.error("Failed to fetch pending bookings:", error); }
  };

  useEffect(() => { if (currentUser) fetchPendingBookings(); }, [currentUser]);

  const handleApprove = async (bookingId) => {
    try {
      await api.put(`/api/bookings/${bookingId}/approve`, null, { params: { admin: currentUser?.name || "ADMIN" } });
      setMessage("Booking approved successfully."); fetchPendingBookings();
    } catch (error) {
      console.error("Failed to approve booking:", error);
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to approve booking.");
    }
  };

  const openRejectDialog = (bookingId) => { setSelectedBookingId(bookingId); setRejectReason(""); setRejectDialogOpen(true); };
  const closeRejectDialog = () => { setRejectDialogOpen(false); setSelectedBookingId(null); setRejectReason(""); };

  const handleReject = async () => {
    try {
      await api.put(`/api/bookings/${selectedBookingId}/reject`, null, { params: { reason: rejectReason, admin: currentUser?.name || "ADMIN" } });
      setMessage("Booking rejected successfully."); closeRejectDialog(); fetchPendingBookings();
    } catch (error) {
      console.error("Failed to reject booking:", error);
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to reject booking.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader title="Booking Requests" subtitle="Review and process pending booking requests." />
      {message && <Alert variant={message.includes("successfully") ? "success" : "destructive"} className="mb-4">{message}</Alert>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((booking) => {
          const resource = resourceMap[booking.resourceId];
          return (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">Request #{booking.id?.slice(-6)}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Resource: {resource ? resource.name : booking.resourceId}</p>
                  <p>Location: {resource ? resource.location : "-"}</p>
                  <p>User ID: {booking.userId}</p>
                  <p>Date: {booking.date}</p>
                  <p>Time: {booking.startTime} - {booking.endTime}</p>
                  <p>Purpose: {booking.purpose}</p>
                  <p>Attendees: {booking.attendees}</p>
                  <p>Status: {booking.status}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="success" onClick={() => handleApprove(booking.id)}>Approve</Button>
                  <Button variant="destructive" onClick={() => openRejectDialog(booking.id)}>Reject</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={rejectDialogOpen} onClose={closeRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Booking</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="mt-2" />
          <DialogFooter>
            <Button variant="ghost" onClick={closeRejectDialog}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
