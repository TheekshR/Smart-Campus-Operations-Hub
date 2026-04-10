import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Topbar({ role = "user" }) {
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
      <Toolbar>
        <Typography variant="h6" fontWeight="600">
          {titleMap[role] || "Smart Campus"}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}