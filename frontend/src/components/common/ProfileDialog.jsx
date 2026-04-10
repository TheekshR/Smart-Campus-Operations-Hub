import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import api from "../../api/axios";

export default function ProfileDialog({ open, onClose, user, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    phone: "",
    department: "",
    bio: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || "",
        department: user.department || "",
        bio: user.bio || "",
      });
      setMessage("");
      setMessageType("");
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await api.put("/api/users/me", formData);
      onProfileUpdated(response.data);
      
      // Show success message clearly
      setMessage("Profile updated successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update profile.";
      
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { 
          borderRadius: 3, 
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          bgcolor: "#ffffff"
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          fontWeight: 700, 
          fontSize: "1.4rem", 
          pb: 1,
          borderBottom: "1px solid #f0f0f0"
        }}
      >
        My Profile
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3 }}>
        {user && (
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 3, 
              mb: 4,
              pb: 3,
              borderBottom: "1px solid #f0f0f0"
            }}
          >
            <Avatar 
              src={user.picture} 
              alt={user.name} 
              sx={{ 
                width: 72, 
                height: 72, 
                border: "3px solid #000000",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
              }} 
            />
            <Box>
              <Typography 
                variant="h6" 
                fontWeight="700" 
                sx={{ color: "#000000", mb: 0.5 }}
              >
                {user.name}
              </Typography>
              <Typography 
                sx={{ color: "#555555", fontSize: "0.95rem" }}
              >
                {user.email}
              </Typography>
              <Typography 
                sx={{ color: "#555555", fontSize: "0.95rem", mt: 0.3 }}
              >
                Role: <strong>{user.role}</strong>
              </Typography>
            </Box>
          </Box>
        )}

        {/* Prominent Message Alert */}
        {message && (
          <Alert
            severity={messageType === "success" ? "success" : "error"}
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              fontSize: "0.98rem",
              fontWeight: 500,
              "& .MuiAlert-icon": { fontSize: "1.5rem" }
            }}
          >
            {message}
          </Alert>
        )}

        <Box sx={{ display: "grid", gap: 2.5 }}>
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2 }
            }}
          />
          <TextField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2 }
            }}
          />
          <TextField
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={4}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2 }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: "#666666", 
            fontWeight: 500,
            px: 3
          }}
        >
          Close
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave} 
          disabled={saving}
          sx={{
            bgcolor: "#000000",
            color: "#ffffff",
            px: 4,
            py: 1.2,
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { bgcolor: "#333333" },
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}