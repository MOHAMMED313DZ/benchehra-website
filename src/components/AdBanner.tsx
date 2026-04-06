import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdBannerProps {
  placement: string;
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ placement, className = "" }) => {
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const { data } = await (supabase as any)
        .from("ads")
        .select("*")
        .eq("placement", placement)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      
      if (data) setAd(data);
    };
    fetchAd();
  }, [placement]);

  if (!ad) return null;

  if (ad.ad_type === "script" && ad.script_code) {
    return (
      <div 
        className={`w-full flex justify-center my-8 overflow-hidden ${className}`}
        dangerouslySetInnerHTML={{ __html: ad.script_code }}
      />
    );
  }

  if (ad.ad_type === "manual" && ad.image_url) {
    return (
      <div className={`w-full my-8 ${className}`}>
        <a 
          href={ad.link_url || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full transition-transform hover:scale-[1.01] duration-500"
        >
          <img 
            src={ad.image_url} 
            alt={ad.title_en} 
            className="w-full h-auto rounded-3xl shadow-xl border border-primary/5" 
          />
        </a>
      </div>
    );
  }

  return null;
};

export default AdBanner;
