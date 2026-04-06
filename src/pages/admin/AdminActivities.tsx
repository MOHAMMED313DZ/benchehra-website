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
      setLoading(true);
      const { data, error } = await supabase.from("activities").select("*").order("activity_id");
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch activities error:", error.message);
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
      const filePath = `activities/${fileName}`;
      
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setEditing(prev => ({ ...prev, image_url: url }));
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
    console.log("Saving activity started...", editing);
    
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
      
      console.log("Database operation successful");
      toast.success(lang === "ar" ? "تم الحفظ بنجاح" : "Saved successfully");
      
      // Clear state FIRST to unmount form immediately
      setEditing(null);
      setIsNew(false);
      
      // Refresh in background
      fetchData();
    } catch (error: any) {
      console.error("Save activity error details:", error);
      toast.error(error.message || (lang === "ar" ? "حدث خطأ أثناء الحفظ" : "Error saving"));
    } finally {
      console.log("Saving activity lifecycle finished");
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) return;
    try {
      const { error } = await supabase.from("activities").delete().eq("activity_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف بنجاح" : "Deleted successfully"); 
      fetchData();
    } catch (error: any) {
      console.error("Delete activity error:", error.message);
      toast.error(error.message);
    }
  };

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 card-shadow border border-primary/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <h2 className="font-bold text-xl tracking-tight">{isNew ? (lang === "ar" ? "إضافة نشاط جديد" : "Add New Activity") : (lang === "ar" ? "تعديل النشاط" : "Edit Activity")}</h2>
          <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "العنوان (عربي)" : "Title (AR)"}</label><Input value={editing.title_ar} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} className="h-11" /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "العنوان (إنجليزي)" : "Title (EN)"}</label><Input value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} dir="ltr" className="h-11" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الوصف (عربي)" : "Description (AR)"}</label><Textarea rows={4} value={editing.description_ar} onChange={(e) => setEditing({ ...editing, description_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الوصف (إنجليزي)" : "Description (EN)"}</label><Textarea rows={4} value={editing.description_en} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الفئة (عربي)" : "Category (AR)"}</label><Input value={editing.category_ar} onChange={(e) => setEditing({ ...editing, category_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الفئة (إنجليزي)" : "Category (EN)"}</label><Input value={editing.category_en} onChange={(e) => setEditing({ ...editing, category_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الفئة العمرية" : "Age Group"}</label><Input value={editing.target_audience_ar || ""} onChange={(e) => setEditing({ ...editing, target_audience_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الجدول الزمني" : "Schedule"}</label><Input value={editing.schedule_info_ar || ""} onChange={(e) => setEditing({ ...editing, schedule_info_ar: e.target.value })} /></div>
          </div>
          <div className="bg-muted/30 p-6 rounded-2xl space-y-4">
            <label className="block text-sm font-bold text-muted-foreground">{lang === "ar" ? "صورة النشاط" : "Activity Image"}</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading || saving} title="Upload Image" />
                <div className={`p-6 border-2 border-dashed rounded-xl text-center transition-all ${uploading ? "bg-muted animate-pulse" : "hover:border-primary hover:bg-primary/5 cursor-pointer"}`}>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                  <span className="text-xs font-medium text-muted-foreground block">{uploading ? (lang === "ar" ? "جارٍ الرفع..." : "Uploading...") : (lang === "ar" ? "اختر صورة لرفعها" : "Choose image to upload")}</span>
                </div>
              </div>
              <div className="flex-1">
                <Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} dir="ltr" placeholder="Image URL (Alternative)" className="text-xs h-full" disabled={uploading || saving} />
              </div>
            </div>
            {editing.image_url && <div className="relative aspect-video rounded-xl overflow-hidden border bg-black/5"><img src={editing.image_url} alt="Preview" className="w-full h-full object-cover" /><button type="button" onClick={() => setEditing({...editing, image_url: ""})} className="absolute top-2 right-2 bg-destructive text-white p-1.5 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-all"><X className="w-4 h-4" /></button></div>}
          </div>
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
            <input type="checkbox" id="is_active" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="w-4 h-4 rounded text-primary focus:ring-primary" />
            <label htmlFor="is_active" className="text-sm font-bold cursor-pointer select-none">{lang === "ar" ? "هذا النشاط متاح ونشط حالياً" : "This activity is currently active and available"}</label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 py-6 rounded-xl" disabled={saving || uploading}>{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
            <Button type="button" onClick={save} className="flex-[2] py-6 rounded-xl shadow-lg shadow-primary/20" disabled={saving || uploading}>
              {saving ? <><span className="animate-spin mr-2">⏳</span> {lang === "ar" ? "جارٍ الحفظ..." : "Saving..."}</> : <><Save className="w-5 h-5 mr-2" /> {lang === "ar" ? "حفظ التغييرات" : "Save Changes"}</>}
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
          <div className="bg-primary/10 p-2 rounded-lg"><TableHead className="w-5 h-5 text-primary" /></div>
          <div>
            <h3 className="font-bold text-foreground">{lang === "ar" ? "إدارة الأنشطة" : "Manage Activities"}</h3>
            <p className="text-xs text-muted-foreground">{items.length} {lang === "ar" ? "نشاط مسجل" : "activities registered"}</p>
          </div>
        </div>
        <Button type="button" onClick={() => { setEditing({ ...empty }); setIsNew(true); }} className="rounded-xl shadow-lg shadow-primary/10">
          <Plus className="w-4 h-4 mr-2" /> {lang === "ar" ? "إضافة نشاط" : "Add Activity"}
        </Button>
      </div>

      {loading && items.length === 0 ? (
        <div className="py-20 text-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" /><p className="text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "Loading activities..."}</p></div>
      ) : (
        <div className="bg-card rounded-2xl card-shadow overflow-hidden border border-primary/5">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{lang === "ar" ? "الصورة" : "Image"}</TableHead>
                <TableHead>{lang === "ar" ? "العنوان" : "Title"}</TableHead>
                <TableHead>{lang === "ar" ? "الفئة" : "Category"}</TableHead>
                <TableHead className="text-center">{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                <TableHead className="text-right">{lang === "ar" ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.activity_id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4">
                    <img 
                      src={item.image_url || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop"} 
                      alt="" 
                      className="w-12 h-12 object-cover rounded-xl shadow-sm border border-muted" 
                    />
                  </TableCell>
                  <TableCell className="font-bold">{lang === "ar" ? item.title_ar : item.title_en}</TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">{lang === "ar" ? item.category_ar : item.category_en}</TableCell>
                  <TableCell className="text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      item.is_active ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-muted"
                    }`}>
                      {item.is_active ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "غير نشط" : "Inactive")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditing(item)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => remove(item.activity_id)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground opacity-50 italic">
                    {lang === "ar" ? "لا توجد أنشطة مسجلة بعد" : "No activities registered yet"}
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

export default AdminActivities;
