import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function AllIssuesPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});
  const [statusFilter, setStatusFilter] = useState("");

  const fetchIssues = async () => {
    try {
      const issuesRequest = statusFilter
        ? api.get(`/api/issues/status/${statusFilter}`)
        : api.get("/api/issues");

      const [issuesRes, resourcesRes] = await Promise.all([
        issuesRequest,
        api.get("/api/resources"),
      ]);

      setIssues(issuesRes.data || []);

      const map = {};
      (resourcesRes.data || []).forEach((resource) => {
        map[resource.id] = resource;
      });
      setResourceMap(map);
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchIssues();
    }
  }, [currentUser, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "REPORTED":
        return "warning";
      case "ASSIGNED":
        return "info";
      case "IN_PROGRESS":
        return "primary";
      case "FIXED":
        return "success";
      default:
        return "default";
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
        title="All Issues"
        subtitle="View all reported issues and their current progress."
      />

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="REPORTED">REPORTED</MenuItem>
          <MenuItem value="ASSIGNED">ASSIGNED</MenuItem>
          <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
          <MenuItem value="FIXED">FIXED</MenuItem>
        </TextField>
      </Box>

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

                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Chip label={issue.status} color={getStatusColor(issue.status)} />
                  </Box>

                  <Typography>
                    Technician ID: {issue.technicianId || "-"}
                  </Typography>
                  <Typography>
                    Assigned By: {issue.assignedBy || "-"}
                  </Typography>
                  <Typography>
                    Resolution Note: {issue.resolutionNote || "-"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}