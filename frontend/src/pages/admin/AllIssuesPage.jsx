import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";
import IssueCommentsSection from "../../components/issues/IssueCommentsSection";

export default function AllIssuesPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});
  const [statusFilter, setStatusFilter] = useState("");

  const fetchIssues = async () => {
    try {
      const issuesRequest = statusFilter ? api.get(`/api/issues/status/${statusFilter}`) : api.get("/api/issues");
      const [issuesRes, resourcesRes] = await Promise.all([issuesRequest, api.get("/api/resources")]);
      setIssues(issuesRes.data || []);
      const map = {};
      (resourcesRes.data || []).forEach((r) => { map[r.id] = r; });
      setResourceMap(map);
    } catch (error) { console.error("Failed to fetch issues:", error); }
  };

  useEffect(() => { if (currentUser) fetchIssues(); }, [currentUser, statusFilter]);

  const getStatusVariant = (status) => {
    switch (status) { case "REPORTED": return "warning"; case "ASSIGNED": return "info"; case "IN_PROGRESS": return "default"; case "FIXED": return "success"; default: return "secondary"; }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader title="All Issues" subtitle="View all reported issues and their current progress." />
      <div className="mb-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-[220px]">
          <option value="">All</option>
          <option value="REPORTED">REPORTED</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="FIXED">FIXED</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => {
          const resource = resourceMap[issue.resourceId];
          return (
            <Card key={issue.id} className="overflow-hidden">
              {issue.imageBase64List && issue.imageTypes && issue.imageBase64List.length > 0 && (
                <div className={`grid gap-1 p-2 pb-0 ${issue.imageBase64List.length === 1 ? "grid-cols-1" : issue.imageBase64List.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {issue.imageBase64List.map((img, i) => (
                    <img key={i} src={`data:${issue.imageTypes[i]};base64,${img}`} alt={`Issue evidence ${i + 1}`} className="w-full h-28 object-cover rounded border" />
                  ))}
                </div>
              )}
              <CardContent className="pt-4">
                <h3 className="text-lg font-bold">Issue #{issue.id?.slice(-6)}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Resource: {resource ? resource.name : issue.resourceId}</p>
                  <p>Location: {resource ? resource.location : "-"}</p>
                  <p>User ID: {issue.userId}</p>
                  <p>Description: {issue.description}</p>
                  <p>Priority: {issue.priority}</p>
                </div>
                <div className="my-2"><Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge></div>
                <div className="text-sm space-y-1">
                  <p>Technician ID: {issue.technicianId || "-"}</p>
                  <p>Assigned By: {issue.assignedBy || "-"}</p>
                  <p>Resolution Note: {issue.resolutionNote || "-"}</p>
                </div>
                <IssueCommentsSection issueId={issue.id} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
