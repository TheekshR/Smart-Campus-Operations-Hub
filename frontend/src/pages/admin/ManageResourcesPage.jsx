import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

const initialForm = { name: "", type: "", capacity: "", location: "", status: "ACTIVE", availabilityStart: "", availabilityEnd: "" };

export default function ManageResourcesPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [resources, setResources] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchResources = async () => {
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const response = await api.get("/api/resources", { params });
      setResources(response.data || []);
    } catch (error) { console.error("Failed to fetch resources:", error); }
  };

  useEffect(() => { if (currentUser) fetchResources(); }, [currentUser, typeFilter, statusFilter]);

  const handleOpenCreate = () => { setEditingId(null); setFormData(initialForm); setSelectedImage(null); setFormErrors({}); setOpen(true); };
  const handleOpenEdit = (resource) => {
    setEditingId(resource.id);
    setFormData({
      name: resource.name || "",
      type: resource.type || "",
      capacity: String(resource.capacity || ""),
      location: resource.location || "",
      status: resource.status || "ACTIVE",
      availabilityStart: resource.availabilityStart || "",
      availabilityEnd: resource.availabilityEnd || "",
    });
    setSelectedImage(null); setFormErrors({}); setOpen(true);
  };
  const handleClose = () => { setOpen(false); setFormData(initialForm); setSelectedImage(null); setEditingId(null); setFormErrors({}); };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleImageChange = (e) => { setSelectedImage(e.target.files?.[0] || null); };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.type) errors.type = "Type is required.";
    if (!formData.capacity || Number(formData.capacity) < 1) errors.capacity = "Capacity must be at least 1.";
    if (!formData.location.trim()) errors.location = "Location is required.";
    if (!formData.status) errors.status = "Status is required.";
    if (formData.availabilityStart && formData.availabilityEnd && formData.availabilityStart >= formData.availabilityEnd) {
      errors.availabilityEnd = "End time must be after start time.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", formData.name.trim());
      form.append("type", formData.type);
      form.append("capacity", Number(formData.capacity));
      form.append("location", formData.location.trim());
      form.append("status", formData.status);
      form.append("availabilityStart", formData.availabilityStart || "");
      form.append("availabilityEnd", formData.availabilityEnd || "");
      if (selectedImage) form.append("image", selectedImage);
      if (editingId) {
        await api.put(`/api/resources/${editingId}`, form, { headers: { "Content-Type": "multipart/form-data" } });
        setMessage("Resource updated successfully.");
      } else {
        await api.post("/api/resources", form, { headers: { "Content-Type": "multipart/form-data" } });
        setMessage("Resource created successfully.");
      }
      handleClose(); fetchResources();
    } catch (error) {
      console.error("Failed to save resource:", error);
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to save resource.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/api/resources/${id}`); setMessage("Resource deleted successfully."); fetchResources(); } catch (error) {
      console.error("Failed to delete resource:", error);
      setMessage(error.response?.data?.error || error.response?.data?.message || "Failed to delete resource.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader title="Manage Resources" subtitle="Create, edit, delete, and monitor campus resources." />
      {message && <Alert variant={message.includes("successfully") ? "success" : "destructive"} className="mb-4">{message}</Alert>}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="min-w-[220px]">
          <option value="">All Types</option>
          <option value="LAB">LAB</option>
          <option value="LECTURE_HALL">LECTURE_HALL</option>
          <option value="MEETING_ROOM">MEETING_ROOM</option>
          <option value="EQUIPMENT">EQUIPMENT</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="min-w-[220px]">
          <option value="">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
        </Select>
        <Button onClick={handleOpenCreate}>+ ADD RESOURCE</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden hover:-translate-y-1 transition-transform">
            {resource.hasImage && (
              <img src={`http://localhost:8081/api/resources/${resource.id}/image`} alt={resource.name} className="w-full h-44 object-cover" loading="lazy" />
            )}
            <CardContent className="pt-4">
              <h3 className="text-lg font-bold mb-2">{resource.name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground mb-4">
                <p>Type: <strong className="text-foreground">{resource.type}</strong></p>
                <p>Capacity: <strong className="text-foreground">{resource.capacity}</strong></p>
                <p>Location: <strong className="text-foreground">{resource.location}</strong></p>
                <p>Status: <strong className="text-foreground">{resource.status}</strong></p>
                <p>Available: <strong className="text-foreground">{resource.availabilityStart || "-"} — {resource.availabilityEnd || "-"}</strong></p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(resource)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(resource.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit Resource" : "Add New Resource"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} />
              {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select name="type" value={formData.type} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="LAB">LAB</option>
                <option value="LECTURE_HALL">LECTURE_HALL</option>
                <option value="MEETING_ROOM">MEETING_ROOM</option>
                <option value="EQUIPMENT">EQUIPMENT</option>
              </Select>
              {formErrors.type && <p className="text-sm text-destructive">{formErrors.type}</p>}
            </div>
            <div className="space-y-1">
              <Label>Capacity</Label>
              <Input type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} />
              {formErrors.capacity && <p className="text-sm text-destructive">{formErrors.capacity}</p>}
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input name="location" value={formData.location} onChange={handleChange} />
              {formErrors.location && <p className="text-sm text-destructive">{formErrors.location}</p>}
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select name="status" value={formData.status} onChange={handleChange}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </Select>
              {formErrors.status && <p className="text-sm text-destructive">{formErrors.status}</p>}
            </div>
            <div className="space-y-1">
              <Label>Availability Start</Label>
              <Input type="time" name="availabilityStart" value={formData.availabilityStart} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label>Availability End</Label>
              <Input type="time" name="availabilityEnd" value={formData.availabilityEnd} onChange={handleChange} />
              {formErrors.availabilityEnd && <p className="text-sm text-destructive">{formErrors.availabilityEnd}</p>}
            </div>
            <div className="space-y-1">
              <Label>{selectedImage ? "Change Image" : "Upload Image"}</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
            {selectedImage && <p className="text-sm text-muted-foreground">Selected: {selectedImage.name}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Resource"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
