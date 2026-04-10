import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import api from "../../api/axios";

const COLORS = ["#1976d2", "#2e7d32", "#ed6c02", "#d32f2f", "#6a1b9a", "#00838f"];

export default function AdminDashboard() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [resourcesRes, bookingsRes, issuesRes, usersRes] = await Promise.all([
        api.get("/api/resources"),
        api.get("/api/bookings"),
        api.get("/api/issues"),
        api.get("/api/users"),
      ]);

      setResources(resourcesRes.data || []);
      setBookings(bookingsRes.data || []);
      setIssues(issuesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
      setError("Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === "PENDING").length,
    [bookings]
  );

  const outOfServiceCount = useMemo(
    () => resources.filter((r) => r.status === "OUT_OF_SERVICE").length,
    [resources]
  );

  const resourceTypeData = useMemo(() => {
    const counts = {};
    resources.forEach((resource) => {
      counts[resource.type] = (counts[resource.type] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [resources]);

  const bookingStatusData = useMemo(() => {
    const counts = {};
    bookings.forEach((booking) => {
      counts[booking.status] = (counts[booking.status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [bookings]);

  const issueStatusData = useMemo(() => {
    const counts = {};
    issues.forEach((issue) => {
      counts[issue.status] = (counts[issue.status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [issues]);

  const userRoleData = useMemo(() => {
    const counts = {};
    users.forEach((user) => {
      counts[user.role] = (counts[user.role] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [users]);

  const recentPendingBookings = useMemo(() => {
    return bookings.filter((b) => b.status === "PENDING").slice(0, 5);
  }, [bookings]);

  const recentReportedIssues = useMemo(() => {
    return issues.filter((i) => i.status === "REPORTED").slice(0, 5);
  }, [issues]);

  const insights = useMemo(() => {
    const resourceMap = {};
    resources.forEach((resource) => {
      resourceMap[resource.id] = resource.name;
    });

    const bookingCounts = {};
    bookings.forEach((booking) => {
      bookingCounts[booking.resourceId] = (bookingCounts[booking.resourceId] || 0) + 1;
    });

    let mostBookedResourceId = null;
    let maxBookings = 0;
    Object.entries(bookingCounts).forEach(([resourceId, count]) => {
      if (count > maxBookings) {
        maxBookings = count;
        mostBookedResourceId = resourceId;
      }
    });

    const issueCounts = {};
    issues.forEach((issue) => {
      issueCounts[issue.resourceId] = (issueCounts[issue.resourceId] || 0) + 1;
    });

    let mostProblematicResourceId = null;
    let maxIssues = 0;
    Object.entries(issueCounts).forEach(([resourceId, count]) => {
      if (count > maxIssues) {
        maxIssues = count;
        mostProblematicResourceId = resourceId;
      }
    });

    const hourCounts = {};
    bookings.forEach((booking) => {
      const hour = (booking.startTime || "00:00").split(":")[0] + ":00";
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let peakBookingHour = "No data";
    let maxHourCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxHourCount) {
        maxHourCount = count;
        peakBookingHour = hour;
      }
    });

    return {
      mostBookedResource:
        mostBookedResourceId ? resourceMap[mostBookedResourceId] || mostBookedResourceId : "No bookings",
      mostProblematicResource:
        mostProblematicResourceId
          ? resourceMap[mostProblematicResourceId] || mostProblematicResourceId
          : "No issues",
      peakBookingHour,
      totalOpenIssues: issues.filter((issue) => issue.status !== "FIXED").length,
    };
  }, [resources, bookings, issues]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>Loading admin dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor resources, users, bookings, and issues across the campus system."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Resources" value={resources.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value={users.length} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Bookings" value={pendingBookings} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Out Of Service" value={outOfServiceCount} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                System Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography>
                    Most booked resource: <strong>{insights.mostBookedResource}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography>
                    Peak booking hour: <strong>{insights.peakBookingHour}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography>
                    Most problematic resource: <strong>{insights.mostProblematicResource}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography>
                    Total open issues: <strong>{insights.totalOpenIssues}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: 360 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Resource Types
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={resourceTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Resources">
                    {resourceTypeData.map((entry, index) => (
                      <Cell key={`cell-resource-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: 360 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Booking Status
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-booking-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: 360 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Issue Status
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={issueStatusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {issueStatusData.map((entry, index) => (
                      <Cell key={`cell-issue-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: 360 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                User Roles
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={userRoleData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-user-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: 360 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Recent Pending Bookings
              </Typography>

              {recentPendingBookings.length === 0 ? (
                <Typography color="text.secondary">No pending bookings.</Typography>
              ) : (
                recentPendingBookings.map((booking) => (
                  <Box
                    key={booking.id}
                    sx={{
                      mb: 2,
                      pb: 1.5,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography fontWeight="600">
                      {booking.purpose}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User: {booking.userId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {booking.date} | {booking.startTime} - {booking.endTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {booking.status}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: 360 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Recent Reported Issues
              </Typography>

              {recentReportedIssues.length === 0 ? (
                <Typography color="text.secondary">No reported issues.</Typography>
              ) : (
                recentReportedIssues.map((issue) => (
                  <Box
                    key={issue.id}
                    sx={{
                      mb: 2,
                      pb: 1.5,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography fontWeight="600">
                      {issue.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      User: {issue.userId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Priority: {issue.priority}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {issue.status}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}