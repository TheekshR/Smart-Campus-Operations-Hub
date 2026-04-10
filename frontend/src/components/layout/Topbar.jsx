import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button,
} from "@mui/material";
import api from "../../api/axios";
import ProfileDialog from "../common/ProfileDialog";

export default function Topbar({ role = "user" }) {
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const titleMap = {
    user: "User Portal",
    admin: "Admin Portal",
    technician: "Technician Portal",
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/users/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "white",
          color: "#111827",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="600">
            {titleMap[role] || "Smart Campus"}
          </Typography>

          {user && (
            <Button
              onClick={() => setProfileOpen(true)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                textTransform: "none",
                color: "#111827",
                borderRadius: 999,
                px: 1.5,
              }}
            >
              <Avatar src={user.picture} alt={user.name} />
              <Box sx={{ textAlign: "left" }}>
                <Typography fontWeight="600" sx={{ lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                  {user.role}
                </Typography>
              </Box>
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <ProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onProfileUpdated={(updatedUser) => setUser(updatedUser)}
      />
    </>
  );
}