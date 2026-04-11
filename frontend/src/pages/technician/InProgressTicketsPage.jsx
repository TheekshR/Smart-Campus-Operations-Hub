import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";
import IssueCommentsSection from "../../components/issues/IssueCommentsSection";

export default function InProgressTicketsPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [issues, setIssues] = useState([]);
  const [resourceMap, setResourceMap] = useState({});
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const fetchInProgressIssues = async () => {
    try {
      const [issuesRes, resourcesRes] = await Promise.all([
        api.get("/api/issues/status/IN_PROGRESS"),
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
      console.error("Failed to fetch in-progress issues:", error);
    }
  };

  useEffect(() => {
    if (currentUser) fetchInProgressIssues();
  }, [currentUser]);

  const openResolveDialog = (issueId) => {
    setSelectedIssueId(issueId);
    setResolutionNote("");
    setDialogOpen(true);
  };

  const closeResolveDialog = () => {
    setDialogOpen(false);
    setSelectedIssueId(null);
    setResolutionNote("");
  };

  const handleResolve = async () => {
    try {
      await api.put(`/api/issues/${selectedIssueId}/resolve`, null, {
        params: {
          technicianId: currentUser.id,
          resolutionNote,
        },
      });
      setMessage("Issue resolved successfully.");
      closeResolveDialog();
      fetchInProgressIssues();
    } catch (error) {
      console.error("Failed to resolve issue:", error);
      setMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to resolve issue."
      );
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader
        title="In Progress Tickets"
        subtitle="Manage issues currently being worked on."
      />

      {message && (
        <Alert
          variant={message.includes("successfully") ? "success" : "destructive"}
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

                <Button
                  variant="success"
                  className="mt-3"
                  onClick={() => openResolveDialog(issue.id)}
                >
                  Mark as Fixed
                </Button>
                <IssueCommentsSection issueId={issue.id} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeResolveDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Issue</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Resolution note..."
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            rows={3}
            className="mt-2"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={closeResolveDialog}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleResolve}
              disabled={!resolutionNote.trim()}
            >
              Confirm Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
