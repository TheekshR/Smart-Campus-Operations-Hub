import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";

const ADMIN_NAME = "ADMIN001";

export default function AssignTechnicianPage() {
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});
  const [technicianInputs, setTechnicianInputs] = useState({});
  const [message, setMessage] = useState("");

  const fetchReportedIssues = async () => {
    try {
      const [issuesRes, resourcesRes] = await Promise.all([
        api.get("/api/issues/status/REPORTED"),
        api.get("/api/resources"),
      ]);

      setIssues(issuesRes.data);

      const map = {};
      resourcesRes.data.forEach((resource) => {
        map[resource.id] = resource;
      });
      setResourceMap(map);
    } catch (error) {
      console.error("Failed to fetch reported issues:", error);
    }
  };

  useEffect(() => {
    fetchReportedIssues();
  }, []);

  const handleTechnicianChange = (issueId, value) => {
    setTechnicianInputs((prev) => ({
      ...prev,
      [issueId]: value,
    }));
  };

  const handleAssign = async (issueId) => {
    const technicianId = technicianInputs[issueId];

    if (!technicianId || !technicianId.trim()) {
      setMessage("Please enter a technician ID before assigning.");
      return;
    }

    try {
      await api.put(`/api/issues/${issueId}/assign`, null, {
        params: {
          technicianId,
          admin: ADMIN_NAME,
        },
      });

      setMessage("Technician assigned successfully.");
      fetchReportedIssues();
    } catch (error) {
      console.error("Failed to assign technician:", error);
      setMessage("Failed to assign technician.");
    }
  };

  return (
    <Box>
      <PageHeader
        title="Assign Technician"
        subtitle="Assign reported issues to technicians."
      />

      {message && (
        <Alert severity={message.includes("successfully") ? "success" : "error"} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {issues.map((issue) => {
          const resource = resourceMap[issue.resourceId];

          return (
            <Grid item xs={12} md={6} lg={4} key={issue.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    Issue #{issue.id?.slice(-6)}
                  </Typography>

                  <Typography sx={{ mt: 1 }}>
                    Resource: {resource ? resource.name : issue.resourceId}
                  </Typography>
                  <Typography>
                    Location: {resource ? resource.location : "-"}
                  </Typography>
                  <Typography>User ID: {issue.userId}</Typography>
                  <Typography>Description: {issue.description}</Typography>
                  <Typography>Priority: {issue.priority}</Typography>
                  <Typography>Status: {issue.status}</Typography>

                  <TextField
                    fullWidth
                    label="Technician ID"
                    value={technicianInputs[issue.id] || ""}
                    onChange={(e) => handleTechnicianChange(issue.id, e.target.value)}
                    sx={{ mt: 2 }}
                  />

                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => handleAssign(issue.id)}
                  >
                    Assign Technician
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}