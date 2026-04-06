import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Save, Upload, Image as ImageIcon, Film } from "lucide-react";
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
      setLoading(true);
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

  const uploadFile = async (file: File, folder: "photos" | "videos"): Promise<string | null> => {
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
      const filePath = `${folder}/${fileName}`;
      const { error } = await supabase.storage.from("media").upload(filePath, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
      return urlData?.publicUrl || null;
    } catch (error: any) {
      console.error("Upload error details:", error);
      const errorMsg = error.message || (lang === "ar" ? "فشل الرفع" : "Upload failed");
      toast.error(errorMsg);
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const limit = type === "image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > limit) {
      toast.error(lang === "ar" ? `حجم الملف كبير جداً` : `File too large`);
      return;
    }
    setUploading(true);
    const url = await uploadFile(file, type === "image" ? "photos" : "videos");
    setUploading(false);
    if (url) {
      if (type === "image") setEditingPhoto(prev => ({ ...prev, photo_url: url }));
      else setEditingVideo(prev => ({ ...prev, video_url: url }));
      toast.success(lang === "ar" ? "تم الرفع" : "Uploaded");
    }
  };

  const saveAlbum = async () => {
    if (!editingAlbum.title_ar || !editingAlbum.title_en) { toast.error(lang === "ar" ? "العنوان مطلوب" : "Title required"); return; }
    setSaving(true);
    try {
      const payload = { title_ar: editingAlbum.title_ar, title_en: editingAlbum.title_en, description_ar: editingAlbum.description_ar || "", description_en: editingAlbum.description_en || "" };
      if (isNew) await supabase.from("photo_albums").insert([payload]);
      else await supabase.from("photo_albums").update(payload).eq("album_id", editingAlbum.album_id);
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved"); setEditingAlbum(null); fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const savePhoto = async () => {
    if (!editingPhoto.photo_url) { toast.error(lang === "ar" ? "الرابط مطلوب" : "URL required"); return; }
    setSaving(true);
    try {
      const payload = { photo_url: editingPhoto.photo_url, caption_ar: editingPhoto.caption_ar || "", caption_en: editingPhoto.caption_en || "", album_id: editingPhoto.album_id };
      if (isNew) await supabase.from("photos").insert([payload]);
      else await supabase.from("photos").update(payload).eq("photo_id", editingPhoto.photo_id);
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved"); setEditingPhoto(null); fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveVideo = async () => {
    if (!editingVideo.video_url) { toast.error(lang === "ar" ? "رابط الفيديو مطلوب" : "Video URL required"); return; }
    setSaving(true);
    try {
      const payload = { title_ar: editingVideo.title_ar, title_en: editingVideo.title_en, video_url: editingVideo.video_url, description_ar: editingVideo.description_ar, description_en: editingVideo.description_en };
      if (isNew) await supabase.from("videos").insert([payload]);
      else await supabase.from("videos").update(payload).eq("video_id", editingVideo.video_id);
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved"); setEditingVideo(null); fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeAlbum = async (id: number) => { if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return; try { await supabase.from("photo_albums").delete().eq("album_id", id); fetchData(); } catch (error: any) { toast.error(error.message); } };
  const removePhoto = async (id: number) => { if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return; try { await supabase.from("photos").delete().eq("photo_id", id); fetchData(); } catch (error: any) { toast.error(error.message); } };
  const removeVideo = async (id: number) => { if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return; try { await supabase.from("videos").delete().eq("video_id", id); fetchData(); } catch (error: any) { toast.error(error.message); } };

  if (editingAlbum || editingPhoto || editingVideo) {
    const isAlbum = !!editingAlbum;
    const isPhoto = !!editingPhoto;
    const item = editingAlbum || editingPhoto || editingVideo;
    const close = () => { setEditingAlbum(null); setEditingPhoto(null); setEditingVideo(null); setIsNew(false); };
    const saveFunc = isAlbum ? saveAlbum : isPhoto ? savePhoto : saveVideo;

    return (
      <div className="max-w-xl mx-auto bg-card rounded-2xl p-8 card-shadow border border-primary/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-xl">{isNew ? (lang === "ar" ? "إضافة جديدة" : "Add New") : (lang === "ar" ? "تعديل" : "Edit")}</h2>
          <button type="button" onClick={close} className="p-2 hover:bg-muted rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          {!isPhoto && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">{lang === "ar" ? "العنوان بالعربية" : "Title AR"}</label><Input value={item.title_ar} onChange={(e) => (isAlbum ? setEditingAlbum({...item, title_ar: e.target.value}) : setEditingVideo({...item, title_ar: e.target.value}))} /></div>
              <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">{lang === "ar" ? "العنوان بالإنجليزية" : "Title EN"}</label><Input value={item.title_en} onChange={(e) => (isAlbum ? setEditingAlbum({...item, title_en: e.target.value}) : setEditingVideo({...item, title_en: e.target.value}))} dir="ltr" /></div>
            </div>
          )}
          
          {(isPhoto || !isAlbum) && (
            <div className="bg-muted/30 p-4 rounded-xl space-y-4">
              <label className="block text-xs font-bold text-muted-foreground uppercase">{isPhoto ? (lang === "ar" ? "الصورة" : "Image") : (lang === "ar" ? "ملف الفيديو" : "Video File")}</label>
              <div className="relative">
                <input type="file" accept={isPhoto ? "image/*" : "video/*"} onChange={(e) => handleFileChange(e, isPhoto ? "image" : "video")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading || saving} />
                <div className={`p-4 border-2 border-dashed rounded-lg text-center ${uploading ? "animate-pulse bg-primary/5" : "hover:bg-primary/5"}`}>
                  <Upload className="w-6 h-6 mx-auto mb-1 text-primary/50" />
                  <span className="text-xs">{uploading ? (lang === "ar" ? "جارٍ الرفع..." : "Uploading...") : (lang === "ar" ? "رفع ملف" : "Upload File")}</span>
                </div>
              </div>
              <Input value={isPhoto ? item.photo_url : item.video_url} onChange={(e) => (isPhoto ? setEditingPhoto({...item, photo_url: e.target.value}) : setEditingVideo({...item, video_url: e.target.value}))} placeholder="URL" dir="ltr" className="text-xs" />
              {(isPhoto ? item.photo_url : item.video_url) && (
                <div className="aspect-video rounded-lg overflow-hidden border">
                  {isPhoto ? <img src={item.photo_url} className="w-full h-full object-cover" alt="" /> : <video src={item.video_url} className="w-full h-full object-cover" controls />}
                </div>
              )}
            </div>
          )}

          {!isAlbum && (
             <div className="grid grid-cols-2 gap-4">
               <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">{lang === "ar" ? "الوصف" : "Description"}</label><Textarea value={isPhoto ? item.caption_ar : item.description_ar} onChange={(e) => (isPhoto ? setEditingPhoto({...item, caption_ar: e.target.value}) : setEditingVideo({...item, description_ar: e.target.value}))} /></div>
               <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-1">EN</label><Textarea value={isPhoto ? item.caption_en : item.description_en} onChange={(e) => (isPhoto ? setEditingPhoto({...item, caption_en: e.target.value}) : setEditingVideo({...item, description_en: e.target.value}))} dir="ltr" /></div>
             </div>
          )}

          {isPhoto && (
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">{lang === "ar" ? "الألبوم" : "Album"}</label>
              <select value={item.album_id || ""} onChange={(e) => setEditingPhoto({...item, album_id: e.target.value ? parseInt(e.target.value) : null})} className="w-full rounded-xl border px-3 py-2 text-sm bg-background">
                <option value="">{lang === "ar" ? "عام (بدون ألبوم)" : "General (No Album)"}</option>
                {albums.map(a => <option key={a.album_id} value={a.album_id}>{lang === "ar" ? a.title_ar : a.title_en}</option>)}
              </select>
            </div>
          )}

          <Button type="button" onClick={saveFunc} className="w-full py-6 rounded-xl shadow-lg" disabled={saving || uploading}>
            {saving ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ التغييرات" : "Save Changes")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-6">
        <button type="button" onClick={() => setTab("albums")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === "albums" ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>{lang === "ar" ? "الألبومات" : "Albums"}</button>
        <button type="button" onClick={() => setTab("photos")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === "photos" ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>{lang === "ar" ? "الصور" : "Photos"}</button>
        <button type="button" onClick={() => setTab("videos")} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tab === "videos" ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>{lang === "ar" ? "الفيديوهات" : "Videos"}</button>
      </div>

      <div className="flex justify-end mb-4">
        <Button type="button" onClick={() => {
          if (tab === "albums") setEditingAlbum({title_ar: "", title_en: ""});
          else if (tab === "photos") setEditingPhoto({photo_url: "", album_id: null});
          else setEditingVideo({title_ar: "", title_en: "", video_url: ""});
          setIsNew(true);
        }}>
          <Plus className="w-4 h-4 mr-2" /> {lang === "ar" ? "إضافة جديدة" : "Add New Item"}
        </Button>
      </div>

      <div className="bg-card rounded-2xl card-shadow overflow-hidden border">
        <Table>
          <TableHeader><TableRow><TableHead>{lang === "ar" ? "معاينة/عنوان" : "Preview/Title"}</TableHead><TableHead className="text-right">{lang === "ar" ? "إجراءات" : "Actions"}</TableHead></TableRow></TableHeader>
          <TableBody>
            {tab === "albums" && albums.map(a => (
              <TableRow key={a.album_id}>
                <TableCell className="font-bold">{lang === "ar" ? a.title_ar : a.title_en}</TableCell>
                <TableCell className="text-right flex gap-2 justify-end"><button type="button" onClick={() => setEditingAlbum(a)} className="p-2 hover:bg-primary/10 rounded-xl"><Pencil className="w-4 h-4" /></button><button type="button" onClick={() => removeAlbum(a.album_id)} className="p-2 hover:bg-destructive/10 rounded-xl text-destructive"><Trash2 className="w-4 h-4" /></button></TableCell>
              </TableRow>
            ))}
            {tab === "photos" && photos.map(p => (
              <TableRow key={p.photo_id}>
                <TableCell className="flex items-center gap-3"><img src={p.photo_url} className="w-12 h-12 object-cover rounded-lg" alt="" /><span className="text-sm font-medium">{lang === "ar" ? p.caption_ar : p.caption_en}</span></TableCell>
                <TableCell className="text-right"><div className="flex gap-2 justify-end"><button type="button" onClick={() => setEditingPhoto(p)} className="p-2 hover:bg-primary/10 rounded-xl"><Pencil className="w-4 h-4" /></button><button type="button" onClick={() => removePhoto(p.photo_id)} className="p-2 hover:bg-destructive/10 rounded-xl text-destructive"><Trash2 className="w-4 h-4" /></button></div></TableCell>
              </TableRow>
            ))}
            {tab === "videos" && videos.map(v => (
              <TableRow key={v.video_id}>
                <TableCell className="font-bold">{lang === "ar" ? v.title_ar : v.title_en}</TableCell>
                <TableCell className="text-right flex gap-2 justify-end"><button type="button" onClick={() => setEditingVideo(v)} className="p-2 hover:bg-primary/10 rounded-xl"><Pencil className="w-4 h-4" /></button><button type="button" onClick={() => removeVideo(v.video_id)} className="p-2 hover:bg-destructive/10 rounded-xl text-destructive"><Trash2 className="w-4 h-4" /></button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminGallery;
