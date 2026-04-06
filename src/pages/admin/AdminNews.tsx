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
      const { data, error } = await supabase.from("news").select("*").order("publish_date", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch news error:", error.message);
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
    if (url) setEditing({ ...editing, featured_image_url: url });
    setUploading(false);
  };

  const save = async () => {
    if (!editing.title_ar || !editing.title_en) { toast.error(lang === "ar" ? "العنوان مطلوب" : "Title required"); return; }
    setSaving(true);
    try {
      const payload = { title_ar: editing.title_ar, title_en: editing.title_en, content_ar: editing.content_ar || "", content_en: editing.content_en || "", featured_image_url: editing.featured_image_url || null };
      if (isNew) {
        const { error } = await supabase.from("news").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").update(payload).eq("news_id", editing.news_id);
        if (error) throw error;
      }
      toast.success(lang === "ar" ? "تم الحفظ بنجاح" : "Saved successfully");
      setEditing(null); setIsNew(false); fetchData();
    } catch (error: any) {
      toast.error(error.message);
      console.error("Save news error:", error);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    try {
      const { error } = await supabase.from("news").delete().eq("news_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted"); fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-xl p-6 card-shadow border border-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg">{isNew ? (lang === "ar" ? "إضافة خبر" : "Add News") : (lang === "ar" ? "تعديل الخبر" : "Edit News")}</h2>
          <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "العنوان (عربي)" : "Title (AR)"}</label><Input value={editing.title_ar} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "العنوان (إنجليزي)" : "Title (EN)"}</label><Input value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "المحتوى (عربي)" : "Content (AR)"}</label><Textarea rows={5} value={editing.content_ar || ""} onChange={(e) => setEditing({ ...editing, content_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "المحتوى (إنجليزي)" : "Content (EN)"}</label><Textarea rows={5} value={editing.content_en || ""} onChange={(e) => setEditing({ ...editing, content_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{lang === "ar" ? "الصورة البارزة" : "Featured Image"}</label>
            <div className="space-y-2">
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                <div className={`p-4 border-2 border-dashed rounded-lg text-center ${uploading ? "opacity-50" : "hover:border-primary hover:bg-primary/5 cursor-pointer"}`}>
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? (lang === "ar" ? "جارٍ الرفع..." : "Uploading...") : (lang === "ar" ? "رفع صورة من الجهاز" : "Upload from device")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2"><div className="flex-1 border-t" /><span className="text-[10px] text-muted-foreground font-bold">{lang === "ar" ? "أو" : "OR"}</span><div className="flex-1 border-t" /></div>
              <Input value={editing.featured_image_url || ""} onChange={(e) => setEditing({ ...editing, featured_image_url: e.target.value })} dir="ltr" placeholder="https://example.com/image.jpg" />
              {editing.featured_image_url && <img src={editing.featured_image_url} alt="Preview" className="mt-2 h-40 w-full object-cover rounded-lg border shadow-sm" />}
            </div>
          </div>
          <Button type="button" onClick={save} className="w-full" disabled={saving || uploading}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ" : "Save")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm">{items.length} {lang === "ar" ? "خبر" : "news items"}</p>
        <Button type="button" onClick={() => { setEditing({ title_ar: "", title_en: "", content_ar: "", content_en: "", featured_image_url: "" }); setIsNew(true); }}><Plus className="w-4 h-4 mr-2" />{lang === "ar" ? "إضافة" : "Add"}</Button>
      </div>
      {loading ? <p className="text-center py-10 opacity-50">Loading...</p> : (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{lang === "ar" ? "العنوان" : "Title"}</TableHead>
              <TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.news_id}>
                  <TableCell className="font-medium">{lang === "ar" ? item.title_ar : item.title_en}</TableCell>
                  <TableCell dir="ltr" className="text-xs text-muted-foreground">{item.publish_date?.split("T")[0]}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditing(item)} className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => remove(item.news_id)} className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground opacity-50">{lang === "ar" ? "لا توجد أخبار" : "No news items found"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
