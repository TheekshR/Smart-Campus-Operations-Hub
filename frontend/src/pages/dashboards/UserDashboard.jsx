import { Grid, Box } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

export default function UserDashboard() {
  return (
    <Box>
      <PageHeader
        title="User Dashboard"
        subtitle="Lecturers and staff can manage bookings, tickets, and notifications here."
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard title="My Active Bookings" value="0" />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="My Open Tickets" value="0" />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Unread Notifications" value="0" />
        </Grid>
      </Grid>
    </Box>
  );
}