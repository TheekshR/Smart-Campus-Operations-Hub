import { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [resourceCount, setResourceCount] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);
  const [outOfServiceCount, setOutOfServiceCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resourcesRes, pendingRes, issuesRes, outRes] = await Promise.all([
          api.get("/api/resources"),
          api.get("/api/bookings/status/PENDING"),
          api.get("/api/issues"),
          api.get("/api/resources", { params: { status: "OUT_OF_SERVICE" } }),
        ]);

        setResourceCount(resourcesRes.data.length);
        setPendingBookings(pendingRes.data.length);
        setIssuesCount(issuesRes.data.length);
        setOutOfServiceCount(outRes.data.length);
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ p: { xs: 3, md: 5 }, bgcolor: "#ffffff", minHeight: "100vh" }}>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage resources, booking approvals, and issue operations."
      />

      {/* Futuristic subtle divider */}
      <Box
        sx={{
          height: "1px",
          bgcolor: "#e0e0e0",
          my: 4,
          width: "100%",
        }}
      />

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Total Resources" 
            value={resourceCount} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Pending Bookings" 
            value={pendingBookings} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="All Issues" 
            value={issuesCount} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Out Of Service" 
            value={outOfServiceCount} 
          />
        </Grid>
      </Grid>

      {/* Minimal footer note for futuristic feel */}
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: "#999999", 
            letterSpacing: "1px",
            fontWeight: 400 
          }}
        >
          SYSTEM OVERVIEW • REAL-TIME • SMART CAMPUS
        </Typography>
      </Box>
    </Box>
  );
}