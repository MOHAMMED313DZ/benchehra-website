import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Dumbbell, Newspaper, Megaphone, Users, MessageSquare,
  ClipboardList, AlertTriangle, LogOut, Globe, Menu, X, Image
} from "lucide-react";
import AdminActivities from "./AdminActivities";
import AdminNews from "./AdminNews";
import AdminAnnouncements from "./AdminAnnouncements";
import AdminTeam from "./AdminTeam";
import AdminTestimonials from "./AdminTestimonials";
import AdminRegistrations from "./AdminRegistrations";
import AdminReports from "./AdminReports";
import AdminGallery from "./AdminGallery";

const sections = [
  { key: "activities", icon: Dumbbell, labelAr: "الأنشطة", labelEn: "Activities" },
  { key: "news", icon: Newspaper, labelAr: "الأخبار", labelEn: "News" },
  { key: "announcements", icon: Megaphone, labelAr: "الإعلانات", labelEn: "Announcements" },
  { key: "team", icon: Users, labelAr: "الفريق", labelEn: "Team" },
  { key: "gallery", icon: Image, labelAr: "المعرض", labelEn: "Gallery" },
  { key: "testimonials", icon: MessageSquare, labelAr: "الشهادات", labelEn: "Testimonials" },
  { key: "registrations", icon: ClipboardList, labelAr: "التسجيلات", labelEn: "Registrations" },
  { key: "reports", icon: AlertTriangle, labelAr: "البلاغات", labelEn: "Reports" },
];

const AdminDashboard: React.FC = () => {
  const { isAdmin, loading, signOut } = useAuth();
  const { lang, setLang, dir } = useLanguage();
  const [active, setActive] = useState("activities");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Sign out error:", error);
      navigate("/admin/login");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const renderContent = () => {
    switch (active) {
      case "activities": return <AdminActivities />;
      case "news": return <AdminNews />;
      case "announcements": return <AdminAnnouncements />;
      case "team": return <AdminTeam />;
      case "gallery": return <AdminGallery />;
      case "testimonials": return <AdminTestimonials />;
      case "registrations": return <AdminRegistrations />;
      case "reports": return <AdminReports />;
      default: return <AdminActivities />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background" dir={dir}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 ${dir === "rtl" ? "right-0" : "left-0"} z-40 w-64 bg-secondary text-secondary-foreground shadow-2xl lg:shadow-none transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : (dir === "rtl" ? "translate-x-full" : "-translate-x-full")} lg:static lg:block`}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              {lang === "ar" ? "لوحة التحكم" : "Admin Panel"}
            </span>
          </div>
        </div>
        <nav className="p-4 space-y-1 h-[calc(100vh-180px)] overflow-y-auto">
          {sections.map((s) => (
            <button
              type="button"
              key={s.key}
              onClick={() => { setActive(s.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active === s.key
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-secondary-foreground/60 hover:bg-white/5 hover:text-secondary-foreground"
              }`}
            >
              <s.icon className="w-4 h-4" />
              {lang === "ar" ? s.labelAr : s.labelEn}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-secondary/80 backdrop-blur-sm border-t border-white/5 space-y-2">
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-secondary-foreground/60 hover:bg-white/5 hover:text-secondary-foreground transition-all"
          >
            <Globe className="w-4 h-4" />
            {lang === "ar" ? "English" : "العربية"}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {lang === "ar" ? "تسجيل الخروج" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card/50 backdrop-blur-md border-b h-16 flex items-center px-6 gap-4 sticky top-0 z-20">
          <button type="button" className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg text-foreground">
              {sections.find((s) => s.key === active)?.[lang === "ar" ? "labelAr" : "labelEn"]}
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              {lang === "ar" ? "إدارة المحتوى" : "Content Management"}
            </p>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
