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
      <Card 
        sx={{ 
          width: "100%", 
          maxWidth: 460, 
          borderRadius: 4, 
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}
      >
        <CardContent sx={{ p: 5, textAlign: "center" }}>
          
          {/* Campus Logo and Title */}
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                margin: "0 auto",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                mb: 2,
              }}
            >
              <img
                src="/logo.png"
                alt="Campus Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
            
            <Typography
              variant="h5"
              fontWeight="700"
              letterSpacing="0.8px"
              sx={{
                color: "#000000",
                background: "linear-gradient(90deg, #000000, #444444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CAMPUS SYNC
            </Typography>
          </Box>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 5, px: 2 }}
          >
            Sign in or sign up using your Google account to continue.
          </Typography>

          <Stack spacing={2.5}>
            <Button
              variant="contained"
              size="large"
              onClick={handleGoogleAuth}
              sx={{
                py: 1.6,
                borderRadius: 2,
                bgcolor: "#000000",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "1.02rem",
                textTransform: "none",
                "&:hover": { bgcolor: "#222222" },
                display: "flex",
                alignItems: "center",
                gap: 2,
                justifyContent: "center",
              }}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                alt="Google" 
                style={{ width: 22, height: 22 }}
              />
              Sign In with Google
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleGoogleAuth}
              sx={{
                py: 1.6,
                borderRadius: 2,
                borderColor: "#000000",
                color: "#000000",
                fontWeight: 600,
                fontSize: "1.02rem",
                textTransform: "none",
                "&:hover": {
                  borderColor: "#000000",
                  bgcolor: "#f5f5f5",
                },
                display: "flex",
                alignItems: "center",
                gap: 2,
                justifyContent: "center",
              }}
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                alt="Google" 
                style={{ width: 22, height: 22 }}
              />
              Sign Up with Google
            </Button>
          </Stack>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 4, px: 3 }}
          >
            New users will automatically get an account created after Google authentication.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}