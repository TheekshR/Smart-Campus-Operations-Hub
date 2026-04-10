import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Alert,
  Typography,
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
  const [selectedImages, setSelectedImages] = useState([]);
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 3) {
      setMessage("You can upload up to 3 images only.");
      return;
    }

    setMessage("");
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const form = new FormData();
      form.append("resourceId", formData.resourceId);
      form.append("userId", currentUser.id);
      form.append("description", formData.description);
      form.append("priority", formData.priority);

      selectedImages.forEach((file) => {
        form.append("images", file);
      });

      await api.post("/api/issues", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Issue reported successfully.");
      setFormData({
        resourceId: "",
        description: "",
        priority: "",
      });
      setSelectedImages([]);
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

            <Button variant="outlined" component="label">
              Upload Up To 3 Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>

            {selectedImages.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Selected Images:
                </Typography>
                {selectedImages.map((file, index) => (
                  <Typography key={index} variant="body2">
                    {file.name}
                  </Typography>
                ))}
              </Box>
            )}

            <Button type="submit" variant="contained" sx={{ width: "fit-content" }}>
              Submit Issue
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}