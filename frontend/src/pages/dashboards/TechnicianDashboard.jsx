import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

export default function TechnicianDashboard() {
  return (
    <div>
      <PageHeader title="Technician Dashboard" subtitle="View assigned tickets, progress updates, and resolution tasks." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Assigned Tickets" value="0" />
        <StatCard title="In Progress" value="0" />
        <StatCard title="Resolved Today" value="0" />
      </div>
    </div>
  );
}
