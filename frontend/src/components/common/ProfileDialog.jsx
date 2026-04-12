import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import api from "../../api/axios";

export default function ProfileDialog({ open, onClose, user, onProfileUpdated }) {
  const [formData, setFormData] = useState({ phone: "", department: "", bio: "" });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState({});
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFormData({ phone: user.phone || "", department: user.department || "", bio: user.bio || "" });
      setNotificationsEnabled(user.notificationsEnabled ?? true);
      setNotificationPrefs(user.notificationPreferences || {});
      setMessage("");
      setSeverity("success");
    }
  }, [user, open]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTogglePref = (key) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const profileResponse = await api.put("/api/users/me", formData);

      await api.put("/api/users/me/notification-settings", {
        notificationsEnabled,
        notificationPreferences: notificationPrefs,
      });

      const refreshedUser = await api.get("/api/users/me");
      onProfileUpdated(refreshedUser.data || profileResponse.data);

      setMessage("Profile and notification settings updated successfully.");
      setSeverity("success");
    } catch (error) {
      console.error("Failed to update profile/settings:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update profile/settings.";
      setMessage(errorMessage);
      setSeverity("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>

        {user && (
          <div className="flex items-center gap-4 pb-4 mb-4 border-b">
            <Avatar src={user.picture} alt={user.name} className="h-16 w-16 border-2 border-primary" />
            <div>
              <h3 className="font-bold text-lg">{user.name}</h3>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <p className="text-muted-foreground text-sm">Role: <strong>{user.role}</strong></p>
            </div>
          </div>
        )}

        {message && (
          <Alert variant={severity === "error" ? "destructive" : "success"} className="mb-4">
            {message}
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" name="department" value={formData.department} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={4} />
          </div>
        </div>

        <div className="border-t my-4 pt-4">
          <h3 className="text-lg font-semibold mb-3">Notification Settings</h3>

          <Button
            variant={notificationsEnabled ? "default" : "outline"}
            size="sm"
            className="mb-3"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            {notificationsEnabled ? "Disable All Notifications" : "Enable Notifications"}
          </Button>

          <div className="space-y-2">
            {Object.keys(notificationPrefs).map((key) => (
              <div
                key={key}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <span className="text-sm">{key}</span>
                <Button
                  size="sm"
                  variant={notificationPrefs[key] ? "default" : "outline"}
                  onClick={() => handleTogglePref(key)}
                >
                  {notificationPrefs[key] ? "ON" : "OFF"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
