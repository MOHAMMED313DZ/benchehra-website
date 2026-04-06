import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, AlertCircle } from "lucide-react";

const AdminLoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4" dir={dir}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">
            {dir === "rtl" ? "تسجيل دخول المسؤول" : "Admin Login"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 card-shadow space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {dir === "rtl" ? "البريد الإلكتروني" : "Email"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                dir="ltr"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {dir === "rtl" ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                dir="ltr"
                required
              />
            </div>
          </div>

          <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
            {loading
              ? (dir === "rtl" ? "جارٍ الدخول..." : "Signing in...")
              : (dir === "rtl" ? "تسجيل الدخول" : "Sign In")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
