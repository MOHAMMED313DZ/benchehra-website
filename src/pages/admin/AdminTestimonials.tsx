import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Save, Quote } from "lucide-react";
import { toast } from "sonner";

const AdminTestimonials: React.FC = () => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("testimonials").select("*").order("testimonial_id");
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch testimonials error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const save = async () => {
    if (!editing.name_ar || !editing.name_en) { toast.error(lang === "ar" ? "الاسم مطلوب" : "Name required"); return; }
    
    setSaving(true);
    console.log("Saving testimonial started...", editing);
    
    try {
      const payload = { 
        name_ar: editing.name_ar, name_en: editing.name_en, 
        role_ar: editing.role_ar || "", role_en: editing.role_en || "", 
        content_ar: editing.content_ar || "", content_en: editing.content_en || "", 
        image_url: editing.image_url || null, 
        rating: editing.rating || 5 
      };

      if (isNew) {
        const { error } = await supabase.from("testimonials").insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").update(payload).eq("testimonial_id", editing.testimonial_id);
        if (error) throw error;
      }
      
      console.log("Database operation successful");
      toast.success(lang === "ar" ? "تم الحفظ بنجاح" : "Saved successfully");
      
      setEditing(null);
      setIsNew(false);
      fetchData();
    } catch (error: any) {
      console.error("Save testimonial error:", error);
      toast.error(error.message || (lang === "ar" ? "حدث خطأ أثناء الحفظ" : "Error saving"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    try {
      await supabase.from("testimonials").delete().eq("testimonial_id", id);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 card-shadow border border-primary/10">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="font-bold text-xl">{isNew ? (lang === "ar" ? "إضافة رأي جديد" : "Add Testimonial") : (lang === "ar" ? "تعديل الرأي" : "Edit Testimonial")}</h2>
          <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-muted rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الاسم (عربي)" : "Name (AR)"}</label><Input value={editing.name_ar} onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الاسم (إنجليزي)" : "Name (EN)"}</label><Input value={editing.name_en} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} dir="ltr" /></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الرأي (عربي)" : "Content (AR)"}</label><Textarea value={editing.content_ar} onChange={(e) => setEditing({ ...editing, content_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "الرأي (إنجليزي)" : "Content (EN)"}</label><Textarea value={editing.content_en} onChange={(e) => setEditing({ ...editing, content_en: e.target.value })} dir="ltr" /></div>
          </div>
          <Button type="button" onClick={save} className="w-full py-6 rounded-xl" disabled={saving}>
            {saving ? (lang === "ar" ? "جارٍ الحفظ..." : "Saving...") : (lang === "ar" ? "حفظ" : "Save")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-2xl card-shadow">
        <div className="flex items-center gap-3"><Quote className="w-5 h-5 text-primary" /><h3 className="font-bold">{lang === "ar" ? "آراء المشتركين" : "Testimonials"}</h3></div>
        <Button type="button" onClick={() => { setEditing({ name_ar: "", name_en: "", content_ar: "", content_en: "" }); setIsNew(true); }}><Plus className="w-4 h-4 mr-2" />{lang === "ar" ? "إضافة" : "Add"}</Button>
      </div>

      <div className="bg-card rounded-2xl card-shadow overflow-hidden border">
        <Table>
          <TableHeader><TableRow><TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead><TableHead className="text-right">{lang === "ar" ? "إجراءات" : "Actions"}</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.testimonial_id}>
                <TableCell className="font-bold">{lang === "ar" ? item.name_ar : item.name_en}</TableCell>
                <TableCell className="text-right flex gap-2 justify-end"><button type="button" onClick={() => setEditing(item)} className="p-2 hover:bg-primary/10 rounded-xl"><Pencil className="w-4 h-4" /></button><button type="button" onClick={() => remove(item.testimonial_id)} className="p-2 hover:bg-destructive/10 rounded-xl text-destructive"><Trash2 className="w-4 h-4" /></button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminTestimonials;
