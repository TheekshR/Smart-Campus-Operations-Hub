import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";
import IssueCommentsSection from "../../components/issues/IssueCommentsSection";

export default function ResolvedTicketsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});

  const fetchResolvedIssues = async () => {
    try {
      const [issuesRes, resourcesRes] = await Promise.all([
        api.get("/api/issues/status/FIXED"),
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
      console.error("Failed to fetch resolved issues:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchResolvedIssues();
    }
  }, [currentUser]);

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 3 }}>{error}</Box>;
  }

  return (
    <Box>
      <PageHeader
        title="Resolved Tickets"
        subtitle="View issues you have completed."
      />

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
                    <Chip label={issue.status} color="success" />
                  </Box>

                  <Typography>
                    Resolution Note: {issue.resolutionNote || "-"}
                  </Typography>
                  <IssueCommentsSection issueId={issue.id} />
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}