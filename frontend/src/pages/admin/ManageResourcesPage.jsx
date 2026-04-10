import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";

const initialForm = {
  name: "",
  type: "",
  capacity: "",
  location: "",
  status: "ACTIVE",
  availabilityStart: "",
  availabilityEnd: "",
};

export default function ManageResourcesPage() {
  const [resources, setResources] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const fetchResources = async () => {
    try {
      const response = await api.get("/api/resources", {
        params: {
          type: typeFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      setResources(response.data);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [typeFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialForm);
    setOpen(true);
  };

  const handleOpenEdit = (resource) => {
    setEditingId(resource.id);
    setFormData({
      name: resource.name || "",
      type: resource.type || "",
      capacity: resource.capacity || "",
      location: resource.location || "",
      status: resource.status || "ACTIVE",
      availabilityStart: resource.availabilityStart || "",
      availabilityEnd: resource.availabilityEnd || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      if (editingId) {
        await api.put(`/api/resources/${editingId}`, payload);
        setMessage("Resource updated successfully.");
      } else {
        await api.post("/api/resources", payload);
        setMessage("Resource created successfully.");
      }

      handleClose();
      fetchResources();
    } catch (error) {
      console.error("Failed to save resource:", error);
      setMessage("Failed to save resource.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/resources/${id}`);
      setMessage("Resource deleted successfully.");
      fetchResources();
    } catch (error) {
      console.error("Failed to delete resource:", error);
      setMessage("Failed to delete resource.");
    }
  };

  return (
    <Box sx={{ p: { xs: 3, md: 5 }, bgcolor: "#ffffff", minHeight: "100vh" }}>
      <PageHeader
        title="Manage Resources"
        subtitle="Create, edit, delete, and monitor campus resources."
      />

      {message && (
        <Alert 
          severity={message.includes("successfully") ? "success" : "error"} 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {message}
        </Alert>
      )}

      {/* Filters & Add Button */}
      <Box 
        sx={{ 
          display: "flex", 
          gap: 2, 
          mb: 5, 
          flexWrap: "wrap",
          alignItems: "center" 
        }}
      >
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 220 }}
          size="small"
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="LAB">LAB</MenuItem>
          <MenuItem value="LECTURE_HALL">LECTURE_HALL</MenuItem>
          <MenuItem value="MEETING_ROOM">MEETING_ROOM</MenuItem>
          <MenuItem value="EQUIPMENT">EQUIPMENT</MenuItem>
        </TextField>

        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 220 }}
          size="small"
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="ACTIVE">ACTIVE</MenuItem>
          <MenuItem value="OUT_OF_SERVICE">OUT_OF_SERVICE</MenuItem>
        </TextField>

        <Button 
          variant="contained" 
          onClick={handleOpenCreate}
          sx={{
            bgcolor: "#000000",
            color: "#ffffff",
            px: 4,
            py: 1.2,
            borderRadius: 2,
            "&:hover": { bgcolor: "#333333" },
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          + ADD RESOURCE
        </Button>
      </Box>

      {/* Resources Grid */}
      <Grid container spacing={4}>
        {resources.map((resource) => (
          <Grid item xs={12} md={6} lg={4} key={resource.id}>
            <Card 
              sx={{ 
                borderRadius: 3, 
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                border: "1px solid #f0f0f0",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                }
              }}
            >
              <CardContent sx={{ p: 3.5 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="700" 
                  sx={{ color: "#000000", mb: 2 }}
                >
                  {resource.name}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, mb: 3 }}>
                  <Typography sx={{ color: "#555555", fontSize: "0.95rem" }}>
                    Type: <strong>{resource.type}</strong>
                  </Typography>
                  <Typography sx={{ color: "#555555", fontSize: "0.95rem" }}>
                    Capacity: <strong>{resource.capacity}</strong>
                  </Typography>
                  <Typography sx={{ color: "#555555", fontSize: "0.95rem" }}>
                    Location: <strong>{resource.location}</strong>
                  </Typography>
                  <Typography sx={{ color: "#555555", fontSize: "0.95rem" }}>
                    Status: <strong>{resource.status}</strong>
                  </Typography>
                  <Typography sx={{ color: "#555555", fontSize: "0.95rem" }}>
                    Available: <strong>
                      {resource.availabilityStart || "-"} — {resource.availabilityEnd || "-"}
                    </strong>
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleOpenEdit(resource)}
                    sx={{
                      borderColor: "#000000",
                      color: "#000000",
                      "&:hover": { bgcolor: "#f5f5f5", borderColor: "#000000" },
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => handleDelete(resource.id)}
                    sx={{
                      borderColor: "#d32f2f",
                      "&:hover": { bgcolor: "#fff5f5" },
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: { 
            borderRadius: 3, 
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)" 
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.35rem", pb: 1 }}>
          {editingId ? "Edit Resource" : "Add New Resource"}
        </DialogTitle>
        
        <DialogContent sx={{ display: "grid", gap: 2.5, mt: 1, pb: 3 }}>
          <TextField 
            label="Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            fullWidth 
            size="small"
          />
          <TextField 
            select 
            label="Type" 
            name="type" 
            value={formData.type} 
            onChange={handleChange}
            size="small"
          >
            <MenuItem value="LAB">LAB</MenuItem>
            <MenuItem value="LECTURE_HALL">LECTURE_HALL</MenuItem>
            <MenuItem value="MEETING_ROOM">MEETING_ROOM</MenuItem>
            <MenuItem value="EQUIPMENT">EQUIPMENT</MenuItem>
          </TextField>
          <TextField 
            label="Capacity" 
            name="capacity" 
            type="number" 
            value={formData.capacity} 
            onChange={handleChange} 
            size="small"
          />
          <TextField 
            label="Location" 
            name="location" 
            value={formData.location} 
            onChange={handleChange} 
            size="small"
          />
          <TextField 
            select 
            label="Status" 
            name="status" 
            value={formData.status} 
            onChange={handleChange}
            size="small"
          >
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="OUT_OF_SERVICE">OUT_OF_SERVICE</MenuItem>
          </TextField>
          <TextField
            label="Availability Start"
            name="availabilityStart"
            type="time"
            value={formData.availabilityStart}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Availability End"
            name="availabilityEnd"
            type="time"
            value={formData.availabilityEnd}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose}
            sx={{ color: "#666666" }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            sx={{
              bgcolor: "#000000",
              color: "#ffffff",
              "&:hover": { bgcolor: "#333333" },
              px: 4,
            }}
          >
            Save Resource
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}