import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function IssueCommentsSection({ issueId }) {
  const { currentUser } = useCurrentUser();
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [error, setError] = useState("");

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/issues/${issueId}/comments`);
      setComments(res.data || []);
    } catch (err) { console.error("Failed to fetch comments:", err); }
  };

  useEffect(() => { if (issueId) fetchComments(); }, [issueId]);

  const handleAddComment = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.post(`/api/issues/${issueId}/comments`, { message: newMessage });
      setNewMessage(""); setError(""); fetchComments();
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to add comment.");
    }
  };

  const handleStartEdit = (comment) => { setEditingId(comment.id); setEditingMessage(comment.message); };
  const handleCancelEdit = () => { setEditingId(null); setEditingMessage(""); };

  const handleUpdateComment = async () => {
    if (!editingMessage.trim()) return;
    try {
      await api.put(`/api/issues/comments/${editingId}`, { message: editingMessage });
      setEditingId(null); setEditingMessage(""); setError(""); fetchComments();
    } catch (err) {
      console.error("Failed to update comment:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/api/issues/comments/${commentId}`);
      setError(""); fetchComments();
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to delete comment.");
    }
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Comments</h4>
      {error && <p className="text-destructive text-sm mb-2">{error}</p>}

      <div className="space-y-2">
        {comments.map((comment) => {
          const isOwner = currentUser?.id === comment.userId;
          const isAdmin = currentUser?.role === "ADMIN";

          return (
            <Card key={comment.id} className="border">
              <CardContent className="py-3 px-4">
                <p className="text-sm font-semibold">{comment.userName} ({comment.userRole})</p>

                {editingId === comment.id ? (
                  <div className="mt-2">
                    <Textarea value={editingMessage} onChange={(e) => setEditingMessage(e.target.value)} rows={2} />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={handleUpdateComment}>Save</Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm mt-1">{comment.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {comment.updatedAt ? `Updated: ${comment.updatedAt}` : `Created: ${comment.createdAt}`}
                    </p>
                    {(isOwner || isAdmin) && (
                      <div className="flex gap-2 mt-2">
                        {isOwner && <Button size="sm" variant="outline" onClick={() => handleStartEdit(comment)}>Edit</Button>}
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteComment(comment.id)}>Delete</Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4">
        <Textarea placeholder="Add Comment" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={2} />
        <Button className="mt-2" onClick={handleAddComment}>Add Comment</Button>
      </div>
    </div>
  );
}
