import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";

const UserLoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const { dir } = useLanguage();
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
      navigate("/my-activities");
    }
  };

  return (
    <Layout>
      <section className="hero-gradient py-16" dir={dir}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">
            {dir === "rtl" ? "تسجيل الدخول" : "Sign In"}
          </h1>
          <p className="text-primary-foreground/70">
            {dir === "rtl" ? "ادخل إلى حسابك لإدارة أنشطتك" : "Access your account to manage your activities"}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12" dir={dir}>
        <div className="max-w-md mx-auto bg-card rounded-xl p-8 card-shadow">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" dir="ltr" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {dir === "rtl" ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" dir="ltr" required />
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
              {loading
                ? (dir === "rtl" ? "جارٍ الدخول..." : "Signing in...")
                : (dir === "rtl" ? "تسجيل الدخول" : "Sign In")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {dir === "rtl" ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
            <Link to="/registration" className="text-primary font-medium hover:underline">
              {dir === "rtl" ? "سجّل الآن" : "Register Now"}
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default UserLoginPage;
