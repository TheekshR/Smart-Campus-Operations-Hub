import { Box, List, ListItemButton, ListItemText, Toolbar, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const menuByRole = {
  user: [
    { label: "Dashboard", path: "/user/dashboard" },
    { label: "View Resources", path: "/user/resources" },
    { label: "Book Resource", path: "/user/book-resource" },
    { label: "My Bookings", path: "/user/my-bookings" },
    { label: "Report Incident", path: "/user/report-incident" },
    { label: "My Tickets", path: "/user/my-tickets" },
    { label: "Notifications", path: "/user/notifications" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Manage Resources", path: "/admin/resources" },
    { label: "Booking Requests", path: "/admin/booking-requests" },
    { label: "All Bookings", path: "/admin/all-bookings" },
    { label: "All Issues", path: "/admin/all-issues" },
    { label: "Assign Technician", path: "/admin/assign-technician" },
    { label: "Notifications", path: "/admin/notifications" },
  ],
  technician: [
    { label: "Dashboard", path: "/technician/dashboard" },
    { label: "Assigned Tickets", path: "/technician/assigned-tickets" },
    { label: "In Progress Tickets", path: "/technician/in-progress-tickets" },
    { label: "Resolved Tickets", path: "/technician/resolved-tickets" },
    { label: "Notifications", path: "/technician/notifications" },
  ],
};

export default function Sidebar({ role = "user" }) {
  const location = useLocation();
  const links = menuByRole[role] || [];

  return (
    <Box
      sx={{
        width: 270,
        bgcolor: "#0a0a0a",
        color: "#ffffff",
        minHeight: "100vh",
        borderRight: "1px solid #1f1f1f",
        boxShadow: "4px 0 20px rgba(0, 0, 0, 0.6)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, #ffffff, transparent)",
          opacity: 0.15,
        },
      }}
    >
      <Toolbar
        sx={{
          borderBottom: "1px solid #1f1f1f",
          px: 3,
          py: 3.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* Campus Logo - Bigger and Above the Text */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "8px",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow: "0 0 20px rgba(255,255,255,0.25)",
            mb: 1,
          }}
        >
          <img
            src="/logo.png"        // Change if your logo filename is different
            alt="Campus Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          fontWeight="800"
          letterSpacing="0.6px"
          sx={{
            background: "linear-gradient(90deg, #ffffff, #cccccc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
          }}
        >
          CAMPUS SYNC
        </Typography>
      </Toolbar>

      <List sx={{ px: 2, py: 2 }}>
        {links.map((link) => (
          <ListItemButton
            key={link.path}
            component={Link}
            to={link.path}
            selected={location.pathname === link.path}
            sx={{
              color: "#e0e0e0",
              borderRadius: "12px",
              marginBottom: "6px",
              padding: "14px 20px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",

              "&:hover": {
                bgcolor: "#1a1a1a",
                transform: "translateX(8px)",
                boxShadow: "0 4px 15px rgba(255,255,255,0.08)",
              },

              "&.Mui-selected": {
                bgcolor: "#ffffff",
                color: "#000000",
                fontWeight: "600",
                boxShadow: "0 4px 20px rgba(255,255,255,0.15)",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "4px",
                  height: "60%",
                  bgcolor: "#000000",
                  borderRadius: "0 4px 4px 0",
                },
              },
            }}
          >
            <ListItemText 
              primary={link.label} 
              primaryTypographyProps={{
                fontSize: "15px",
                fontWeight: location.pathname === link.path ? 600 : 500,
                letterSpacing: "0.3px",
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}