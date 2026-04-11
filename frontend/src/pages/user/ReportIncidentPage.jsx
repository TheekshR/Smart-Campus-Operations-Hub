import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";
import useCurrentUser from "../../hooks/useCurrentUser";

export default function ReportIncidentPage() {
  const { currentUser, loading, error } = useCurrentUser();
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    resourceId: "",
    description: "",
    priority: "",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await api.get("/api/resources");
        setResources(response.data.filter((resource) => resource.status === "ACTIVE"));
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      }
    };

    fetchResources();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 3) {
      setMessage("You can upload up to 3 images only.");
      return;
    }

    setMessage("");
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const form = new FormData();
      form.append("resourceId", formData.resourceId);
      form.append("userId", currentUser.id);
      form.append("description", formData.description);
      form.append("priority", formData.priority);

      selectedImages.forEach((file) => {
        form.append("images", file);
      });

      await api.post("/api/issues", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Issue reported successfully.");
      setFormData({
        resourceId: "",
        description: "",
        priority: "",
      });
      setSelectedImages([]);
    } catch (err) {
      console.error("Issue creation failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to report issue. Please check your inputs.";
      setMessage(errorMessage);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6">{error}</div>;

  return (
    <div>
      <PageHeader
        title="Report Incident"
        subtitle="Report a facility or resource issue for maintenance attention."
      />

      <Card>
        <CardContent className="pt-6">
          {message && (
            <Alert variant={message.includes("successfully") ? "success" : "destructive"} className="mb-4">
              {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resourceId">Resource</Label>
              <Select name="resourceId" value={formData.resourceId} onChange={handleChange} required>
                <option value="">Select resource...</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - {resource.location}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" value={formData.priority} onChange={handleChange} required>
                <option value="">Select priority...</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload Up To 3 Images</Label>
              <Input type="file" multiple accept="image/*" onChange={handleImageChange} />
            </div>

            {selectedImages.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Selected Images:</p>
                {selectedImages.map((file, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    {file.name}
                  </p>
                ))}
              </div>
            )}

            <Button type="submit">Submit Issue</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
