import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

const TeamPage: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const [filter, setFilter] = useState<string>("all");
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("staff").select("*").order("staff_id").then(({ data }) => setMembers(data || []));
  }, []);

  const categories = [
    { key: "all", label: t.activities.filterAll },
    { key: "management", label: t.team.management },
    { key: "coach", label: t.team.coaches },
    { key: "staff", label: t.team.staff },
  ];

  const filtered = filter === "all" ? members : members.filter((m) => m.category === filter);

  return (
    <Layout>
      <section className="hero-gradient py-16" dir={dir}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">{t.team.title}</h1>
          <p className="text-primary-foreground/70">{t.team.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12" dir={dir}>
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${filter === c.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((member) => (
              <div key={member.staff_id} className="bg-card rounded-xl p-6 card-shadow text-center hover:card-hover-shadow transition-all duration-300">
                {member.photo_url ? (
                  <img src={member.photo_url} alt="" className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                )}
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {lang === "ar" ? member.full_name_ar : member.full_name_en}
                </h3>
                <p className="text-primary text-sm font-semibold mb-3">
                  {lang === "ar" ? member.position_ar : member.position_en}
                </p>
                <p className="text-muted-foreground text-sm">
                  {lang === "ar" ? member.bio_ar : member.bio_en}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">{lang === "ar" ? "لا يوجد أعضاء حالياً" : "No team members available"}</p>
        )}
      </section>
    </Layout>
  );
};

export default TeamPage;
