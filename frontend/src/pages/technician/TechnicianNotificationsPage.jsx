import { Box, Card, CardContent, Typography } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";

export default function TechnicianNotificationsPage() {
  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Technician notifications will be connected after Member 4 backend is ready."
      />
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography>Notifications backend is still pending.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}