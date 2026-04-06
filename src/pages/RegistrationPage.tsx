import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

const RegistrationPage: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activityId, setActivityId] = useState("");

  useEffect(() => {
    supabase.from("activities").select("activity_id, title_ar, title_en").eq("is_active", true).then(({ data }) => setActivities(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    if (password.length < 6) {
      toast.error(dir === "rtl" ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);

    // Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    if (authError) {
      toast.error(authError.message);
      setSubmitting(false);
      return;
    }

    // Also insert into registrations table for admin tracking
    await supabase.from("registrations").insert([{
      full_name: fullName.trim(),
      date_of_birth: dob,
      phone_number: phone.trim(),
      email: email.trim(),
      activity_id: activityId ? parseInt(activityId) : null,
    }]);

    // Enroll in selected activity if user was created
    if (authData.user && activityId) {
      await supabase.from("user_activities").insert({
        user_id: authData.user.id,
        activity_id: parseInt(activityId),
      });
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center" dir={dir}>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t.registration.success}</h2>
            <p className="text-muted-foreground mb-4">
              {dir === "rtl" ? "يمكنك الآن تسجيل الدخول وإدارة أنشطتك" : "You can now sign in and manage your activities"}
            </p>
            <Button variant="hero" onClick={() => navigate("/my-activities")}>
              {dir === "rtl" ? "أنشطتي" : "My Activities"}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="hero-gradient py-16" dir={dir}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">{t.registration.title}</h1>
          <p className="text-primary-foreground/70">{t.registration.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12" dir={dir}>
        <div className="max-w-2xl mx-auto bg-card rounded-xl p-8 card-shadow">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.registration.fullName} *</label>
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t.registration.dob} *</label>
                <Input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t.registration.phone} *</label>
                <Input type="tel" required dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.registration.email} *</label>
              <Input type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {dir === "rtl" ? "كلمة المرور" : "Password"} *
              </label>
              <Input type="password" dir="ltr" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={dir === "rtl" ? "6 أحرف على الأقل" : "At least 6 characters"} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.registration.activity}</label>
              <select
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t.registration.selectActivity}</option>
                {activities.map((a) => (
                  <option key={a.activity_id} value={a.activity_id}>
                    {lang === "ar" ? a.title_ar : a.title_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-primary" />
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">{t.registration.terms}</label>
            </div>

            <Button variant="hero" size="lg" className="w-full" disabled={!agreed || submitting} type="submit">
              {submitting ? "..." : t.registration.submit}
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default RegistrationPage;
