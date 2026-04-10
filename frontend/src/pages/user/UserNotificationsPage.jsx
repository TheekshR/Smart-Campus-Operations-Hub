import { Box, Card, CardContent, Typography } from "@mui/material";
import PageHeader from "../../components/common/PageHeader";

export default function UserNotificationsPage() {
  return (
    <Box>
      <PageHeader title="Notifications" subtitle="View booking and ticket updates." />
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography>Notifications UI will be connected after Member 4 backend details are added.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}