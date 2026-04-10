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

const CURRENT_USER_ID = "USER001";

export default function MyTicketsPage() {
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issuesRes, resourcesRes] = await Promise.all([
          api.get(`/api/issues/user/${CURRENT_USER_ID}`),
          api.get("/api/resources"),
        ]);

        setIssues(issuesRes.data);

        const map = {};
        resourcesRes.data.forEach((resource) => {
          map[resource.id] = resource;
        });
        setResourceMap(map);
      } catch (error) {
        console.error("Failed to fetch user issues:", error);
      }
    };

    fetchData();
  }, []);

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

  return (
    <Box>
      <PageHeader
        title="My Tickets"
        subtitle="Track the issues you have reported and their current progress."
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