import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, AlertTriangle } from "lucide-react";

const AnnouncementsPage: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("announcements").select("*").order("publish_date", { ascending: false }).then(({ data }) => setAnnouncements(data || []));
  }, []);

  return (
    <Layout>
      <section className="hero-gradient py-16" dir={dir}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">{t.announcements.title}</h1>
          <p className="text-primary-foreground/70">{t.announcements.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12" dir={dir}>
        {announcements.length > 0 ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {announcements.map((item) => (
              <div key={item.announcement_id} className="bg-card rounded-xl p-6 card-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span dir="ltr">{item.publish_date?.split("T")[0]}</span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground mb-2">
                      {lang === "ar" ? item.title_ar : item.title_en}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {lang === "ar" ? item.content_ar : item.content_en}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">{lang === "ar" ? "لا توجد إعلانات حالياً" : "No announcements available"}</p>
        )}
      </section>
    </Layout>
  );
};

export default AnnouncementsPage;
