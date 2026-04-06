import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Globe, LogIn, LogOut, User, LayoutDashboard } from "lucide-react";

const Header: React.FC = () => {
  const { lang, t, setLang, dir } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", label: t.nav.home },
    { path: "/activities", label: t.nav.activities },
    { path: "/gallery", label: t.nav.gallery },
    { path: "/news", label: t.nav.news },
    { path: "/announcements", label: t.nav.announcements },
    { path: "/team", label: t.nav.team },
    { path: "/testimonials", label: t.nav.testimonials },
    { path: "/registration", label: t.nav.registration },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      console.log("Header: Initiating sign out...");
      await signOut();
    } catch (error) {
      console.error("Header: Sign out error detected:", error);
    } finally {
      console.log("Header: Redirecting to home after sign out attempt");
      setIsSigningOut(false);
      setMobileOpen(false);
      navigate("/");
      // Force refresh to clear any lingering Supabase state if needed
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-primary/20 shadow-sm" dir={dir}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-lg">🏟️</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-primary-foreground font-bold text-sm leading-tight tracking-tight">{t.siteNameShort}</p>
              <p className="text-primary/70 text-[10px] font-medium">{t.location}</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-secondary-foreground/70 hover:text-primary hover:bg-primary/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* User actions */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-foreground text-xs font-bold hover:bg-primary/20 transition-all">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
                  </Link>
                )}
                <Link to="/my-activities" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-foreground text-xs font-bold hover:bg-white/10 transition-all">
                  <User className="w-3.5 h-3.5" />
                  {lang === "ar" ? "أنشطتي" : "My Activities"}
                </Link>
                <button 
                  type="button"
                  onClick={handleSignOut} 
                  disabled={isSigningOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-destructive/30 text-destructive text-xs font-bold hover:bg-destructive/10 transition-all disabled:opacity-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {isSigningOut ? (lang === "ar" ? "..." : "...") : (lang === "ar" ? "خروج" : "Sign Out")}
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95">
                <LogIn className="w-3.5 h-3.5" />
                {lang === "ar" ? "تسجيل دخول" : "Sign In"}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/20 text-primary-foreground text-xs font-bold hover:bg-primary/10 transition-all"
              title={lang === "ar" ? "Switch to English" : "تبديل للغة العربية"}
            >
              <Globe className="w-4 h-4 mr-0.5" />
              <span className="uppercase">{lang === "ar" ? "EN" : "AR"}</span>
            </button>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-primary-foreground hover:bg-primary/10 rounded-full transition-colors">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden pb-6 border-t border-primary/10 pt-4 space-y-2 animate-in fade-in slide-in-from-top-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive(item.path) ? "bg-primary text-primary-foreground" : "text-secondary-foreground/70 hover:bg-primary/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/report" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-bold text-accent bg-accent/5 hover:bg-accent/10 transition-all">
              {t.nav.report}
            </Link>
            <div className="border-t border-primary/10 my-4 pt-4"></div>
            {user ? (
              <div className="space-y-2">
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-all">
                    {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
                  </Link>
                )}
                <Link to="/my-activities" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-all">
                  {lang === "ar" ? "أنشطتي" : "My Activities"}
                </Link>
                <button 
                  type="button"
                  onClick={handleSignOut} 
                  disabled={isSigningOut}
                  className="block w-full text-start px-4 py-3 rounded-xl text-sm font-bold text-destructive bg-destructive/5 hover:bg-destructive/10 transition-all"
                >
                  {isSigningOut ? (lang === "ar" ? "تسجيل الخروج..." : "Signing out...") : (lang === "ar" ? "تسجيل الخروج" : "Sign Out")}
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-black text-primary-foreground bg-primary shadow-lg shadow-primary/20 text-center transition-all">
                {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
