import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, Film, X } from "lucide-react";

// Helper: Extract YouTube video ID from URL
function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
  return match?.[1] || "";
}

const GalleryPage: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const [activeAlbum, setActiveAlbum] = useState<number | null>(null);
  const [albums, setAlbums] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("photo_albums").select("*").order("album_id").then(({ data }) => setAlbums(data || []));
    supabase.from("photos").select("*").order("photo_id").then(({ data }) => setPhotos(data || []));
    supabase.from("videos").select("*").order("video_id", { ascending: false }).then(({ data }) => setVideos(data || []));
  }, []);

  const filtered = activeAlbum ? photos.filter((p) => p.album_id === activeAlbum) : photos;

  return (
    <Layout>
      <section className="hero-gradient py-16" dir={dir}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">{t.gallery.title}</h1>
          <p className="text-primary-foreground/70">{t.gallery.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12" dir={dir}>
        {/* Photos / Videos tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setTab("photos")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              tab === "photos"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            {lang === "ar" ? `الصور (${photos.length})` : `Photos (${photos.length})`}
          </button>
          <button
            onClick={() => setTab("videos")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
              tab === "videos"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}
          >
            <Film className="w-5 h-5" />
            {lang === "ar" ? `الفيديوهات (${videos.length})` : `Videos (${videos.length})`}
          </button>
        </div>

        {/* PHOTOS TAB */}
        {tab === "photos" && (
          <>
            {/* Album filters */}
            <div className="flex flex-wrap gap-3 mb-10 justify-center">
              <button
                onClick={() => setActiveAlbum(null)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${activeAlbum === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
              >
                {t.activities.filterAll}
              </button>
              {albums.map((album) => (
                <button
                  key={album.album_id}
                  onClick={() => setActiveAlbum(album.album_id)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${activeAlbum === album.album_id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}
                >
                  {lang === "ar" ? album.title_ar : album.title_en}
                </button>
              ))}
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((photo) => (
                  <div 
                    key={photo.photo_id} 
                    className="aspect-square rounded-xl overflow-hidden card-shadow hover:card-hover-shadow transition-all duration-300 cursor-pointer group relative"
                    onClick={() => setLightbox(photo.photo_url)}
                  >
                    <img src={photo.photo_url} alt={lang === "ar" ? photo.caption_ar : photo.caption_en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {(photo.caption_ar || photo.caption_en) && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm">{lang === "ar" ? photo.caption_ar : photo.caption_en}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>{lang === "ar" ? "لا توجد صور حالياً" : "No photos available yet"}</p>
              </div>
            )}
          </>
        )}

        {/* VIDEOS TAB */}
        {tab === "videos" && (
          <>
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => {
                  const isYouTube = video.video_url.includes("youtube.com") || video.video_url.includes("youtu.be");
                  const youtubeId = isYouTube ? extractYouTubeId(video.video_url) : "";
                  
                  return (
                    <div key={video.video_id} className="bg-card rounded-xl overflow-hidden card-shadow hover:card-hover-shadow transition-all duration-300">
                      <div className="aspect-video relative">
                        {isYouTube ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            className="w-full h-full"
                            allowFullScreen
                            title={lang === "ar" ? video.title_ar : video.title_en}
                          />
                        ) : (
                          <video
                            src={video.video_url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-foreground mb-1">{lang === "ar" ? video.title_ar : video.title_en}</h3>
                        {(video.description_ar || video.description_en) && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{lang === "ar" ? video.description_ar : video.description_en}</p>
                        )}
                        {video.upload_date && (
                          <p className="text-xs text-muted-foreground mt-2" dir="ltr">{video.upload_date.split("T")[0]}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Film className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>{lang === "ar" ? "لا توجد فيديوهات حالياً" : "No videos available yet"}</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Lightbox for photos */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10" onClick={() => setLightbox(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </Layout>
  );
};

export default GalleryPage;
