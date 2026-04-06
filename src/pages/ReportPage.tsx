import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

const ReportPage: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [issueType, setIssueType] = useState("maintenance");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const locations = lang === "ar"
    ? ["الملعب الرئيسي", "قاعة الرياضات", "المسبح", "قاعة التدريب", "المرافق العامة"]
    : ["Main Field", "Sports Hall", "Swimming Pool", "Training Room", "Public Facilities"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert([{
      issue_type: issueType,
      location: location || locations[0],
      description: description.trim(),
      reporter_info: anonymous ? null : contactInfo.trim() || null,
    }]);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center" dir={dir}>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {lang === "ar" ? "تم إرسال البلاغ بنجاح" : "Report submitted successfully"}
            </h2>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="hero-gradient py-16" dir={dir}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">{t.report.title}</h1>
          <p className="text-primary-foreground/70">{t.report.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12" dir={dir}>
        <div className="max-w-2xl mx-auto bg-card rounded-xl p-8 card-shadow">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.report.issueType} *</label>
              <select value={issueType} onChange={(e) => setIssueType(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="maintenance">{t.report.maintenance}</option>
                <option value="safety">{t.report.safety}</option>
                <option value="conduct">{t.report.conduct}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.report.locationLabel} *</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.report.description} *</label>
              <Textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="anonymous" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="accent-primary" />
              <label htmlFor="anonymous" className="text-sm text-muted-foreground cursor-pointer">{t.report.anonymous}</label>
            </div>
            {!anonymous && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t.report.contactInfo}</label>
                <Input dir="ltr" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder={lang === "ar" ? "رقم الهاتف أو البريد الإلكتروني" : "Phone or email"} />
              </div>
            )}
            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={submitting}>
              {submitting ? "..." : t.report.submitReport}
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default ReportPage;
