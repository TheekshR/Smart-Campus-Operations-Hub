import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
      const response = roleFilter ? await api.get(`/api/users/role/${roleFilter}`) : await api.get("/api/users");
      setUsers(response.data || []);
    } catch (error) { console.error("Failed to fetch users:", error); setMessage("Failed to load users."); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const openRoleDialog = (user, newRole) => { setRoleChangeUser(user); setSelectedRole(newRole); setRoleDialogOpen(true); };
  const closeRoleDialog = () => { setRoleChangeUser(null); setSelectedRole(""); setRoleDialogOpen(false); };
  const confirmRoleChange = async () => {
    if (!roleChangeUser || !selectedRole) return;
    try { await api.put(`/api/users/${roleChangeUser.id}/role`, null, { params: { role: selectedRole } }); setMessage("User role updated successfully."); closeRoleDialog(); fetchUsers(); } catch (error) { console.error("Failed to update user role:", error); setMessage("Failed to update user role."); }
  };

  const openDeleteDialog = (user) => { setSelectedUser(user); setDeleteDialogOpen(true); };
  const closeDeleteDialog = () => { setSelectedUser(null); setDeleteDialogOpen(false); };
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try { await api.delete(`/api/users/${selectedUser.id}`); setMessage("User deleted successfully."); closeDeleteDialog(); fetchUsers(); } catch (error) { console.error("Failed to delete user:", error); setMessage("Failed to delete user."); }
  };

  const getRoleVariant = (role) => {
    switch (role) { case "ADMIN": return "destructive"; case "TECHNICIAN": return "warning"; case "USER": return "default"; default: return "secondary"; }
  };

  return (
    <div>
      <PageHeader title="Manage Users" subtitle="View users, update roles, and manage accounts securely." />
      {message && <Alert variant={message.includes("successfully") ? "success" : "destructive"} className="mb-4">{message}</Alert>}
      <div className="mb-4">
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="min-w-[220px]">
          <option value="">All</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="TECHNICIAN">TECHNICIAN</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const isSelf = currentUser?.id === user.id;
          const isAdmin = user.role === "ADMIN";
          return (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar src={user.picture} alt={user.name} />
                  <div>
                    <p className="font-bold">{user.name || "Unnamed User"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge variant={getRoleVariant(user.role)} className="mb-3">{user.role}</Badge>
                <div className="text-sm space-y-1 mb-3">
                  <p><strong>Phone:</strong> {user.phone || "-"}</p>
                  <p><strong>Department:</strong> {user.department || "-"}</p>
                </div>
                <Select value={user.role} onChange={(e) => openRoleDialog(user, e.target.value)} disabled={isAdmin || isSelf} className="mb-2">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                </Select>
                <Button variant="destructive" size="sm" className="w-full" onClick={() => openDeleteDialog(user)} disabled={isAdmin || isSelf}>Delete User</Button>
                {(isAdmin || isSelf) && (
                  <p className="text-xs text-muted-foreground mt-2">{isSelf ? "You cannot modify your own account." : "Admin accounts cannot be modified."}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={roleDialogOpen} onClose={closeRoleDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Role Change</DialogTitle></DialogHeader>
          <DialogDescription>Are you sure you want to change <strong>{roleChangeUser?.name || roleChangeUser?.email}</strong>'s role to <strong>{selectedRole}</strong>?</DialogDescription>
          <DialogFooter>
            <Button variant="ghost" onClick={closeRoleDialog}>Cancel</Button>
            <Button onClick={confirmRoleChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
          <DialogDescription>Are you sure you want to delete <strong>{selectedUser?.name || selectedUser?.email}</strong>?</DialogDescription>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDeleteDialog}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
