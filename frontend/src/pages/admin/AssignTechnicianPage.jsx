import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function AssignTechnicianPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});
  const [technicians, setTechnicians] = useState([]);
  const [technicianInputs, setTechnicianInputs] = useState({});
  const [message, setMessage] = useState("");

  const fetchReportedIssues = async () => {
    try {
      const [issuesRes, resourcesRes, techniciansRes] = await Promise.all([
        api.get("/api/issues/status/REPORTED"), api.get("/api/resources"), api.get("/api/users/role/TECHNICIAN"),
      ]);
      setIssues(issuesRes.data || []); setTechnicians(techniciansRes.data || []);
      const map = {};
      (resourcesRes.data || []).forEach((r) => { map[r.id] = r; });
      setResourceMap(map);
    } catch (error) {
      console.error("Failed to fetch reported issues:", error);
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to load issues or technicians.");
    }
  };

  useEffect(() => { if (currentUser) fetchReportedIssues(); }, [currentUser]);

  const handleTechnicianChange = (issueId, value) => { setTechnicianInputs((prev) => ({ ...prev, [issueId]: value })); };

  const handleAssign = async (issueId) => {
    const technicianId = technicianInputs[issueId];
    if (!technicianId || !technicianId.trim()) { setMessage("Please select a technician before assigning."); return; }
    try {
      await api.put(`/api/issues/${issueId}/assign`, null, { params: { technicianId, admin: currentUser?.name || "ADMIN" } });
      setMessage("Technician assigned successfully."); fetchReportedIssues();
    } catch (error) {
      console.error("Failed to assign technician:", error);
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to assign technician.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader title="Assign Technician" subtitle="Assign reported issues to technicians." />
      {message && <Alert variant={message.includes("successfully") ? "success" : "destructive"} className="mb-4">{message}</Alert>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => {
          const resource = resourceMap[issue.resourceId];
          return (
            <Card key={issue.id}>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">Issue #{issue.id?.slice(-6)}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Resource: {resource ? resource.name : issue.resourceId}</p>
                  <p>Location: {resource ? resource.location : "-"}</p>
                  <p>User ID: {issue.userId}</p>
                  <p>Description: {issue.description}</p>
                  <p>Priority: {issue.priority}</p>
                  <p>Status: {issue.status}</p>
                </div>
                <Select value={technicianInputs[issue.id] || ""} onChange={(e) => handleTechnicianChange(issue.id, e.target.value)} className="mt-3">
                  <option value="">Select Technician...</option>
                  {technicians.map((t) => <option key={t.id} value={t.id}>{t.name} {t.email ? `(${t.email})` : ""}</option>)}
                </Select>
                <Button className="mt-3" onClick={() => handleAssign(issue.id)}>Assign Technician</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
