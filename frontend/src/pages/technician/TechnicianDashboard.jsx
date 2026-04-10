import { useEffect, useState } from "react";
import { Box, Grid } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function TechnicianDashboard() {
  const { currentUser, loading, error } = useCurrentUser();
  const [assignedCount, setAssignedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser?.id) return;

      try {
        const [assignedRes, inProgressRes, fixedRes] = await Promise.all([
          api.get("/api/issues/status/ASSIGNED"),
          api.get("/api/issues/status/IN_PROGRESS"),
          api.get("/api/issues/status/FIXED"),
        ]);

        setAssignedCount(
          (assignedRes.data || []).filter(
            (issue) => issue.technicianId === currentUser.id
          ).length
        );
        setInProgressCount(
          (inProgressRes.data || []).filter(
            (issue) => issue.technicianId === currentUser.id
          ).length
        );
        setResolvedCount(
          (fixedRes.data || []).filter(
            (issue) => issue.technicianId === currentUser.id
          ).length
        );
      } catch (error) {
        console.error("Failed to fetch technician stats:", error);
      }
    };

    fetchStats();
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
        title="Technician Dashboard"
        subtitle="View your assigned issues, work in progress, and resolved tasks."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard title="Assigned Tickets" value={assignedCount} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="In Progress Tickets" value={inProgressCount} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Resolved Tickets" value={resolvedCount} />
        </Grid>
      </Grid>
    </Box>
  );
}