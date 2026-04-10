import { Grid, Box } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

export default function TechnicianDashboard() {
  return (
    <Box>
      <PageHeader
        title="Technician Dashboard"
        subtitle="View assigned tickets, progress updates, and resolution tasks."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard title="Assigned Tickets" value="0" />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="In Progress" value="0" />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Resolved Today" value="0" />
        </Grid>
      </Grid>
    </Box>
  );
}