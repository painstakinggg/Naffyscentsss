import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Lock, Mail, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";

const ADMIN_EMAIL = "painstaking.web@gmail.com";

export default function AdminSetup() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/bootstrap-admin", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ email: ADMIN_EMAIL, token, password, full_name: "NAFFY SCENTS Administrator" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to set up administrator access.");
      await checkUserAuth();
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to complete setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout icon={ShieldCheck} title="Administrator setup" subtitle="Create the temporary store administrator account">
      <div className="mb-5 rounded-lg border border-gold/20 bg-gold/5 p-3 text-sm text-cream/70">
        This one-time setup is available only while the store has no existing user accounts.
      </div>
      {error && <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Administrator email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input id="admin-email" type="email" value={ADMIN_EMAIL} readOnly className="h-12 pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="setup-token">One-time setup token</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input id="setup-token" type="password" autoComplete="off" placeholder="Enter your Cloudflare setup secret" value={token} onChange={(e) => setToken(e.target.value)} className="h-12 pl-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Create password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input id="admin-password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} placeholder="At least 12 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10 pr-10" required />
            <Button type="button" variant="ghost" size="icon" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <div className="relative">
            <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} placeholder="Enter the password again" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-12 pr-10" required />
            <Button type="button" variant="ghost" size="icon" aria-label={showConfirmPassword ? "Hide password" : "Show password"} onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground">
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button type="submit" className="h-12 w-full font-medium" disabled={loading || !token || !password || !confirmPassword}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating administrator...</> : "Create administrator account"}
        </Button>
      </form>
      <p className="mt-5 text-center text-xs text-cream/45">
        <Link to="/login" className="text-primary hover:underline">Return to normal login</Link>
      </p>
    </AuthLayout>
  );
}
