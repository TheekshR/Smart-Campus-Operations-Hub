import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";

import UserDashboard from "../pages/user/UserDashboard";
import ViewResourcesPage from "../pages/user/ViewResourcesPage";
import BookResourcePage from "../pages/user/BookResourcePage";
import MyBookingsPage from "../pages/user/MyBookingsPage";
import ReportIncidentPage from "../pages/user/ReportIncidentPage";
import MyTicketsPage from "../pages/user/MyTicketsPage";
import UserNotificationsPage from "../pages/user/UserNotificationsPage";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageResourcesPage from "../pages/admin/ManageResourcesPage";
import BookingRequestsPage from "../pages/admin/BookingRequestsPage";
import AllBookingsPage from "../pages/admin/AllBookingsPage";
import AllIssuesPage from "../pages/admin/AllIssuesPage";
import AssignTechnicianPage from "../pages/admin/AssignTechnicianPage";
import AdminNotificationsPage from "../pages/admin/AdminNotificationsPage";

import TechnicianDashboard from "../pages/technician/TechnicianDashboard";
import AssignedTicketsPage from "../pages/technician/AssignedTicketsPage";
import InProgressTicketsPage from "../pages/technician/InProgressTicketsPage";
import ResolvedTicketsPage from "../pages/technician/ResolvedTicketsPage";
import TechnicianNotificationsPage from "../pages/technician/TechnicianNotificationsPage";

import NotFoundPage from "../pages/NotFoundPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/user/dashboard" replace />} />

        <Route element={<DashboardLayout role="user" />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/resources" element={<ViewResourcesPage />} />
          <Route path="/user/book-resource" element={<BookResourcePage />} />
          <Route path="/user/my-bookings" element={<MyBookingsPage />} />
          <Route path="/user/report-incident" element={<ReportIncidentPage />} />
          <Route path="/user/my-tickets" element={<MyTicketsPage />} />
          <Route path="/user/notifications" element={<UserNotificationsPage />} />
        </Route>

        <Route element={<DashboardLayout role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/resources" element={<ManageResourcesPage />} />
          <Route path="/admin/booking-requests" element={<BookingRequestsPage />} />
          <Route path="/admin/all-bookings" element={<AllBookingsPage />} />
          <Route path="/admin/all-issues" element={<AllIssuesPage />} />
          <Route path="/admin/assign-technician" element={<AssignTechnicianPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        </Route>

        <Route element={<DashboardLayout role="technician" />}>
          <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
          <Route path="/technician/assigned-tickets" element={<AssignedTicketsPage />} />
          <Route path="/technician/in-progress-tickets" element={<InProgressTicketsPage />} />
          <Route path="/technician/resolved-tickets" element={<ResolvedTicketsPage />} />
          <Route path="/technician/notifications" element={<TechnicianNotificationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}