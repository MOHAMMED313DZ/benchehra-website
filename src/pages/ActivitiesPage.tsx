import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Users } from "lucide-react";

const ActivitiesPage: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const [filter, setFilter] = useState<string>("all");
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("activities").select("*").eq("is_active", true).order("activity_id").then(({ data }) => setActivities(data || []));
  }, []);

  const categories = [...new Set(activities.map((a) => lang === "ar" ? a.category_ar : a.category_en))];
  const filtered = filter === "all" ? activities : activities.filter((a) => (lang === "ar" ? a.category_ar : a.category_en) === filter);

  return (
    <Layout>
      <section className="hero-gradient py-16" dir={dir}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">{t.activities.title}</h1>
          <p className="text-primary-foreground/70">{t.activities.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12" dir={dir}>
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
          >
            {t.activities.filterAll}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((activity) => (
            <div key={activity.activity_id} className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-primary/5">
              <div className="h-48 relative overflow-hidden shrink-0">
                <img 
                  src={activity.image_url || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt="" 
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary/90 text-primary-foreground text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-sm shadow-lg">
                    {lang === "ar" ? activity.category_ar : activity.category_en}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                  {lang === "ar" ? activity.title_ar : activity.title_en}
                </h2>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                  {lang === "ar" ? activity.description_ar : activity.description_en}
                </p>
                <div className="space-y-3 text-sm mb-6 bg-muted/30 p-4 rounded-xl">
                  {activity.schedule_info_ar && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium">{lang === "ar" ? activity.schedule_info_ar : activity.schedule_info_en}</span>
                    </div>
                  )}
                  {activity.target_audience_ar && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium">{t.activities.ageGroup}: {lang === "ar" ? activity.target_audience_ar : activity.target_audience_en}</span>
                    </div>
                  )}
                </div>
                <Link to="/registration" className="block w-full">
                  <Button variant="hero" className="w-full group/btn shadow-lg shadow-primary/20">
                    {t.activities.registerNow}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-24 opacity-50">
             <p className="text-lg font-medium">{lang === "ar" ? "لا توجد أنشطة حالياً" : "No activities available"}</p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ActivitiesPage;
