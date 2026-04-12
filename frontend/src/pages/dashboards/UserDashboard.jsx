import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

export default function UserDashboard() {
  return (
    <div>
      <PageHeader title="User Dashboard" subtitle="Lecturers and staff can manage bookings, tickets, and notifications here." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="My Active Bookings" value="0" />
        <StatCard title="My Open Tickets" value="0" />
        <StatCard title="Unread Notifications" value="0" />
      </div>
    </div>
  );
}
