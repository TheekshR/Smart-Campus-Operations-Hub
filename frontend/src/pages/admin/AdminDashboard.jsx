import { useEffect, useMemo, useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import api from "../../api/axios";

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(271, 76%, 53%)",
  "hsl(187, 100%, 42%)",
];

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
      <div className="p-6 flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor resources, users, bookings, and issues across the campus system."
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Resources" value={resources.length} />
        <StatCard title="Total Users" value={users.length} />
        <StatCard title="Pending Bookings" value={pendingBookings} />
        <StatCard title="Out Of Service" value={outOfServiceCount} />
      </div>

      {/* System Insights */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">System Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Most booked resource</p>
              <p className="font-semibold">{insights.mostBookedResource}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peak booking hour</p>
              <p className="font-semibold">{insights.peakBookingHour}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most problematic resource</p>
              <p className="font-semibold">{insights.mostProblematicResource}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total open issues</p>
              <p className="font-semibold">{insights.totalOpenIssues}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Bar Chart - Resource Types */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Resource Types</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceTypeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Resources" radius={[4, 4, 0, 0]}>
                    {resourceTypeData.map((entry, index) => (
                      <Cell key={`cell-resource-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - User Roles */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">User Roles</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRoleData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    innerRadius="45%"
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-user-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Pie Chart - Booking Status */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    innerRadius="45%"
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {bookingStatusData.map((entry, index) => (
                      <Cell key={`cell-booking-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Issue Status */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Issue Status</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    innerRadius="45%"
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {issueStatusData.map((entry, index) => (
                      <Cell key={`cell-issue-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Recent Pending Bookings */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Pending Bookings</h3>
            {recentPendingBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending bookings.</p>
            ) : (
              <div className="space-y-3">
                {recentPendingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <p className="font-medium">{booking.purpose}</p>
                    <p className="text-sm text-muted-foreground">User: {booking.userId}</p>
                    <p className="text-sm text-muted-foreground">
                      Date: {booking.date} | {booking.startTime} - {booking.endTime}
                    </p>
                    <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reported Issues */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Reported Issues</h3>
            {recentReportedIssues.length === 0 ? (
              <p className="text-muted-foreground text-sm">No reported issues.</p>
            ) : (
              <div className="space-y-3">
                {recentReportedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <p className="font-medium">{issue.description}</p>
                    <p className="text-sm text-muted-foreground">User: {issue.userId}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                        {issue.priority}
                      </span>
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
