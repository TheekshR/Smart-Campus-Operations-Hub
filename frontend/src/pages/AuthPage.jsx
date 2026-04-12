import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const handleGoogleAuth = () => {
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
      <Card className="w-full max-w-[460px] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
        <CardContent className="p-10 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden shadow-lg mb-4">
              <img src="/logo.png" alt="Campus Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-black to-gray-500 bg-clip-text text-transparent">
              CAMPUS SYNC
            </h1>
          </div>

          <p className="text-muted-foreground mb-8 px-4">
            Sign in or sign up using your Google account to continue.
          </p>

          <div className="space-y-3">
            <Button onClick={handleGoogleAuth} className="w-full py-5 text-base gap-3" size="lg">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
              Sign In with Google
            </Button>

            <Button variant="outline" onClick={handleGoogleAuth} className="w-full py-5 text-base gap-3" size="lg">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
              Sign Up with Google
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6 px-6">
            New users will automatically get an account created after Google authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
