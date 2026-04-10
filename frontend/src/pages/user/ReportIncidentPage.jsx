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

export default function ReportIncidentPage() {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    resourceId: "",
    userId: CURRENT_USER_ID,
    description: "",
    priority: "",
  });
  const [message, setMessage] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.post("/api/issues", {
        ...formData,
      });

      setMessage("Issue reported successfully.");
      setFormData({
        resourceId: "",
        userId: CURRENT_USER_ID,
        description: "",
        priority: "",
      });
    } catch (error) {
      console.error("Issue creation failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to report issue. Please check your inputs.";
      setMessage(errorMessage);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Report Incident"
        subtitle="Report a facility or resource issue for maintenance attention."
      />

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          {message && (
            <Alert severity={message.includes("successfully") ? "success" : "error"} sx={{ mb: 2 }}>
              {message}
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
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              minRows={4}
              required
            />

            <TextField
              select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <MenuItem value="LOW">LOW</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM</MenuItem>
              <MenuItem value="HIGH">HIGH</MenuItem>
            </TextField>

            <Button type="submit" variant="contained" sx={{ width: "fit-content" }}>
              Submit Issue
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}