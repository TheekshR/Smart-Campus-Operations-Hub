import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function BookResourcePage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    resourceId: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "",
  });
  const [message, setMessage] = useState("");
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await api.get("/api/resources");
        setResources(
          response.data.filter((resource) => resource.status === "ACTIVE"),
        );
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      }
    };

    fetchResources();
  }, []);

  // Whenever the user changes a relevant field, check for booking suggestions
  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (
      updated.resourceId &&
      updated.date &&
      updated.startTime &&
      updated.endTime
    ) {
      try {
        const response = await api.get("/api/bookings/suggestions", {
          params: {
            resourceId: updated.resourceId,
            date: updated.date,
            startTime: updated.startTime,
            endTime: updated.endTime,
          },
        });
        setSuggestion(response.data);
      } catch (err) {
        console.error("Failed to fetch suggestion:", err);
        setSuggestion(null);
      }
    }
  };
  // Handle form submission to create a new booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/api/bookings", {
        ...formData,
        userId: currentUser.id,
        attendees: Number(formData.attendees),
      });

      setMessage("Booking request submitted successfully.");
      setFormData({
        resourceId: "",
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        attendees: "",
      });
      setSuggestion(null);
    } catch (err) {
      console.error("Booking creation failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create booking. Please check your inputs.";
      setMessage(errorMessage);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader
        title="Book Resource"
        subtitle="Submit a booking request for an active campus resource."
      />

      <Card>
        <CardContent className="pt-6">
          {message && (
            <Alert variant={message.includes("successfully") ? "success" : "destructive"} className="mb-4">
              {message}
            </Alert>
          )}

          {suggestion?.message && (
            <Alert variant="info" className="mb-4">
              {suggestion.message}
              {suggestion.suggestedStartTime && suggestion.suggestedEndTime
                ? ` Suggested: ${suggestion.suggestedStartTime} - ${suggestion.suggestedEndTime}`
                : ""}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Resource</Label>
              <Select name="resourceId" value={formData.resourceId} onChange={handleChange} required>
                <option value="">Select resource...</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - {resource.location}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Purpose</Label>
              <Input name="purpose" value={formData.purpose} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Attendees</Label>
              <Input type="number" name="attendees" value={formData.attendees} onChange={handleChange} required />
            </div>

            <Button type="submit">Submit Booking</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
