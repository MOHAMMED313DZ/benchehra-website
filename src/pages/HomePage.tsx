import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowLeft, ArrowRight, Trophy, Users, Dumbbell } from "lucide-react";
import AdBanner from "@/components/AdBanner";

const HomePage: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const [activities, setActivities] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("activities").select("*").eq("is_active", true).limit(3).then(({ data }) => setActivities(data || []));
    supabase.from("news").select("*").eq("is_active", true).order("publish_date", { ascending: false }).limit(3).then(({ data }) => setNewsItems(data || []));
    supabase.from("announcements").select("*").eq("is_active", true).order("publish_date", { ascending: false }).limit(5).then(({ data }) => setAnnouncements(data || []));
  }, []);

  const stats = [
    { icon: Trophy, valueAr: "+500", valueEn: "500+", labelAr: "رياضي مسجل", labelEn: "Registered Athletes" },
    { icon: Dumbbell, valueAr: "+6", valueEn: "6+", labelAr: "أنشطة رياضية", labelEn: "Sports Activities" },
    { icon: Users, valueAr: "+5", valueEn: "5+", labelAr: "مدرب محترف", labelEn: "Professional Coaches" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient diagonal-clip relative overflow-hidden" dir={dir}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMCBMNDAgNDAgTTQwIDAgTDAgNDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50"></div>
        <div className="container mx-auto px-4 py-24 md:py-36 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-primary-foreground mb-6 leading-tight animate-fade-in">
              {t.home.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {t.home.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Link to="/registration">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  {t.home.heroCta}
                  <Arrow className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/activities">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  {t.home.ourActivities}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Ad Banner */}
      <section className="container mx-auto px-4 mt-12 mb-4">
        <AdBanner placement="homepage_banner" />
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-16 relative z-20" dir={dir}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card rounded-xl p-6 card-shadow text-center hover:card-hover-shadow transition-shadow duration-300">
              <stat.icon className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-3xl font-black text-foreground">{lang === "ar" ? stat.valueAr : stat.valueEn}</p>
              <p className="text-muted-foreground text-sm mt-1">{lang === "ar" ? stat.labelAr : stat.labelEn}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Welcome */}
      <section className="container mx-auto px-4 py-20" dir={dir}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{t.home.welcomeTitle}</h2>
          <p className="text-muted-foreground leading-relaxed">{t.home.welcomeText}</p>
        </div>
      </section>

      {/* Activities Preview */}
      {activities.length > 0 && (
        <section className="bg-muted/50 py-16" dir={dir}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">{t.home.ourActivities}</h2>
              <Link to="/activities" className="text-primary font-medium hover:underline flex items-center gap-1">
                {t.home.viewAll} <Arrow className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div key={activity.activity_id} className="bg-card rounded-xl p-6 card-shadow hover:card-hover-shadow transition-all duration-300 group">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {lang === "ar" ? activity.title_ar : activity.title_en}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {lang === "ar" ? activity.description_ar : activity.description_en}
                  </p>
                  <Link to="/activities" className="text-primary text-sm font-semibold group-hover:underline">
                    {t.home.viewAll} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      {newsItems.length > 0 && (
        <section className="container mx-auto px-4 py-16" dir={dir}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">{t.home.latestNews}</h2>
            <Link to="/news" className="text-primary font-medium hover:underline flex items-center gap-1">
              {t.home.viewAll} <Arrow className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsItems.map((item) => (
              <article key={item.news_id} className="bg-card rounded-xl overflow-hidden card-shadow hover:card-hover-shadow transition-all duration-300">
                <div className="h-2 bg-primary"></div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span dir="ltr">{item.publish_date?.split("T")[0]}</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">
                    {lang === "ar" ? item.title_ar : item.title_en}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {lang === "ar" ? item.content_ar : item.content_en}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <section className="bg-accent/10 border-y border-accent/30 py-6" dir={dir}>
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold shrink-0">
                📢 {t.nav.announcements}
              </span>
              <p className="text-foreground font-medium text-sm">
                {lang === "ar" ? announcements[0]?.title_ar : announcements[0]?.title_en}
              </p>
              <Link to="/announcements" className="text-primary text-sm font-semibold hover:underline shrink-0">
                {t.home.viewAll}
              </Link>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default HomePage;
