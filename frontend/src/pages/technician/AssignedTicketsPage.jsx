import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function AssignedTicketsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});
  const [message, setMessage] = useState("");

  const fetchAssignedIssues = async () => {
    try {
      const [issuesRes, resourcesRes] = await Promise.all([
        api.get("/api/issues/status/ASSIGNED"),
        api.get("/api/resources"),
      ]);

      const filteredIssues = (issuesRes.data || []).filter(
        (issue) => issue.technicianId === currentUser?.id
      );

      setIssues(filteredIssues);

      const map = {};
      (resourcesRes.data || []).forEach((resource) => {
        map[resource.id] = resource;
      });
      setResourceMap(map);
    } catch (error) {
      console.error("Failed to fetch assigned issues:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAssignedIssues();
    }
  }, [currentUser]);

  const handleStart = async (issueId) => {
    try {
      await api.put(`/api/issues/${issueId}/start`, null, {
        params: { technicianId: currentUser.id },
      });
      setMessage("Issue moved to IN_PROGRESS.");
      fetchAssignedIssues();
    } catch (error) {
      console.error("Failed to start issue:", error);
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to start issue."
      );
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
        title="Assigned Tickets"
        subtitle="View issues assigned to you and start progress."
      />

      {message && (
        <Alert
          severity={message.includes("IN_PROGRESS") ? "success" : "error"}
          sx={{ mb: 2 }}
        >
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

                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => handleStart(issue.id)}
                  >
                    Start Progress
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