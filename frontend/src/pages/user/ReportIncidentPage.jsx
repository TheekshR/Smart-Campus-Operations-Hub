import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function ReportIncidentPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    resourceId: "",
    description: "",
    priority: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await api.get("/api/resources");
        setResources(response.data.filter((resource) => resource.status === "ACTIVE"));
      } catch (err) {
        console.error("Failed to fetch resources:", err);
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
        userId: currentUser.id,
      });

      setMessage("Issue reported successfully.");
      setFormData({
        resourceId: "",
        description: "",
        priority: "",
      });
    } catch (err) {
      console.error("Issue creation failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to report issue. Please check your inputs.";
      setMessage(errorMessage);
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