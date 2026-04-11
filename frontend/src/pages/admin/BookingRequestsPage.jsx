import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
      const [bookingsRes, resourcesRes] = await Promise.all([api.get("/api/bookings/status/PENDING"), api.get("/api/resources")]);
      setBookings(bookingsRes.data || []);
      const map = {};
      (resourcesRes.data || []).forEach((r) => { map[r.id] = r; });
      setResourceMap(map);
    } catch (err) { console.error("Failed to fetch pending bookings:", err); }
  };

  useEffect(() => { if (currentUser) fetchPendingBookings(); }, [currentUser]);

  const handleApprove = async (bookingId) => {
    try {
      await api.put(`/api/bookings/${bookingId}/approve`, null, { params: { admin: currentUser?.name || "ADMIN" } });
      setMessage("Booking approved successfully."); fetchPendingBookings();
    } catch (err) { console.error("Failed to approve booking:", err); setMessage("Failed to approve booking."); }
  };

  const openRejectDialog = (bookingId) => { setSelectedBookingId(bookingId); setRejectReason(""); setRejectDialogOpen(true); };
  const closeRejectDialog = () => { setRejectDialogOpen(false); setSelectedBookingId(null); setRejectReason(""); };

  const handleReject = async () => {
    try {
      await api.put(`/api/bookings/${selectedBookingId}/reject`, null, { params: { reason: rejectReason, admin: currentUser?.name || "ADMIN" } });
      setMessage("Booking rejected successfully."); closeRejectDialog(); fetchPendingBookings();
    } catch (err) { console.error("Failed to reject booking:", err); setMessage("Failed to reject booking."); }
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
            <Card key={booking.id} className="hover:-translate-y-1 transition-transform">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold mb-3">Request #{booking.id?.slice(-6)}</h3>
                <div className="space-y-1.5 text-sm text-muted-foreground mb-6">
                  <p>Resource: <strong className="text-foreground">{resource ? resource.name : booking.resourceId}</strong></p>
                  <p>Location: <strong className="text-foreground">{resource ? resource.location : "-"}</strong></p>
                  <p>User ID: <strong className="text-foreground">{booking.userId}</strong></p>
                  <p>Date: <strong className="text-foreground">{booking.date}</strong></p>
                  <p>Time: <strong className="text-foreground">{booking.startTime} — {booking.endTime}</strong></p>
                  <p>Purpose: <strong className="text-foreground">{booking.purpose}</strong></p>
                  <p>Attendees: <strong className="text-foreground">{booking.attendees}</strong></p>
                  <p>Status: <strong className="text-foreground">{booking.status}</strong></p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleApprove(booking.id)}>APPROVE</Button>
                  <Button variant="destructive" className="flex-1" onClick={() => openRejectDialog(booking.id)}>REJECT</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={rejectDialogOpen} onClose={closeRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Booking Request</DialogTitle></DialogHeader>
          <Textarea placeholder="Enter reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4} className="mt-2" />
          <DialogFooter>
            <Button variant="ghost" onClick={closeRejectDialog}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
