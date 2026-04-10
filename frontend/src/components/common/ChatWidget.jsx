import { useState, useRef, useEffect } from "react";
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Slide,
  CircularProgress,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function ChatWidget() {
  const { currentUser } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm the **Campus Sync Assistant**. Ask me anything about bookings, resources, incidents, or how to use the system!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [conversationId] = useState(
    () => "conv-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/chatbot/ask", {
        message: trimmed,
        conversationId,
        userId: currentUser?.id || "",
      });
      setMessages((prev) => [...prev, { role: "bot", text: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm having trouble connecting right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown bold rendering
  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i}>{part.slice(2, -2)}</strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      {!open && (
        <Fab
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            bgcolor: "#0a0a0a",
            color: "#fff",
            "&:hover": { bgcolor: "#222" },
            zIndex: 1300,
            width: 60,
            height: 60,
          }}
        >
          <ChatIcon />
        </Fab>
      )}

      {/* Chat Window */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 380,
            height: 520,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1300,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "#0a0a0a",
              color: "#fff",
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SmartToyIcon fontSize="small" />
              <Typography fontWeight={700} fontSize={15}>
                Campus Sync Assistant
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              bgcolor: "#f9fafb",
            }}
          >
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2.5,
                    bgcolor: msg.role === "user" ? "#0a0a0a" : "#fff",
                    color: msg.role === "user" ? "#fff" : "#1a1a1a",
                    boxShadow: msg.role === "bot" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  {renderText(msg.text)}
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ alignSelf: "flex-start", px: 2, py: 1 }}>
                <CircularProgress size={20} sx={{ color: "#666" }} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 1.5,
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              gap: 1,
              bgcolor: "#fff",
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: 14,
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!input.trim() || loading}
              sx={{
                bgcolor: "#0a0a0a",
                color: "#fff",
                "&:hover": { bgcolor: "#222" },
                "&.Mui-disabled": { bgcolor: "#ccc", color: "#888" },
                borderRadius: 2,
                width: 40,
                height: 40,
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Slide>
    </>
  );
}
