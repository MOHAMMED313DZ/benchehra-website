import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MyActivitiesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { lang, dir } = useLanguage();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [enrolled, setEnrolled] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [{ data: acts }, { data: enr }] = await Promise.all([
        supabase.from("activities").select("*").eq("is_active", true),
        supabase.from("user_activities").select("*, activities(*)").eq("user_id", user.id),
      ]);
      setActivities(acts || []);
      setEnrolled(enr || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const enroll = async (activityId: number) => {
    if (!user) return;
    const { error } = await supabase.from("user_activities").insert({ user_id: user.id, activity_id: activityId });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(dir === "rtl" ? "تم التسجيل بنجاح" : "Enrolled successfully");
    const { data } = await supabase.from("user_activities").select("*, activities(*)").eq("user_id", user.id);
    setEnrolled(data || []);
  };

  const unenroll = async (activityId: number) => {
    if (!user) return;
    const { error } = await supabase.from("user_activities").delete().eq("user_id", user.id).eq("activity_id", activityId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(dir === "rtl" ? "تم إلغاء التسجيل" : "Unenrolled successfully");
    setEnrolled((prev) => prev.filter((e) => e.activity_id !== activityId));
  };

  const enrolledIds = new Set(enrolled.map((e) => e.activity_id));
  const available = activities.filter((a) => !enrolledIds.has(a.activity_id));

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="hero-gradient py-16" dir={dir}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">
            {dir === "rtl" ? "أنشطتي" : "My Activities"}
          </h1>
          <p className="text-primary-foreground/70">
            {dir === "rtl" ? "إدارة الأنشطة الرياضية المسجّل فيها" : "Manage your enrolled sports activities"}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12" dir={dir}>
        {/* Enrolled Activities */}
        <h2 className="text-xl font-bold text-foreground mb-4">
          {dir === "rtl" ? "الأنشطة المسجّل فيها" : "Enrolled Activities"}
        </h2>
        {enrolled.length === 0 ? (
          <p className="text-muted-foreground mb-8">
            {dir === "rtl" ? "لم تسجّل في أي نشاط بعد" : "You haven't enrolled in any activities yet"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {enrolled.map((e) => (
              <div key={e.id} className="bg-card rounded-xl p-5 card-shadow flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {lang === "ar" ? e.activities?.title_ar : e.activities?.title_en}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "ar" ? e.activities?.category_ar : e.activities?.category_en}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => unenroll(e.activity_id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Available Activities */}
        <h2 className="text-xl font-bold text-foreground mb-4">
          {dir === "rtl" ? "الأنشطة المتاحة" : "Available Activities"}
        </h2>
        {available.length === 0 ? (
          <p className="text-muted-foreground">
            {dir === "rtl" ? "أنت مسجّل في جميع الأنشطة المتاحة" : "You're enrolled in all available activities"}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((a) => (
              <div key={a.activity_id} className="bg-card rounded-xl p-5 card-shadow">
                <h3 className="font-semibold text-foreground mb-1">
                  {lang === "ar" ? a.title_ar : a.title_en}
                </h3>
                <p className="text-xs text-muted-foreground mb-1">
                  {lang === "ar" ? a.category_ar : a.category_en}
                </p>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {lang === "ar" ? a.description_ar : a.description_en}
                </p>
                <Button variant="hero" size="sm" onClick={() => enroll(a.activity_id)} className="gap-1">
                  <Plus className="w-4 h-4" />
                  {dir === "rtl" ? "التسجيل" : "Enroll"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default MyActivitiesPage;
