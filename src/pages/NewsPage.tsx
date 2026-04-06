import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowRight, ArrowLeft } from "lucide-react";

const NewsPage: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const [newsItems, setNewsItems] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("news").select("*").order("publish_date", { ascending: false }).then(({ data }) => setNewsItems(data || []));
  }, []);

  return (
    <Layout>
      <section className="hero-gradient py-16" dir={dir}>
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-white/80 text-[10px] uppercase font-bold tracking-widest mb-4 backdrop-blur-sm">
            {lang === "ar" ? "آخر الأخبار" : "Latest Updates"}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-primary-foreground mb-4 tracking-tight">{t.news.title}</h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">{t.news.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20" dir={dir}>
        {newsItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {newsItems.map((item) => (
              <article key={item.news_id} className="bg-card rounded-3xl overflow-hidden card-shadow hover:card-hover-shadow transition-all duration-500 group border border-primary/5 flex flex-col h-full active:scale-95">
                <div className="h-60 relative overflow-hidden shrink-0">
                  {item.featured_image_url ? (
                    <img src={item.featured_image_url} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-12 text-center">
                      <span className="text-7xl opacity-40 group-hover:scale-110 transition-transform duration-500">📰</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-muted-foreground" dir="ltr">{item.publish_date?.split("T")[0]}</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {lang === "ar" ? item.title_ar : item.title_en}
                  </h2>
                  <p className="text-muted-foreground/80 text-sm leading-relaxed line-clamp-4 mb-6 flex-1">
                    {lang === "ar" ? item.content_ar : item.content_en}
                  </p>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider group/link mt-auto">
                    <span>{lang === "ar" ? "قراءة المزيد" : "Read More"}</span>
                    {dir === "rtl" ? <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" /> : <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 opacity-40">
             <p className="text-xl font-medium tracking-wide italic">{lang === "ar" ? "لا توجد أخبار حالياً" : "Current feed is empty"}</p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default NewsPage;
