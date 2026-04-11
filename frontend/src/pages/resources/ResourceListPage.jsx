import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import PageHeader from "../../components/common/PageHeader";
import api from "../../api/axios";

export default function ResourceListPage() {
  const [resources, setResources] = useState([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const fetchResources = async () => {
    try {
      const response = await api.get("/api/resources", {
        params: {
          type: type || undefined,
          status: status || undefined,
        },
      });
      setResources(response.data);
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [type, status]);

  return (
    <div>
      <PageHeader
        title="Resources"
        subtitle="Browse and filter campus resources."
      />

      <div className="flex gap-3 mb-6">
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="min-w-[220px]"
        >
          <option value="">All Types</option>
          <option value="LAB">LAB</option>
          <option value="LECTURE_HALL">LECTURE_HALL</option>
          <option value="MEETING_ROOM">MEETING_ROOM</option>
          <option value="EQUIPMENT">EQUIPMENT</option>
        </Select>

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="min-w-[220px]"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold">{resource.name}</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p>Type: {resource.type}</p>
                <p>Capacity: {resource.capacity}</p>
                <p>Location: {resource.location}</p>
                <p>Status: {resource.status}</p>
                <p>
                  Available: {resource.availabilityStart || "-"} to{" "}
                  {resource.availabilityEnd || "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
