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
        const response = await api.get("/api/resources", {
          params: { status: "ACTIVE" },
        });
        setResources(response.data);
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
  // Display loading or error states if user data is still being fetched
  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }
  // Display error message if there was an issue fetching user data
  if (error) {
    return <Box sx={{ p: 3 }}>{error}</Box>;
  }

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
          // Booking form with fields for resource selection, date, time,
          purpose, and attendees
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "grid", gap: 2 }}
          >
            <TextField
              select
              label="Resource"
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              required
            >
              {resources.map((resource) => (
                <MenuItem key={resource.id} value={resource.id}>
                  {resource.name} - {resource.location}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            //
            <TextField
              label="Start Time"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="End Time"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
            />
            <TextField
              label="Attendees"
              name="attendees"
              type="number"
              value={formData.attendees}
              onChange={handleChange}
              required
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ width: "fit-content" }}
            >
              Submit Booking
            </Button>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}
