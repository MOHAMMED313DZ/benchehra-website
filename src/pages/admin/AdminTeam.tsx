import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";

const AdminTeam: React.FC = () => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("staff").select("*").order("staff_id");
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch staff error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const save = async () => {
    if (!editing.full_name_ar || !editing.full_name_en) { 
      toast.error(lang === "ar" ? "الاسم مطلوب" : "Name required"); 
      return; 
    }
    
    setSaving(true);
    try {
      const payload = { 
        full_name_ar: editing.full_name_ar, 
        full_name_en: editing.full_name_en, 
        position_ar: editing.position_ar || "", 
        position_en: editing.position_en || "", 
        bio_ar: editing.bio_ar || "", 
        bio_en: editing.bio_en || "", 
        category: editing.category || "staff", 
        photo_url: editing.photo_url || null 
      };

      if (isNew) {
        const { error } = await supabase.from("staff").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("staff").update(payload).eq("staff_id", editing.staff_id);
        if (error) throw error;
      }

      toast.success(lang === "ar" ? "تم الحفظ بنجاح" : "Saved successfully");
      setEditing(null); 
      setIsNew(false); 
      fetchData();
    } catch (error: any) {
      console.error("Save staff error:", error.message);
      toast.error(error.message || (lang === "ar" ? "حدث خطأ أثناء الحفظ" : "Error saving"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    try {
      const { error } = await supabase.from("staff").delete().eq("staff_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted"); 
      fetchData();
    } catch (error: any) {
      console.error("Delete staff error:", error.message);
      toast.error(error.message);
    }
  };

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg">{isNew ? (lang === "ar" ? "إضافة عضو" : "Add Member") : (lang === "ar" ? "تعديل العضو" : "Edit Member")}</h2>
          <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 hover:bg-muted rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الاسم (عربي)" : "Name (AR)"}</label><Input value={editing.full_name_ar} onChange={(e) => setEditing({ ...editing, full_name_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "الاسم (إنجليزي)" : "Name (EN)"}</label><Input value={editing.full_name_en} onChange={(e) => setEditing({ ...editing, full_name_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "المنصب (عربي)" : "Position (AR)"}</label><Input value={editing.position_ar} onChange={(e) => setEditing({ ...editing, position_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "المنصب (إنجليزي)" : "Position (EN)"}</label><Input value={editing.position_en} onChange={(e) => setEditing({ ...editing, position_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "السيرة الذاتية (عربي)" : "Bio (AR)"}</label><Textarea value={editing.bio_ar || ""} onChange={(e) => setEditing({ ...editing, bio_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-medium mb-1">{lang === "ar" ? "السيرة الذاتية (إنجليزي)" : "Bio (EN)"}</label><Textarea value={editing.bio_en || ""} onChange={(e) => setEditing({ ...editing, bio_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{lang === "ar" ? "الفئة" : "Category"}</label>
            <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="management">{lang === "ar" ? "الإدارة" : "Management"}</option>
              <option value="coaches">{lang === "ar" ? "المدربون" : "Coaches"}</option>
              <option value="staff">{lang === "ar" ? "الموظفون" : "Staff"}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{lang === "ar" ? "رابط الصورة" : "Photo URL"}</label>
            <Input value={editing.photo_url || ""} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} dir="ltr" placeholder="https://example.com/photo.jpg" />
          </div>
          <Button type="button" onClick={save} className="w-full" disabled={saving}>
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
        <p className="text-muted-foreground text-sm">{items.length} {lang === "ar" ? "عضو" : "members"}</p>
        <Button type="button" onClick={() => { setEditing({ full_name_ar: "", full_name_en: "", position_ar: "", position_en: "", bio_ar: "", bio_en: "", category: "coaches", photo_url: "" }); setIsNew(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {lang === "ar" ? "إضافة" : "Add"}
        </Button>
      </div>
      {loading ? <p className="text-center py-10 opacity-50">Loading...</p> : (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
              <TableHead>{lang === "ar" ? "المنصب" : "Position"}</TableHead>
              <TableHead>{lang === "ar" ? "الفئة" : "Category"}</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.staff_id}>
                  <TableCell className="font-medium">{lang === "ar" ? item.full_name_ar : item.full_name_en}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{lang === "ar" ? item.position_ar : item.position_en}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-[10px] uppercase font-bold bg-primary/10 text-primary border border-primary/20">
                      {item.category === "management" ? (lang === "ar" ? "إدارة" : "Mgt") : item.category === "coaches" ? (lang === "ar" ? "مدرب" : "Coach") : (lang === "ar" ? "موظف" : "Staff")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditing(item)} className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => remove(item.staff_id)} className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground opacity-50">
                    {lang === "ar" ? "لا يوجد أعضاء" : "No staff found"}
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

export default AdminTeam;
