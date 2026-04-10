import { Box, Card, CardContent, Typography, Button, Stack } from "@mui/material";

export default function AuthPage() {
  const handleGoogleAuth = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 460, borderRadius: 4, boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Smart Campus
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sign in or sign up using your Google account to continue.
          </Typography>

          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGoogleAuth}
              sx={{
                py: 1.4,
                borderRadius: 2,
                bgcolor: "#000000",
                "&:hover": { bgcolor: "#222222" },
              }}
            >
              Sign In with Google
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleGoogleAuth}
              sx={{
                py: 1.4,
                borderRadius: 2,
                borderColor: "#000000",
                color: "#000000",
                "&:hover": {
                  borderColor: "#000000",
                  bgcolor: "#f5f5f5",
                },
              }}
            >
              Sign Up with Google
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            New users will automatically get an account created after Google authentication.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}