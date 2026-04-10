import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
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
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  useEffect(() => {
    if (issueId) {
      fetchComments();
    }
  }, [issueId]);

  const handleAddComment = async () => {
    if (!newMessage.trim()) return;

    try {
      await api.post(`/api/issues/${issueId}/comments`, {
        message: newMessage,
      });
      setNewMessage("");
      setError("");
      fetchComments();
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to add comment."
      );
    }
  };

  const handleStartEdit = (comment) => {
    setEditingId(comment.id);
    setEditingMessage(comment.message);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingMessage("");
  };

  const handleUpdateComment = async () => {
    if (!editingMessage.trim()) return;

    try {
      await api.put(`/api/issues/comments/${editingId}`, {
        message: editingMessage,
      });
      setEditingId(null);
      setEditingMessage("");
      setError("");
      fetchComments();
    } catch (err) {
      console.error("Failed to update comment:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update comment."
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/api/issues/comments/${commentId}`);
      setError("");
      fetchComments();
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete comment."
      );
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
        Comments
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}

      <Stack spacing={1.5}>
        {comments.map((comment) => {
          const isOwner = currentUser?.id === comment.userId;
          const isAdmin = currentUser?.role === "ADMIN";

          return (
            <Card key={comment.id} variant="outlined">
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" fontWeight="bold">
                  {comment.userName} ({comment.userRole})
                </Typography>

                {editingId === comment.id ? (
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      value={editingMessage}
                      onChange={(e) => setEditingMessage(e.target.value)}
                    />
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button size="small" variant="contained" onClick={handleUpdateComment}>
                        Save
                      </Button>
                      <Button size="small" variant="outlined" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {comment.message}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {comment.updatedAt
                        ? `Updated: ${comment.updatedAt}`
                        : `Created: ${comment.createdAt}`}
                    </Typography>

                    {(isOwner || isAdmin) && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {isOwner && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleStartEdit(comment)}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </Button>
                      </Stack>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Add Comment"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button sx={{ mt: 1 }} variant="contained" onClick={handleAddComment}>
          Add Comment
        </Button>
      </Box>
    </Box>
  );
}