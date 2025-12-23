import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Lock, Mail, User, CheckCircle, RefreshCw } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", confirmPassword: "" });
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    if (session) {
      navigate("/");
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Account Exists",
          description: "This email is already registered. Please login instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      // Show success state with user ID
      setSignupSuccess(true);
      setNewUserId(data.user?.id || null);
      setUserEmail(signupData.email);

      toast({
        title: "Account Created Successfully!",
        description: `User ID: ${data.user?.id?.substring(0, 8)}... | Please check your email to confirm your account.`,
      });
    }
  };

  const handleResendConfirmation = async () => {
    if (!userEmail) return;

    setIsResendingEmail(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: userEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    setIsResendingEmail(false);

    if (error) {
      toast({
        title: "Resend Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Confirmation Email Sent!",
        description: "Please check your email inbox and spam folder.",
      });
    }
  };

  const resetSignupForm = () => {
    setSignupSuccess(false);
    setNewUserId(null);
    setUserEmail("");
    setSignupData({ email: "", password: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-warm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full gradient-warm flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Welcome</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Login or create an account to place and track your orders
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-foreground">
                    Email
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="admin@example.com"
                      className="pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-foreground">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="pl-10"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {signupSuccess ? (
                // Success screen with user ID and email confirmation
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Account Created Successfully!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your account has been created with the following details:
                    </p>
                  </div>

                  <Card className="bg-muted/50 border-border">
                    <CardContent className="pt-4">
                      <div className="space-y-2 text-left">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <span className="text-sm font-medium text-foreground">{userEmail}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">User ID:</span>
                          <span className="text-sm font-mono text-foreground">
                            {newUserId ? `${newUserId.substring(0, 8)}...` : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <span className="text-sm text-amber-600 font-medium">Pending Email Confirmation</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-left">
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          Email Confirmation Required
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                          We've sent a confirmation email to <strong>{userEmail}</strong>.
                          Please check your inbox and click the confirmation link to activate your account.
                        </p>
                        <p className="text-xs text-blue-600">
                          Don't forget to check your spam/junk folder if you don't see the email.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleResendConfirmation}
                      variant="outline"
                      className="w-full"
                      disabled={isResendingEmail}
                    >
                      {isResendingEmail ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Resend Confirmation Email
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={resetSignupForm}
                      variant="ghost"
                      className="w-full"
                    >
                      Create Another Account
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    After confirming your email, you can login and start placing orders!
                  </div>
                </div>
              ) : (
                // Regular signup form
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email" className="text-foreground">
                      Email
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="pl-10"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-foreground">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        placeholder="Create a password"
                        className="pl-10"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-confirm" className="text-foreground">
                      Confirm Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
                        className="pl-10"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
