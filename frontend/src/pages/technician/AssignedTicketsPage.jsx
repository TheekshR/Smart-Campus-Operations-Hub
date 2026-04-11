import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";
import IssueCommentsSection from "../../components/issues/IssueCommentsSection";

export default function AssignedTicketsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});
  const [message, setMessage] = useState("");

  const fetchAssignedIssues = async () => {
    try {
      const [issuesRes, resourcesRes] = await Promise.all([
        api.get("/api/issues/status/ASSIGNED"),
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
      console.error("Failed to fetch assigned issues:", error);
    }
  };

  useEffect(() => {
    if (currentUser) fetchAssignedIssues();
  }, [currentUser]);

  const handleStart = async (issueId) => {
    try {
      await api.put(`/api/issues/${issueId}/start`, null, {
        params: { technicianId: currentUser.id },
      });
      setMessage("Issue moved to IN_PROGRESS.");
      fetchAssignedIssues();
    } catch (error) {
      console.error("Failed to start issue:", error);
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to start issue."
      );
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader
        title="Assigned Tickets"
        subtitle="View issues assigned to you and start progress."
      />

      {message && (
        <Alert
          variant={message.includes("IN_PROGRESS") ? "success" : "destructive"}
          className="mb-4"
        >
          {message}
        </Alert>
      )}

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
                  <p>Status: {issue.status}</p>
                </div>

                <Button className="mt-3" onClick={() => handleStart(issue.id)}>
                  Start Progress
                </Button>
                <IssueCommentsSection issueId={issue.id} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
