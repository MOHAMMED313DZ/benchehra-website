import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Save, Upload, Users } from "lucide-react";
import { toast } from "sonner";

const AdminTeam: React.FC = () => {
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
      const { data, error } = await supabase.from("staff").select("*").order("full_name_ar");
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch staff error:", error.message);
      toast.error(lang === "ar" ? "فشل تحميل البيانات" : "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
      const filePath = `staff/${fileName}`;
      const { error } = await supabase.storage.from("media").upload(filePath, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
      return urlData?.publicUrl || null;
    } catch (error: any) {
      console.error("Upload error details:", error);
      toast.error(error.message || (lang === "ar" ? "فشل رفع الصورة" : "Upload failed"));
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setEditing(prev => ({ ...prev, photo_url: url }));
      toast.success(lang === "ar" ? "تم رفع الصورة" : "Profile image uploaded");
    }
    setUploading(false);
  };

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
        photo_url: editing.photo_url || null, 
        category: editing.category || "management" 
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
      console.error("Save staff error:", error);
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
      toast.error(error.message);
    }
  };

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 card-shadow border border-primary/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <h2 className="font-bold text-xl tracking-tight">{isNew ? (lang === "ar" ? "إضافة عضو جديد" : "Add Team Member") : (lang === "ar" ? "تعديل بيانات العضو" : "Edit Member")}</h2>
          <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الاسم الكامل (عربي)" : "Full Name (AR)"}</label><Input value={editing.full_name_ar || ""} onChange={(e) => setEditing({ ...editing, full_name_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الاسم الكامل (إنجليزي)" : "Full Name (EN)"}</label><Input value={editing.full_name_en || ""} onChange={(e) => setEditing({ ...editing, full_name_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "المسمى الوظيفي (عربي)" : "Position (AR)"}</label><Input value={editing.position_ar || ""} onChange={(e) => setEditing({ ...editing, position_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "المسمى الوظيفي (إنجليزي)" : "Position (EN)"}</label><Input value={editing.position_en || ""} onChange={(e) => setEditing({ ...editing, position_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "السيرة (عربية)" : "Bio (AR)"}</label><Input value={editing.bio_ar || ""} onChange={(e) => setEditing({ ...editing, bio_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "السيرة (إنجليزية)" : "Bio (EN)"}</label><Input value={editing.bio_en || ""} onChange={(e) => setEditing({ ...editing, bio_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "التصنيف" : "Category"}</label>
            <select value={editing.category || "management"} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              <option value="management">{lang === "ar" ? "إدارة" : "Management"}</option>
              <option value="coach">{lang === "ar" ? "مدرب" : "Coach"}</option>
              <option value="staff">{lang === "ar" ? "موظف" : "Staff"}</option>
            </select>
          </div>
          <div className="bg-muted/30 p-6 rounded-2xl space-y-4">
            <label className="block text-sm font-bold text-muted-foreground">{lang === "ar" ? "الصورة الشخصية" : "Profile Picture"}</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading || saving} title="Upload Profile Picture" />
                <div className={`p-6 border-2 border-dashed rounded-xl text-center transition-all ${uploading ? "bg-muted animate-pulse" : "hover:border-primary hover:bg-primary/5 cursor-pointer"}`}>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-primary/50" />
                  <span className="text-xs font-medium text-muted-foreground block">{uploading ? (lang === "ar" ? "جارٍ الرفع..." : "Uploading...") : (lang === "ar" ? "رفع صورة" : "Upload Image")}</span>
                </div>
              </div>
              <Input value={editing.photo_url || ""} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} dir="ltr" placeholder="Image URL" className="text-xs flex-1" disabled={uploading || saving} />
            </div>
            {editing.photo_url && <div className="flex justify-center mt-2"><div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-black/5"><img src={editing.photo_url} alt="Preview" className="w-full h-full object-cover" /><button type="button" onClick={() => setEditing({...editing, photo_url: ""})}className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-all"><X className="w-6 h-6" /></button></div></div>}
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 py-6 rounded-xl" disabled={saving || uploading}>{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
            <Button type="button" onClick={save} className="flex-[2] py-6 rounded-xl shadow-lg shadow-primary/20" disabled={saving || uploading}>
              {saving ? <><span className="animate-spin mr-2">⏳</span> {lang === "ar" ? "جارٍ الحفظ..." : "Saving..."}</> : <><Save className="w-5 h-5 mr-2" /> {lang === "ar" ? "حفظ البيانات" : "Save Changes"}</>}
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
          <div className="bg-primary/10 p-2 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
          <div>
            <h3 className="font-bold text-foreground">{lang === "ar" ? "إدارة الفريق" : "Manage Team"}</h3>
            <p className="text-xs text-muted-foreground">{items.length} {lang === "ar" ? "عضو مسجل" : "members registered"}</p>
          </div>
        </div>
        <Button type="button" onClick={() => { setEditing({ full_name_ar: "", full_name_en: "", position_ar: "", position_en: "", bio_ar: "", bio_en: "", photo_url: "", category: "management" }); setIsNew(true); }} className="rounded-xl shadow-lg shadow-primary/10">
          <Plus className="w-4 h-4 mr-2" /> {lang === "ar" ? "إضافة عضو" : "Add Member"}
        </Button>
      </div>

      {loading && items.length === 0 ? (
        <div className="py-20 text-center"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" /><p className="text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "Loading team..."}</p></div>
      ) : (
        <div className="bg-card rounded-2xl card-shadow overflow-hidden border border-primary/5">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{lang === "ar" ? "الصورة" : "Photo"}</TableHead>
                <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                <TableHead>{lang === "ar" ? "التخصص" : "Position"}</TableHead>
                <TableHead className="text-right">{lang === "ar" ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.staff_id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-primary/10">
                      <img src={item.photo_url || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{lang === "ar" ? item.full_name_ar : item.full_name_en}</TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">{lang === "ar" ? item.position_ar : item.position_en}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => setEditing(item)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
                      <button type="button" onClick={() => remove(item.staff_id)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
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

export default AdminTeam;
