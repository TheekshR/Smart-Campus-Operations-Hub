import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import api from "../../api/axios";
import PageHeader from "../../components/common/PageHeader";

export default function ResourceListPage() {
  const [resources, setResources] = useState([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const fetchResources = async () => {
    try {
      const response = await api.get("/api/resources", {
        params: {
          type: type || undefined,
          status: status || undefined,
        },
      });
      setResources(response.data);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [type, status]);

  return (
    <Box>
      <PageHeader
        title="Resources"
        subtitle="Browse and filter campus resources."
      />

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="LAB">LAB</MenuItem>
          <MenuItem value="LECTURE_HALL">LECTURE_HALL</MenuItem>
          <MenuItem value="MEETING_ROOM">MEETING_ROOM</MenuItem>
          <MenuItem value="EQUIPMENT">EQUIPMENT</MenuItem>
        </TextField>

        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ACTIVE">ACTIVE</MenuItem>
          <MenuItem value="OUT_OF_SERVICE">OUT_OF_SERVICE</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={3}>
        {resources.map((resource) => (
          <Grid item xs={12} md={6} lg={4} key={resource.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {resource.name}
                </Typography>
                <Typography sx={{ mt: 1 }}>Type: {resource.type}</Typography>
                <Typography>Capacity: {resource.capacity}</Typography>
                <Typography>Location: {resource.location}</Typography>
                <Typography>Status: {resource.status}</Typography>
                <Typography>
                  Available: {resource.availabilityStart || "-"} to{" "}
                  {resource.availabilityEnd || "-"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}