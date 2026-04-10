import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";

const CURRENT_USER_ID = "USER001";

export default function BookResourcePage() {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    resourceId: "",
    userId: CURRENT_USER_ID,
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
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      }
    };

    fetchResources();
  }, []);

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
      } catch (error) {
        setSuggestion(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/api/bookings", {
        ...formData,
        attendees: Number(formData.attendees),
      });

      setMessage("Booking request submitted successfully.");
      setFormData({
        resourceId: "",
        userId: CURRENT_USER_ID,
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        attendees: "",
      });
      setSuggestion(null);
    } catch (error) {
      console.error("Booking creation failed:", error);
      setMessage("Failed to create booking. Please check your inputs.");
    }
  };

  return (
    <Box>
      <PageHeader
        title="Book Resource"
        subtitle="Submit a booking request for an active campus resource."
      />

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          {message && (
            <Alert severity={message.includes("successfully") ? "success" : "error"} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {suggestion?.message && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {suggestion.message}
              {suggestion.suggestedStartTime && suggestion.suggestedEndTime
                ? ` Suggested: ${suggestion.suggestedStartTime} - ${suggestion.suggestedEndTime}`
                : ""}
            </Alert>
          )}

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

            <Button type="submit" variant="contained" sx={{ width: "fit-content" }}>
              Submit Booking
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}