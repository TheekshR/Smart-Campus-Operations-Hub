import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";

const TECHNICIAN_ID = "TECH001";

export default function InProgressTicketsPage() {
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const fetchInProgressIssues = async () => {
    try {
      const [issuesRes, resourcesRes] = await Promise.all([
        api.get("/api/issues/status/IN_PROGRESS"),
        api.get("/api/resources"),
      ]);

      const filteredIssues = issuesRes.data.filter(
        (issue) => issue.technicianId === TECHNICIAN_ID
      );

      setIssues(filteredIssues);

      const map = {};
      resourcesRes.data.forEach((resource) => {
        map[resource.id] = resource;
      });
      setResourceMap(map);
    } catch (error) {
      console.error("Failed to fetch in-progress issues:", error);
    }
  };

  useEffect(() => {
    fetchInProgressIssues();
  }, []);

  const openResolveDialog = (issueId) => {
    setSelectedIssueId(issueId);
    setResolutionNote("");
    setDialogOpen(true);
  };

  const closeResolveDialog = () => {
    setDialogOpen(false);
    setSelectedIssueId(null);
    setResolutionNote("");
  };

  const handleResolve = async () => {
    try {
      await api.put(`/api/issues/${selectedIssueId}/resolve`, null, {
        params: {
          technicianId: TECHNICIAN_ID,
          resolutionNote,
        },
      });
      setMessage("Issue resolved successfully.");
      closeResolveDialog();
      fetchInProgressIssues();
    } catch (error) {
      console.error("Failed to resolve issue:", error);
      setMessage("Failed to resolve issue.");
    }
  };

  return (
    <Box>
      <PageHeader
        title="In Progress Tickets"
        subtitle="Manage issues currently being worked on."
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

                  <Button
                    variant="contained"
                    color="success"
                    sx={{ mt: 2 }}
                    onClick={() => openResolveDialog(issue.id)}
                  >
                    Mark as Fixed
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={dialogOpen} onClose={closeResolveDialog} fullWidth maxWidth="sm">
        <DialogTitle>Resolve Issue</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Resolution Note"
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeResolveDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleResolve}
            disabled={!resolutionNote.trim()}
          >
            Confirm Resolve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}