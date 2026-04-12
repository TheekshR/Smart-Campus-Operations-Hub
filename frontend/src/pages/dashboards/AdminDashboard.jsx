import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Manage resources, booking approvals, and maintenance operations." />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Resources" value="0" />
        <StatCard title="Pending Bookings" value="0" />
        <StatCard title="Open Tickets" value="0" />
        <StatCard title="Out of Service" value="0" />
      </div>
    </div>
  );
}
