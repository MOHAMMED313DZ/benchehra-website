import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Save, Megaphone } from "lucide-react";
import { toast } from "sonner";

const AdminAnnouncements: React.FC = () => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("announcements").select("*").order("publish_date", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch announcements error:", error.message);
      toast.error(lang === "ar" ? "فشل تحميل البيانات" : "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const save = async () => {
    if (!editing.title_ar || !editing.title_en) { 
      toast.error(lang === "ar" ? "العنوان مطلوب" : "Title required"); 
      return; 
    }
    
    setSaving(true);
    console.log("Saving announcement started...", editing);
    
    try {
      const payload = { 
        title_ar: editing.title_ar, title_en: editing.title_en, 
        content_ar: editing.content_ar || "", content_en: editing.content_en || "", 
        is_active: editing.is_active !== undefined ? editing.is_active : true 
      };

      if (isNew) {
        const { error } = await supabase.from("announcements").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("announcements").update(payload).eq("announcement_id", editing.announcement_id);
        if (error) throw error;
      }
      
      console.log("Database operation successful");
      toast.success(lang === "ar" ? "تم نشر الإعلان بنجاح" : "Announcement published successfully");
      
      setEditing(null);
      setIsNew(false);
      fetchData();
    } catch (error: any) {
      console.error("Save announcement error:", error);
      toast.error(error.message || (lang === "ar" ? "حدث خطأ أثناء الحفظ" : "Error saving"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا الإعلان؟" : "Are you sure you want to delete this announcement?")) return;
    try {
      const { error } = await supabase.from("announcements").delete().eq("announcement_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف بنجاح" : "Deleted successfully"); 
      fetchData();
    } catch (error: any) {
      console.error("Delete announcement error:", error.message);
      toast.error(error.message);
    }
  };

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 card-shadow border border-primary/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <h2 className="font-bold text-xl tracking-tight">{isNew ? (lang === "ar" ? "نشر إعلان جديد" : "Post New Announcement") : (lang === "ar" ? "تعديل الإعلان" : "Edit Announcement")}</h2>
          <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "عنوان الإعلان (عربي)" : "Announcement Title (AR)"}</label><Input value={editing.title_ar} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} className="h-11" /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "عنوان الإعلان (إنجليزي)" : "Announcement Title (EN)"}</label><Input value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} dir="ltr" className="h-11" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "المحتوى (عربي)" : "Content (AR)"}</label><Textarea rows={6} value={editing.content_ar || ""} onChange={(e) => setEditing({ ...editing, content_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "المحتوى (إنجليزي)" : "Content (EN)"}</label><Textarea rows={6} value={editing.content_en || ""} onChange={(e) => setEditing({ ...editing, content_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
            <input type="checkbox" id="is_active" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="w-4 h-4 rounded text-primary focus:ring-primary" />
            <label htmlFor="is_active" className="text-sm font-bold cursor-pointer select-none">{lang === "ar" ? "إظهار هذا الإعلان كإعلان نشط" : "Show this as an active announcement"}</label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 py-6 rounded-xl" disabled={saving}>{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
            <Button type="button" onClick={save} className="flex-[2] py-6 rounded-xl shadow-lg shadow-primary/20" disabled={saving}>
              {saving ? <><span className="animate-spin mr-2">⏳</span> {lang === "ar" ? "جارٍ النشر..." : "Publishing..."}</> : <><Save className="w-5 h-5 mr-2" /> {lang === "ar" ? "نشر الإعلان" : "Publish Now"}</>}
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
          <div className="bg-primary/10 p-2 rounded-lg"><Megaphone className="w-5 h-5 text-primary" /></div>
          <div>
            <h3 className="font-bold text-foreground">{lang === "ar" ? "إدارة الإعلانات" : "Manage Announcements"}</h3>
            <p className="text-xs text-muted-foreground">{items.length} {lang === "ar" ? "إعلان مسجل" : "announcements registered"}</p>
          </div>
        </div>
        <Button type="button" onClick={() => { setEditing({ title_ar: "", title_en: "", content_ar: "", content_en: "", is_active: true }); setIsNew(true); }} className="rounded-xl shadow-lg shadow-primary/10">
          <Plus className="w-4 h-4 mr-2" /> {lang === "ar" ? "إضافة إعلان" : "New Announcement"}
        </Button>
      </div>

      {loading && items.length === 0 ? (
        <div className="py-20 text-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" /><p className="text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "Loading announcements..."}</p></div>
      ) : (
        <div className="bg-card rounded-2xl card-shadow overflow-hidden border border-primary/5">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{lang === "ar" ? "العنوان" : "Title"}</TableHead>
                <TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
                <TableHead className="text-center">{lang === "ar" ? "الحالة" : "Status"}</TableHead>
                <TableHead className="text-right">{lang === "ar" ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.announcement_id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold max-w-[400px] truncate">{lang === "ar" ? item.title_ar : item.title_en}</TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground" dir="ltr">{item.publish_date?.split("T")[0]}</TableCell>
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
                      <button type="button" onClick={() => remove(item.announcement_id)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground opacity-50 italic">
                    {lang === "ar" ? "لا توجد إعلانات مسجلة بعد" : "No announcements yet"}
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

export default AdminAnnouncements;
