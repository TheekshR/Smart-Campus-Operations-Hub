import { AppBar, Toolbar, Typography, Box, Avatar } from "@mui/material";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function Topbar({ role = "user" }) {
  const { currentUser } = useCurrentUser();

  const titleMap = {
    user: "User Portal",
    admin: "Admin Portal",
    technician: "Technician Portal",
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ bgcolor: "white", color: "#111827", borderBottom: "1px solid #e5e7eb" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="600">
          {titleMap[role] || "Smart Campus"}
        </Typography>

        {currentUser && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2">
              {currentUser.name} ({currentUser.role})
            </Typography>
            <Avatar src={currentUser.picture} alt={currentUser.name} />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}