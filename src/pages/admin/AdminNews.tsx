import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Save, Upload } from "lucide-react";
import { toast } from "sonner";

const AdminNews: React.FC = () => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("news").select("*").order("publish_date", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch news error:", error.message);
      toast.error(lang === "ar" ? "فشل تحميل البيانات" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
      const filePath = `news/${fileName}`;
      
      const { error } = await supabase.storage.from("media").upload(filePath, file);
      if (error) throw error;
      
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
      return urlData?.publicUrl || null;
    } catch (error: any) {
      console.error("Upload error:", error.message);
      toast.error(lang === "ar" ? "فشل رفع الصورة" : "Upload failed");
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setEditing(prev => ({ ...prev, featured_image_url: url }));
      toast.success(lang === "ar" ? "تم رفع الصورة" : "Image uploaded");
    }
    setUploading(false);
  };

  const save = async () => {
    if (!editing.title_ar || !editing.title_en) { 
      toast.error(lang === "ar" ? "العنوان مطلوب" : "Title required"); 
      return; 
    }
    
    setSaving(true);
    console.log("Saving news started...", editing);
    
    try {
      const payload = { 
        title_ar: editing.title_ar, title_en: editing.title_en, 
        content_ar: editing.content_ar || "", content_en: editing.content_en || "", 
        featured_image_url: editing.featured_image_url || null 
      };

      if (isNew) {
        const { error } = await supabase.from("news").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").update(payload).eq("news_id", editing.news_id);
        if (error) throw error;
      }
      
      console.log("Database operation successful");
      toast.success(lang === "ar" ? "تم الحفظ بنجاح" : "Saved successfully");
      
      // Clear state FIRST to unmount form immediately
      setEditing(null);
      setIsNew(false);
      
      // Refresh in background
      fetchData();
    } catch (error: any) {
      console.error("Save news error details:", error);
      toast.error(error.message || (lang === "ar" ? "حدث خطأ أثناء الحفظ" : "Error saving"));
    } finally {
      console.log("Saving news lifecycle finished");
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) return;
    try {
      const { error } = await supabase.from("news").delete().eq("news_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف بنجاح" : "Deleted successfully"); 
      fetchData();
    } catch (error: any) {
      console.error("Delete news error:", error.message);
      toast.error(error.message);
    }
  };

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 card-shadow border border-primary/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <h2 className="font-bold text-xl tracking-tight">{isNew ? (lang === "ar" ? "إضافة خبر جديد" : "Add New Post") : (lang === "ar" ? "تعديل الخبر" : "Edit Post")}</h2>
          <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "العنوان (عربي)" : "Title (AR)"}</label><Input value={editing.title_ar} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} className="h-11" /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "العنوان (إنجليزي)" : "Title (EN)"}</label><Input value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} dir="ltr" className="h-11" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "المحتوى (عربي)" : "Content (AR)"}</label><Textarea rows={6} value={editing.content_ar || ""} onChange={(e) => setEditing({ ...editing, content_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "المحتوى (إنجليزي)" : "Content (EN)"}</label><Textarea rows={6} value={editing.content_en || ""} onChange={(e) => setEditing({ ...editing, content_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="bg-muted/30 p-6 rounded-2xl space-y-4">
            <label className="block text-sm font-bold text-muted-foreground">{lang === "ar" ? "الصورة البارزة" : "Featured Image"}</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading || saving} title="Upload Image" />
                <div className={`p-6 border-2 border-dashed rounded-xl text-center transition-all ${uploading ? "bg-muted animate-pulse" : "hover:border-primary hover:bg-primary/5 cursor-pointer"}`}>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                  <span className="text-xs font-medium text-muted-foreground block">{uploading ? (lang === "ar" ? "جارٍ الرفع..." : "Uploading...") : (lang === "ar" ? "اختر صورة لرفعها" : "Choose image to upload")}</span>
                </div>
              </div>
              <div className="flex-1">
                <Input value={editing.featured_image_url || ""} onChange={(e) => setEditing({ ...editing, featured_image_url: e.target.value })} dir="ltr" placeholder="Image URL (Alternative)" className="text-xs h-full" disabled={uploading || saving} />
              </div>
            </div>
            {editing.featured_image_url && <div className="relative aspect-video rounded-xl overflow-hidden border bg-black/5"><img src={editing.featured_image_url} alt="Preview" className="w-full h-full object-cover" /><button type="button" onClick={() => setEditing({...editing, featured_image_url: ""})} className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-all"><X className="w-4 h-4" /></button></div>}
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 py-6 rounded-xl" disabled={saving || uploading}>{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
            <Button type="button" onClick={save} className="flex-[2] py-6 rounded-xl shadow-lg shadow-primary/20" disabled={saving || uploading}>
              {saving ? <><span className="animate-spin mr-2">⏳</span> {lang === "ar" ? "جارٍ الحفظ..." : "Saving..."}</> : <><Save className="w-5 h-5 mr-2" /> {lang === "ar" ? "نشر الخبر" : "Publish News"}</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-2xl card-shadow">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg"><Save className="w-5 h-5 text-primary" /></div>
          <div>
            <h3 className="font-bold text-foreground">{lang === "ar" ? "الأخبار والمستجدات" : "News & Updates"}</h3>
            <p className="text-xs text-muted-foreground">{items.length} {lang === "ar" ? "خبر منشور" : "published news"}</p>
          </div>
        </div>
        <Button type="button" onClick={() => { setEditing({ title_ar: "", title_en: "", content_ar: "", content_en: "", featured_image_url: "" }); setIsNew(true); }} className="rounded-xl shadow-lg shadow-primary/10">
          <Plus className="w-4 h-4 mr-2" /> {lang === "ar" ? "إضافة خبر" : "Add News"}
        </Button>
      </div>

      {loading && items.length === 0 ? (
        <div className="py-20 text-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" /><p className="text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "Loading news..."}</p></div>
      ) : (
        <div className="bg-card rounded-2xl card-shadow overflow-hidden border border-primary/5">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{lang === "ar" ? "الصورة" : "Image"}</TableHead>
                <TableHead>{lang === "ar" ? "العنوان" : "Title"}</TableHead>
                <TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
                <TableHead className="text-right">{lang === "ar" ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.news_id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4">
                    <img 
                      src={item.featured_image_url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&h=100&fit=crop"} 
                      alt="" 
                      className="w-12 h-12 object-cover rounded-xl shadow-sm border border-muted" 
                    />
                  </TableCell>
                  <TableCell className="font-bold max-w-[300px] truncate">{lang === "ar" ? item.title_ar : item.title_en}</TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground" dir="ltr">{item.publish_date?.split("T")[0]}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditing(item)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => remove(item.news_id)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground opacity-50 italic">
                    {lang === "ar" ? "لا توجد أخبار منشورة بعد" : "No news published yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
