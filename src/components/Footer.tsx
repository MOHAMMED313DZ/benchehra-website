import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer: React.FC = () => {
  const { t, dir } = useLanguage();

  return (
    <footer className="bg-secondary text-secondary-foreground" dir={dir}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact */}
          <div>
            <h3 className="text-primary font-bold text-lg mb-4">{t.footer.contactUs}</h3>
            <div className="space-y-3 text-secondary-foreground/70 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>حي بلحوت التومي بلدية الإدريسية</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span dir="ltr">+213 XX XX XX XX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>ccspe17@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-primary font-bold text-lg mb-4">{t.footer.quickLinks}</h3>
            <div className="space-y-2 text-sm">
              <Link to="/activities" className="block text-secondary-foreground/70 hover:text-primary transition-colors">
                {t.nav.activities}
              </Link>
              <Link to="/registration" className="block text-secondary-foreground/70 hover:text-primary transition-colors">
                {t.nav.registration}
              </Link>
              <Link to="/news" className="block text-secondary-foreground/70 hover:text-primary transition-colors">
                {t.nav.news}
              </Link>
              <Link to="/report" className="block text-secondary-foreground/70 hover:text-primary transition-colors">
                {t.nav.report}
              </Link>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-primary font-bold text-lg mb-4">{t.siteNameShort}</h3>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed">
              {t.home.welcomeText}
            </p>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-6 text-center text-secondary-foreground/50 text-sm">
          © {new Date().getFullYear()} {t.siteName}. {t.footer.rights}.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
