import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";

export default function ViewResourcesPage() {
  const [resources, setResources] = useState([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [minCapacity, setMinCapacity] = useState("");

  const fetchResources = async () => {
    try {
      const response = await api.get("/api/resources", {
        params: {
          type: type || undefined,
          status: status || undefined,
          minCapacity: minCapacity || undefined,
        },
      });
      setResources(response.data);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [type, status, minCapacity]);

  return (
    <div>
      <PageHeader
        title="View Resources"
        subtitle="Browse available campus resources and filter them by type, status, and capacity."
      />

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="min-w-[220px]">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Types</option>
            <option value="LAB">LAB</option>
            <option value="LECTURE_HALL">LECTURE_HALL</option>
            <option value="MEETING_ROOM">MEETING_ROOM</option>
            <option value="EQUIPMENT">EQUIPMENT</option>
          </Select>
        </div>
        <div className="min-w-[220px]">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
          </Select>
        </div>
        <div className="min-w-[220px]">
          <Input
            type="number"
            placeholder="Minimum Capacity"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="overflow-hidden">
            {resource.hasImage && (
              <img
                src={`http://localhost:8081/api/resources/${resource.id}/image`}
                alt={resource.name}
                className="w-full h-44 object-cover block"
                loading="lazy"
              />
            )}
            <CardContent className="pt-4">
              <h3 className="text-lg font-bold">{resource.name}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>Type: {resource.type}</p>
                <p>Capacity: {resource.capacity}</p>
                <p>Location: {resource.location}</p>
                <p>Status: {resource.status}</p>
                <p>Available: {resource.availabilityStart || "-"} to {resource.availabilityEnd || "-"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
