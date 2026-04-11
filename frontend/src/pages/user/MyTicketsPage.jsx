import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";
import IssueCommentsSection from "../../components/issues/IssueCommentsSection";

export default function MyTicketsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;

      try {
        const [issuesRes, resourcesRes] = await Promise.all([
          api.get(`/api/issues/user/${currentUser.id}`),
          api.get("/api/resources"),
        ]);

        setIssues(issuesRes.data);

        const map = {};
        resourcesRes.data.forEach((resource) => {
          map[resource.id] = resource;
        });
        setResourceMap(map);
      } catch (err) {
        console.error("Failed to fetch user issues:", err);
      }
    };

    fetchData();
  }, [currentUser]);

  const getStatusVariant = (status) => {
    switch (status) {
      case "REPORTED":
        return "warning";
      case "ASSIGNED":
        return "info";
      case "IN_PROGRESS":
        return "default";
      case "FIXED":
        return "success";
      default:
        return "secondary";
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader
        title="My Tickets"
        subtitle="Track the issues you have reported and their current progress."
      />

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
                  <p>Description: {issue.description}</p>
                  <p>Priority: {issue.priority}</p>
                </div>

                <div className="my-2">
                  <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                </div>

                <div className="text-sm space-y-1">
                  <p>Technician ID: {issue.technicianId || "-"}</p>
                  <p>Assigned By: {issue.assignedBy || "-"}</p>
                  <p>Resolution Note: {issue.resolutionNote || "-"}</p>
                </div>

                {issue.imageCount > 0 && (
                  <div className={`mt-2 grid gap-1 ${issue.imageCount === 1 ? "grid-cols-1" : issue.imageCount === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {Array.from({ length: issue.imageCount }, (_, i) => (
                      <img key={i} src={`http://localhost:8081/api/issues/${issue.id}/images/${i}`} alt={`Issue evidence ${i + 1}`} className="w-full h-28 object-cover rounded border" loading="lazy" />
                    ))}
                  </div>
                )}

                <IssueCommentsSection issueId={issue.id} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
