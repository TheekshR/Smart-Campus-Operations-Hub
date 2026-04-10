import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function ManageUsers() {
  const { currentUser } = useCurrentUser();

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [message, setMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const fetchUsers = async () => {
    try {
      const response = roleFilter
        ? await api.get(`/api/users/role/${roleFilter}`)
        : await api.get("/api/users");

      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setMessage("Failed to load users.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const openRoleDialog = (user, newRole) => {
    setRoleChangeUser(user);
    setSelectedRole(newRole);
    setRoleDialogOpen(true);
  };

  const closeRoleDialog = () => {
    setRoleChangeUser(null);
    setSelectedRole("");
    setRoleDialogOpen(false);
  };

  const confirmRoleChange = async () => {
    if (!roleChangeUser || !selectedRole) return;

    try {
      await api.put(`/api/users/${roleChangeUser.id}/role`, null, {
        params: { role: selectedRole },
      });

      setMessage("User role updated successfully.");
      closeRoleDialog();
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user role:", error);
      setMessage("Failed to update user role.");
    }
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setSelectedUser(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await api.delete(`/api/users/${selectedUser.id}`);
      setMessage("User deleted successfully.");
      closeDeleteDialog();
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setMessage("Failed to delete user.");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "error";
      case "TECHNICIAN":
        return "warning";
      case "USER":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <PageHeader
        title="Manage Users"
        subtitle="View users, update roles, and manage accounts securely."
      />

      {message && (
        <Alert
          severity={message.includes("successfully") ? "success" : "error"}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Filter by Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="USER">USER</MenuItem>
          <MenuItem value="ADMIN">ADMIN</MenuItem>
          <MenuItem value="TECHNICIAN">TECHNICIAN</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={3}>
        {users.map((user) => {
          const isSelf = currentUser?.id === user.id;
          const isAdmin = user.role === "ADMIN";

          return (
            <Grid item xs={12} md={6} lg={4} key={user.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar src={user.picture} alt={user.name} />
                    <Box>
                      <Typography fontWeight="bold">
                        {user.name || "Unnamed User"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="body2">
                    <strong>Phone:</strong> {user.phone || "-"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Department:</strong> {user.department || "-"}
                  </Typography>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Change Role"
                    value={user.role}
                    onChange={(e) => openRoleDialog(user, e.target.value)}
                    sx={{ mt: 2 }}
                    disabled={isAdmin || isSelf}
                  >
                    <MenuItem value="USER">USER</MenuItem>
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                    <MenuItem value="TECHNICIAN">TECHNICIAN</MenuItem>
                  </TextField>

                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => openDeleteDialog(user)}
                    disabled={isAdmin || isSelf}
                  >
                    Delete User
                  </Button>

                  {(isAdmin || isSelf) && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1 }}
                    >
                      {isSelf
                        ? "You cannot modify your own account."
                        : "Admin accounts cannot be modified."}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={roleDialogOpen} onClose={closeRoleDialog}>
        <DialogTitle>Confirm Role Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change{" "}
            <strong>{roleChangeUser?.name || roleChangeUser?.email}</strong>'s role to{" "}
            <strong>{selectedRole}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRoleDialog}>Cancel</Button>
          <Button variant="contained" onClick={confirmRoleChange}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{selectedUser?.name || selectedUser?.email}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}