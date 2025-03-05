
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LockKeyhole } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // This is where we would normally make an API call to authenticate
      // For demo purposes, we'll simulate authentication
      const response = await new Promise<{success: boolean, isAdmin?: boolean}>((resolve) => {
        setTimeout(() => {
          // Basic authentication check (replace with actual API call)
          if (username === "admin" && password === "admin") {
            resolve({ success: true, isAdmin: true });
          } else if (username === "user" && password === "user") {
            resolve({ success: true, isAdmin: false });
          } else {
            resolve({ success: false });
          }
        }, 1000);
      });

      if (response.success) {
        toast.success("Login successful");
        if (response.isAdmin) {
          navigate("/admin");
        } else {
          navigate("/booking");
        }
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("An error occurred during login");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5 z-0"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" 
        }}
      />
      
      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="h-10 w-10" />
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-lg animate-scale-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-medium">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Please contact your administrator to reset your password.");
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2">Signing in</span>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            <p className="w-full">
              Demo credentials: "admin"/"admin" or "user"/"user"
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
