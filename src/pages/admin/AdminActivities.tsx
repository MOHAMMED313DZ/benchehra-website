import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Save, Upload } from "lucide-react";
import { toast } from "sonner";

const empty = {
  title_ar: "", title_en: "", description_ar: "", description_en: "",
  category_ar: "", category_en: "", target_audience_ar: "", target_audience_en: "",
  schedule_info_ar: "", schedule_info_en: "", is_active: true, image_url: "",
};

const AdminActivities: React.FC = () => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("activities").select("*").order("activity_id");
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch activities error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
      const filePath = `activities/${fileName}`;
      
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
    if (url) setEditing({ ...editing, image_url: url });
    setUploading(false);
  };

  const save = async () => {
    if (!editing.title_ar || !editing.title_en) { toast.error(lang === "ar" ? "العنوان مطلوب" : "Title required"); return; }
    setSaving(true);
    try {
      const payload = { 
        title_ar: editing.title_ar, title_en: editing.title_en, 
        description_ar: editing.description_ar || "", description_en: editing.description_en || "", 
        category_ar: editing.category_ar || "", category_en: editing.category_en || "", 
        target_audience_ar: editing.target_audience_ar || "", target_audience_en: editing.target_audience_en || "", 
        schedule_info_ar: editing.schedule_info_ar || "", schedule_info_en: editing.schedule_info_en || "", 
        is_active: editing.is_active,
        image_url: editing.image_url || null
      };

      if (isNew) {
        const { error } = await supabase.from("activities").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("activities").update(payload).eq("activity_id", editing.activity_id);
        if (error) throw error;
      }
      toast.success(lang === "ar" ? "تم الحفظ بنجاح" : "Saved successfully");
      setEditing(null); setIsNew(false); fetchData();
    } catch (error: any) {
      console.error("Save activity error:", error);
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    try {
      const { error } = await supabase.from("activities").delete().eq("activity_id", id);
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
          <h2 className="font-bold text-lg">{isNew ? (lang === "ar" ? "إضافة نشاط" : "Add Activity") : (lang === "ar" ? "تعديل النشاط" : "Edit Activity")}</h2>
          <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "العنوان (عربي)" : "Title (AR)"}</label><Input value={editing.title_ar} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "العنوان (إنجليزي)" : "Title (EN)"}</label><Input value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الوصف (عربي)" : "Description (AR)"}</label><Textarea value={editing.description_ar} onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الوصف (إنجليزي)" : "Description (EN)"}</label><Textarea value={editing.description_en} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الفئة (عربي)" : "Category (AR)"}</label><Input value={editing.category_ar} onChange={(e) => setEditing({ ...editing, category_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الفئة (إنجليزي)" : "Category (EN)"}</label><Input value={editing.category_en} onChange={(e) => setEditing({ ...editing, category_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الفئة العمرية (عربي)" : "Target Audience (AR)"}</label><Input value={editing.target_audience_ar || ""} onChange={(e) => setEditing({ ...editing, target_audience_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الفئة العمرية (إنجليزي)" : "Target Audience (EN)"}</label><Input value={editing.target_audience_en || ""} onChange={(e) => setEditing({ ...editing, target_audience_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الجدول (عربي)" : "Schedule (AR)"}</label><Input value={editing.schedule_info_ar || ""} onChange={(e) => setEditing({ ...editing, schedule_info_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الجدول (إنجليزي)" : "Schedule (EN)"}</label><Input value={editing.schedule_info_en || ""} onChange={(e) => setEditing({ ...editing, schedule_info_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{lang === "ar" ? "الصورة" : "Image"}</label>
            <div className="space-y-2">
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                <div className={`p-4 border-2 border-dashed rounded-lg text-center ${uploading ? "opacity-50" : "hover:border-primary hover:bg-primary/5 cursor-pointer"}`}>
                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{uploading ? (lang === "ar" ? "جارٍ الرفع..." : "Uploading...") : (lang === "ar" ? "رفع صورة" : "Upload Image")}</span>
                </div>
              </div>
              <Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} dir="ltr" placeholder="URL" />
              {editing.image_url && <img src={editing.image_url} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-lg border" />}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
            <label className="text-sm font-medium">{lang === "ar" ? "نشط" : "Active"}</label>
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
        <p className="text-muted-foreground text-sm">{items.length} {lang === "ar" ? "نشاط" : "activities"}</p>
        <Button type="button" onClick={() => { setEditing({ ...empty }); setIsNew(true); }}><Plus className="w-4 h-4 mr-2" />{lang === "ar" ? "إضافة" : "Add"}</Button>
      </div>
      {loading ? <p className="text-center py-10 opacity-50">Loading...</p> : (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{lang === "ar" ? "الصورة" : "Image"}</TableHead>
              <TableHead>{lang === "ar" ? "العنوان" : "Title"}</TableHead>
              <TableHead>{lang === "ar" ? "الفئة" : "Category"}</TableHead>
              <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.activity_id}>
                  <TableCell><img src={item.image_url || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop"} alt="" className="w-10 h-10 object-cover rounded shadow-sm" /></TableCell>
                  <TableCell className="font-medium">{lang === "ar" ? item.title_ar : item.title_en}</TableCell>
                  <TableCell className="text-sm">{lang === "ar" ? item.category_ar : item.category_en}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.is_active ? "bg-primary/20 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-muted"}`}>{item.is_active ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "غير نشط" : "Inactive")}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditing(item)} className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => remove(item.activity_id)} className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminActivities;
