import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";
import IssueCommentsSection from "../../components/issues/IssueCommentsSection";

export default function ResolvedTicketsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});

  const fetchResolvedIssues = async () => {
    try {
      const [issuesRes, resourcesRes] = await Promise.all([
        api.get("/api/issues/status/FIXED"),
        api.get("/api/resources"),
      ]);

      const filteredIssues = (issuesRes.data || []).filter(
        (issue) => issue.technicianId === currentUser?.id
      );

      setIssues(filteredIssues);

      const map = {};
      (resourcesRes.data || []).forEach((r) => {
        map[r.id] = r;
      });
      setResourceMap(map);
    } catch (error) {
      console.error("Failed to fetch resolved issues:", error);
    }
  };

  useEffect(() => {
    if (currentUser) fetchResolvedIssues();
  }, [currentUser]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader
        title="Resolved Tickets"
        subtitle="View issues you have completed."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => {
          const resource = resourceMap[issue.resourceId];

          return (
            <Card key={issue.id}>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold">
                  Issue #{issue.id?.slice(-6)}
                </h3>

                <div className="mt-2 space-y-1 text-sm">
                  <p>Resource: {resource ? resource.name : issue.resourceId}</p>
                  <p>Location: {resource ? resource.location : "-"}</p>
                  <p>User ID: {issue.userId}</p>
                  <p>Description: {issue.description}</p>
                  <p>Priority: {issue.priority}</p>
                </div>

                <div className="my-2">
                  <Badge variant="success">{issue.status}</Badge>
                </div>

                <p className="text-sm">
                  Resolution Note: {issue.resolutionNote || "-"}
                </p>
                <IssueCommentsSection issueId={issue.id} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
