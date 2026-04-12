import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ title, value }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  );
}
