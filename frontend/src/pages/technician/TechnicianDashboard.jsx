import { useEffect, useMemo, useState } from "react";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function TechnicianDashboard() {
  const { currentUser, loading, error } = useCurrentUser();
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [inProgressIssues, setInProgressIssues] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser?.id) return;

      try {
        const [assignedRes, inProgressRes, fixedRes, resourcesRes] = await Promise.all([
          api.get("/api/issues/status/ASSIGNED"),
          api.get("/api/issues/status/IN_PROGRESS"),
          api.get("/api/issues/status/FIXED"),
          api.get("/api/resources"),
        ]);

        setAssignedIssues(
          (assignedRes.data || []).filter(
            (issue) => issue.technicianId === currentUser.id
          )
        );
        setInProgressIssues(
          (inProgressRes.data || []).filter(
            (issue) => issue.technicianId === currentUser.id
          )
        );
        setResolvedIssues(
          (fixedRes.data || []).filter(
            (issue) => issue.technicianId === currentUser.id
          )
        );
        setResources(resourcesRes.data || []);
      } catch (error) {
        console.error("Failed to fetch technician stats:", error);
      }
    };

    fetchStats();
  }, [currentUser]);

  const insights = useMemo(() => {
    const allMyIssues = [...assignedIssues, ...inProgressIssues, ...resolvedIssues];

    const priorityCounts = {};
    allMyIssues.forEach((issue) => {
      priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
    });

    let mostCommonPriority = "No data";
    let maxPriorityCount = 0;
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      if (count > maxPriorityCount) {
        maxPriorityCount = count;
        mostCommonPriority = priority;
      }
    });

    const resourceMap = {};
    resources.forEach((resource) => {
      resourceMap[resource.id] = resource.name;
    });

    const issueResourceCounts = {};
    allMyIssues.forEach((issue) => {
      issueResourceCounts[issue.resourceId] = (issueResourceCounts[issue.resourceId] || 0) + 1;
    });

    let frequentResourceId = null;
    let maxResourceCount = 0;
    Object.entries(issueResourceCounts).forEach(([resourceId, count]) => {
      if (count > maxResourceCount) {
        maxResourceCount = count;
        frequentResourceId = resourceId;
      }
    });

    return {
      totalAssignedEver: allMyIssues.length,
      mostCommonPriority,
      frequentResource:
        frequentResourceId ? resourceMap[frequentResourceId] || frequentResourceId : "No data",
    };
  }, [assignedIssues, inProgressIssues, resolvedIssues, resources]);

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{ p: 3 }}>{error}</Box>;
  }

  return (
    <Box>
      <PageHeader
        title="Technician Dashboard"
        subtitle="View your assigned issues, work in progress, and resolved tasks."
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StatCard title="Assigned Tickets" value={assignedIssues.length} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="In Progress Tickets" value={inProgressIssues.length} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Resolved Tickets" value={resolvedIssues.length} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Work Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography>
                    Total handled tickets: <strong>{insights.totalAssignedEver}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography>
                    Most common priority: <strong>{insights.mostCommonPriority}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography>
                    Frequent issue resource: <strong>{insights.frequentResource}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}