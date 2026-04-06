import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Save, Upload, Image, Film } from "lucide-react";
import { toast } from "sonner";

const AdminGallery: React.FC = () => {
  const { lang } = useLanguage();
  const [albums, setAlbums] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<any | null>(null);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [tab, setTab] = useState<"albums" | "photos" | "videos">("albums");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [a, p, v] = await Promise.all([
        supabase.from("photo_albums").select("*").order("album_id"),
        supabase.from("photos").select("*, photo_albums(title_ar, title_en)").order("photo_id"),
        supabase.from("videos").select("*").order("video_id", { ascending: false }),
      ]);
      setAlbums(a.data || []);
      setPhotos(p.data || []);
      setVideos(v.data || []);
    } catch (error: any) {
      console.error("Fetch gallery error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Upload file (Image or Video) to Supabase Storage ---
  const uploadFile = async (file: File, folder: "photos" | "videos"): Promise<string | null> => {
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
      const filePath = `${folder}/${fileName}`;
      
      const { error } = await supabase.storage.from("media").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
      return urlData?.publicUrl || null;
    } catch (error: any) {
      console.error("Upload error:", error.message);
      toast.error(lang === "ar" ? "فشل الرفع. يرجى التأكد من صلاحيات المخزن أو استخدام رابط خارجي" : "Upload failed. Check storage bucket setup or use external URL.");
      return null;
    }
  };

  // --- Handle file selection ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Size check: Image max 5MB, Video max 50MB (Supabase default free limit is 50MB)
    const limit = type === "image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > limit) {
      toast.error(lang === "ar" 
        ? `حجم الملف كبير جداً (الحد الأقصى ${type === "image" ? "5" : "50"}MB)` 
        : `File too large (max ${type === "image" ? "5" : "50"}MB)`);
      return;
    }

    setUploading(true);
    const folder = type === "image" ? "photos" : "videos";
    const url = await uploadFile(file, folder);
    setUploading(false);
    
    if (url) {
      if (type === "image") {
        setEditingPhoto({ ...editingPhoto, photo_url: url });
      } else {
        setEditingVideo({ ...editingVideo, video_url: url });
      }
      toast.success(lang === "ar" ? "تم الرفع بنجاح" : "Uploaded successfully");
    }
  };

  // --- ALBUM CRUD ---
  const saveAlbum = async () => {
    if (!editingAlbum.title_ar || !editingAlbum.title_en) { toast.error(lang === "ar" ? "العنوان مطلوب" : "Title required"); return; }
    setSaving(true);
    try {
      const payload = { title_ar: editingAlbum.title_ar, title_en: editingAlbum.title_en, description_ar: editingAlbum.description_ar || "", description_en: editingAlbum.description_en || "" };
      if (isNew) {
        const { error } = await supabase.from("photo_albums").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("photo_albums").update(payload).eq("album_id", editingAlbum.album_id);
        if (error) throw error;
      }
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved"); setEditingAlbum(null); setIsNew(false); fetchData();
    } catch (error: any) {
      console.error("Save album error:", error.message);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // --- PHOTO CRUD ---
  const savePhoto = async () => {
    if (!editingPhoto.photo_url) { toast.error(lang === "ar" ? "الرابط مطلوب" : "URL required"); return; }
    setSaving(true);
    try {
      const payload = { photo_url: editingPhoto.photo_url, caption_ar: editingPhoto.caption_ar || "", caption_en: editingPhoto.caption_en || "", album_id: editingPhoto.album_id || null };
      if (isNew) {
        const { error } = await supabase.from("photos").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("photos").update(payload).eq("photo_id", editingPhoto.photo_id);
        if (error) throw error;
      }
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved"); setEditingPhoto(null); setIsNew(false); fetchData();
    } catch (error: any) {
      console.error("Save photo error:", error.message);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // --- VIDEO CRUD ---
  const saveVideo = async () => {
    if (!editingVideo.title_ar || !editingVideo.title_en) { toast.error(lang === "ar" ? "العنوان مطلوب" : "Title required"); return; }
    if (!editingVideo.video_url) { toast.error(lang === "ar" ? "رابط الفيديو مطلوب" : "Video URL required"); return; }
    setSaving(true);
    try {
      const payload = { 
        title_ar: editingVideo.title_ar, 
        title_en: editingVideo.title_en, 
        video_url: editingVideo.video_url, 
        description_ar: editingVideo.description_ar || null, 
        description_en: editingVideo.description_en || null 
      };
      if (isNew) {
        const { error } = await supabase.from("videos").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("videos").update(payload).eq("video_id", editingVideo.video_id);
        if (error) throw error;
      }
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved"); setEditingVideo(null); setIsNew(false); fetchData();
    } catch (error: any) {
      console.error("Save video error:", error.message);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeAlbum = async (id: number) => { 
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return; 
    try {
      const { error } = await supabase.from("photo_albums").delete().eq("album_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted"); fetchData(); 
    } catch (error: any) {
      console.error("Delete album error:", error.message);
      toast.error(error.message);
    }
  };
  const removePhoto = async (id: number) => { 
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return; 
    try {
      const { error } = await supabase.from("photos").delete().eq("photo_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted"); fetchData(); 
    } catch (error: any) {
      console.error("Delete photo error:", error.message);
      toast.error(error.message);
    }
  };
  const removeVideo = async (id: number) => { 
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return; 
    try {
      const { error } = await supabase.from("videos").delete().eq("video_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted"); fetchData(); 
    } catch (error: any) {
      console.error("Delete video error:", error.message);
      toast.error(error.message);
    }
  };

  // --- ALBUM EDIT FORM ---
  if (editingAlbum) {
    return (
      <div className="max-w-lg mx-auto bg-card rounded-xl p-6 card-shadow">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold">{isNew ? (lang === "ar" ? "إضافة ألبوم" : "Add Album") : (lang === "ar" ? "تعديل الألبوم" : "Edit Album")}</h2>
          <button type="button" onClick={() => { setEditingAlbum(null); setIsNew(false); }} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "العنوان (عربي)" : "Title (AR)"}</label><Input value={editingAlbum.title_ar} onChange={(e) => setEditingAlbum({ ...editingAlbum, title_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "العنوان (إنجليزي)" : "Title (EN)"}</label><Input value={editingAlbum.title_en} onChange={(e) => setEditingAlbum({ ...editingAlbum, title_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الوصف (عربي)" : "Description (AR)"}</label><Textarea value={editingAlbum.description_ar || ""} onChange={(e) => setEditingAlbum({ ...editingAlbum, description_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الوصف (إنجليزي)" : "Description (EN)"}</label><Textarea value={editingAlbum.description_en || ""} onChange={(e) => setEditingAlbum({ ...editingAlbum, description_en: e.target.value })} dir="ltr" /></div>
          </div>
          <Button type="button" onClick={saveAlbum} className="w-full" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ" : "Save")}
          </Button>
        </div>
      </div>
    );
  }

  // --- PHOTO EDIT FORM ---
  if (editingPhoto) {
    return (
      <div className="max-w-lg mx-auto bg-card rounded-xl p-6 card-shadow border border-primary/10">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold">{isNew ? (lang === "ar" ? "إضافة صورة" : "Add Photo") : (lang === "ar" ? "تعديل الصورة" : "Edit Photo")}</h2>
          <button type="button" onClick={() => { setEditingPhoto(null); setIsNew(false); }} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{lang === "ar" ? "صورة" : "Image"}</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading || saving}
                />
                <div className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/30 rounded-lg p-6 text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all ${uploading || saving ? "opacity-50" : "cursor-pointer"}`}>
                  <Upload className="w-8 h-8 text-primary/50 mb-1" />
                  {uploading 
                    ? (lang === "ar" ? "جارٍ الرفع..." : "Uploading...") 
                    : (lang === "ar" ? "اختر صورة (JPG, PNG)" : "Choose image (JPG, PNG)")}
                  <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "أو اسحب المف هنا" : "or drag and drop"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-muted" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{lang === "ar" ? "أو" : "OR"}</span>
                <div className="flex-1 border-t border-muted" />
              </div>
              <Input 
                value={editingPhoto.photo_url} 
                onChange={(e) => setEditingPhoto({ ...editingPhoto, photo_url: e.target.value })} 
                dir="ltr" 
                placeholder="https://example.com/image.jpg"
                disabled={uploading || saving}
              />
              {editingPhoto.photo_url && (
                <div className="relative mt-2 rounded-lg overflow-hidden border bg-black/5 aspect-video flex items-center justify-center">
                  <img src={editingPhoto.photo_url} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button type="button" onClick={() => setEditingPhoto({...editingPhoto, photo_url: ""})}className="bg-destructive text-destructive-foreground p-1 rounded-md shadow-sm opacity-80 hover:opacity-100"><X className="w-3 h-3" /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "التسمية (عربي)" : "Caption (AR)"}</label><Input value={editingPhoto.caption_ar || ""} onChange={(e) => setEditingPhoto({ ...editingPhoto, caption_ar: e.target.value })} disabled={uploading || saving} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "التسمية (إنجليزي)" : "Caption (EN)"}</label><Input value={editingPhoto.caption_en || ""} onChange={(e) => setEditingPhoto({ ...editingPhoto, caption_en: e.target.value })} dir="ltr" disabled={uploading || saving} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{lang === "ar" ? "الألبوم" : "Album"}</label>
            <select value={editingPhoto.album_id || ""} onChange={(e) => setEditingPhoto({ ...editingPhoto, album_id: e.target.value ? parseInt(e.target.value) : null })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" disabled={uploading || saving}>
              <option value="">{lang === "ar" ? "بدون ألبوم" : "No album"}</option>
              {albums.map((a) => <option key={a.album_id} value={a.album_id}>{lang === "ar" ? a.title_ar : a.title_en}</option>)}
            </select>
          </div>
          <Button type="button" onClick={savePhoto} className="w-full" disabled={uploading || saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ" : "Save")}
          </Button>
        </div>
      </div>
    );
  }

  // --- VIDEO EDIT FORM ---
  if (editingVideo) {
    return (
      <div className="max-w-lg mx-auto bg-card rounded-xl p-6 card-shadow border border-primary/10">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold">{isNew ? (lang === "ar" ? "إضافة فيديو" : "Add Video") : (lang === "ar" ? "تعديل الفيديو" : "Edit Video")}</h2>
          <button type="button" onClick={() => { setEditingVideo(null); setIsNew(false); }} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "العنوان (عربي)" : "Title (AR)"}</label><Input value={editingVideo.title_ar} onChange={(e) => setEditingVideo({ ...editingVideo, title_ar: e.target.value })} disabled={saving} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "العنوان (إنجليزي)" : "Title (EN)"}</label><Input value={editingVideo.title_en} onChange={(e) => setEditingVideo({ ...editingVideo, title_en: e.target.value })} dir="ltr" disabled={saving} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">{lang === "ar" ? "فيديو" : "Video"}</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, "video")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading || saving}
                />
                <div className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/30 rounded-lg p-6 text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all ${uploading || saving ? "opacity-50" : "cursor-pointer"}`}>
                  <Film className="w-8 h-8 text-primary/50 mb-1" />
                  {uploading 
                    ? (lang === "ar" ? "جارٍ الرفع..." : "Uploading...") 
                    : (lang === "ar" ? "اختر فيديو (MP4, WebM)" : "Choose video (MP4, WebM)")}
                  <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "أو اسحب الملف هنا" : "or drag and drop"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-muted" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{lang === "ar" ? "أو" : "OR"}</span>
                <div className="flex-1 border-t border-muted" />
              </div>
              <Input 
                value={editingVideo.video_url} 
                onChange={(e) => setEditingVideo({ ...editingVideo, video_url: e.target.value })} 
                dir="ltr" 
                placeholder="YouTube link or direct MP4 URL"
                disabled={uploading || saving}
              />
              {editingVideo.video_url && !saving && (
                <div className="mt-3 rounded-lg overflow-hidden border bg-black shadow-inner">
                  {editingVideo.video_url.includes("youtube.com") || editingVideo.video_url.includes("youtu.be") ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeId(editingVideo.video_url)}`}
                      className="w-full aspect-video"
                      allowFullScreen
                    />
                  ) : (
                    <video src={editingVideo.video_url} controls className="w-full max-h-48" />
                  )}
                  <div className="p-2 bg-muted/20 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground truncate max-w-[80%]">{editingVideo.video_url}</span>
                    <button type="button" onClick={() => setEditingVideo({...editingVideo, video_url: ""})} className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الوصف (عربي)" : "Description (AR)"}</label><Textarea value={editingVideo.description_ar || ""} onChange={(e) => setEditingVideo({ ...editingVideo, description_ar: e.target.value })} disabled={saving} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الوصف (إنجليزي)" : "Description (EN)"}</label><Textarea value={editingVideo.description_en || ""} onChange={(e) => setEditingVideo({ ...editingVideo, description_en: e.target.value })} dir="ltr" disabled={saving} /></div>
          </div>
          <Button type="button" onClick={saveVideo} className="w-full" disabled={uploading || saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ" : "Save")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button type="button" onClick={() => setTab("albums")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${tab === "albums" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
          <Image className="w-4 h-4" />
          {lang === "ar" ? `الألبومات (${albums.length})` : `Albums (${albums.length})`}
        </button>
        <button type="button" onClick={() => setTab("photos")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${tab === "photos" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
          <Image className="w-4 h-4" />
          {lang === "ar" ? `الصور (${photos.length})` : `Photos (${photos.length})`}
        </button>
        <button type="button" onClick={() => setTab("videos")} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${tab === "videos" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
          <Film className="w-4 h-4" />
          {lang === "ar" ? `الفيديوهات (${videos.length})` : `Videos (${videos.length})`}
        </button>
      </div>

      {loading ? <p className="text-center py-10 opacity-50">Loading...</p> : (
        <>
          {tab === "albums" && (
            <>
              <div className="flex justify-end mb-4"><Button type="button" onClick={() => { setEditingAlbum({ title_ar: "", title_en: "", description_ar: "", description_en: "" }); setIsNew(true); }}><Plus className="w-4 h-4 mr-2" />{lang === "ar" ? "إضافة ألبوم" : "Add Album"}</Button></div>
              <div className="bg-card rounded-xl card-shadow overflow-hidden">
                <Table><TableHeader><TableRow><TableHead>{lang === "ar" ? "العنوان" : "Title"}</TableHead><TableHead>{lang === "ar" ? "الوصف" : "Description"}</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {albums.map((a) => (<TableRow key={a.album_id}><TableCell className="font-medium">{lang === "ar" ? a.title_ar : a.title_en}</TableCell><TableCell className="text-muted-foreground text-sm">{lang === "ar" ? (a.description_ar || "—") : (a.description_en || "—")}</TableCell><TableCell><div className="flex gap-2"><button type="button" onClick={() => setEditingAlbum(a)} className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button><button type="button" onClick={() => removeAlbum(a.album_id)} className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button></div></TableCell></TableRow>))}
                    {albums.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground opacity-50">{lang === "ar" ? "لا توجد ألبومات" : "No albums found"}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === "photos" && (
            <>
              <div className="flex justify-end mb-4"><Button type="button" onClick={() => { setEditingPhoto({ photo_url: "", caption_ar: "", caption_en: "", album_id: null }); setIsNew(true); }}><Plus className="w-4 h-4 mr-2" />{lang === "ar" ? "إضافة صورة" : "Add Photo"}</Button></div>
              <div className="bg-card rounded-xl card-shadow overflow-hidden">
                <Table><TableHeader><TableRow><TableHead>{lang === "ar" ? "الصورة" : "Photo"}</TableHead><TableHead>{lang === "ar" ? "التسمية" : "Caption"}</TableHead><TableHead>{lang === "ar" ? "الألبوم" : "Album"}</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {photos.map((p) => (<TableRow key={p.photo_id}><TableCell><img src={p.photo_url} className="w-12 h-12 object-cover rounded shadow-sm border border-muted" alt="" /></TableCell><TableCell className="text-sm">{lang === "ar" ? (p.caption_ar || "—") : (p.caption_en || "—")}</TableCell><TableCell className="text-sm text-muted-foreground">{p.photo_albums ? (lang === "ar" ? p.photo_albums.title_ar : p.photo_albums.title_en) : "—"}</TableCell><TableCell><div className="flex gap-2"><button type="button" onClick={() => setEditingPhoto(p)} className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button><button type="button" onClick={() => removePhoto(p.photo_id)} className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button></div></TableCell></TableRow>))}
                    {photos.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground opacity-50">{lang === "ar" ? "لا توجد صور" : "No photos found"}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {tab === "videos" && (
            <>
              <div className="flex justify-end mb-4"><Button type="button" onClick={() => { setEditingVideo({ title_ar: "", title_en: "", video_url: "", description_ar: "", description_en: "" }); setIsNew(true); }}><Plus className="w-4 h-4 mr-2" />{lang === "ar" ? "إضافة فيديو" : "Add Video"}</Button></div>
              <div className="bg-card rounded-xl card-shadow overflow-hidden">
                <Table><TableHeader><TableRow><TableHead>{lang === "ar" ? "العنوان" : "Title"}</TableHead><TableHead>{lang === "ar" ? "الرابط" : "URL"}</TableHead><TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {videos.map((v) => (<TableRow key={v.video_id}><TableCell className="font-medium">{lang === "ar" ? v.title_ar : v.title_en}</TableCell><TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" dir="ltr">{v.video_url}</TableCell><TableCell dir="ltr" className="text-xs text-muted-foreground">{v.upload_date?.split("T")[0] || "—"}</TableCell><TableCell><div className="flex gap-2"><button type="button" onClick={() => setEditingVideo(v)} className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button><button type="button" onClick={() => removeVideo(v.video_id)} className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button></div></TableCell></TableRow>))}
                    {videos.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground opacity-50">{lang === "ar" ? "لا توجد فيديوهات" : "No videos found"}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
  return match?.[1] || "";
}

export default AdminGallery;
