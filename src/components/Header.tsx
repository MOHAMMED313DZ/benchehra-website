import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, Globe, LogIn, LogOut, User, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const { lang, t, setLang, dir } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
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
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-primary/20" dir={dir}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">🏟️</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-primary-foreground font-bold text-sm leading-tight">{t.siteNameShort}</p>
              <p className="text-primary/80 text-xs">{t.location}</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-primary/20 text-primary"
                    : "text-secondary-foreground/80 hover:text-primary hover:bg-primary/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* User actions */}
            {user ? (
              <div className="hidden sm:flex items-center gap-1">
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/30 text-primary-foreground text-sm font-medium hover:bg-primary/10 transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    {dir === "rtl" ? "لوحة التحكم" : "Dashboard"}
                  </Link>
                )}
                <Link to="/my-activities" className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/30 text-primary-foreground text-sm font-medium hover:bg-primary/10 transition-colors">
                  <User className="w-4 h-4" />
                  {dir === "rtl" ? "أنشطتي" : "My Activities"}
                </Link>
                <button onClick={handleSignOut} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                  {dir === "rtl" ? "خروج" : "Sign Out"}
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/30 text-primary-foreground text-sm font-medium hover:bg-primary/10 transition-colors">
                <LogIn className="w-4 h-4" />
                {dir === "rtl" ? "دخول" : "Sign In"}
              </Link>
            )}

            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/30 text-primary-foreground text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {lang === "ar" ? "EN" : "AR"}
            </button>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-primary-foreground">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden pb-4 border-t border-primary/20 pt-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path) ? "bg-primary/20 text-primary" : "text-secondary-foreground/80 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/report" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-md text-sm font-medium text-accent hover:bg-accent/10">
              {t.nav.report}
            </Link>
            <hr className="border-primary/20 my-2" />
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-md text-sm font-medium text-primary hover:bg-primary/10">
                    {dir === "rtl" ? "لوحة التحكم" : "Dashboard"}
                  </Link>
                )}
                <Link to="/my-activities" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-md text-sm font-medium text-primary hover:bg-primary/10">
                  {dir === "rtl" ? "أنشطتي" : "My Activities"}
                </Link>
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="block w-full text-start px-4 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10">
                  {dir === "rtl" ? "تسجيل الخروج" : "Sign Out"}
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-md text-sm font-medium text-primary hover:bg-primary/10">
                {dir === "rtl" ? "تسجيل الدخول" : "Sign In"}
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
