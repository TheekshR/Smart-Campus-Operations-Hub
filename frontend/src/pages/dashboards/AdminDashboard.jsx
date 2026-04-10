import { Grid, Box } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

export default function AdminDashboard() {
  return (
    <Box>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage resources, booking approvals, and maintenance operations."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard title="Total Resources" value="0" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Pending Bookings" value="0" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Open Tickets" value="0" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Out of Service" value="0" />
        </Grid>
      </Grid>
    </Box>
  );
}