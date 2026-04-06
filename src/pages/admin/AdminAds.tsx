import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Save, Upload, ExternalLink, Code2, LayoutPanelTop } from "lucide-react";
import { toast } from "sonner";

const placments = [
  { value: "homepage_banner", labelAr: "الرئيسية (بانر)", labelEn: "Home Banner" },
  { value: "between_news", labelAr: "بين الأخبار", labelEn: "Between News" },
  { value: "sidebar", labelAr: "شريط جانبي", labelEn: "Sidebar" },
  { value: "under_activity", labelAr: "تحت الأنشطة", labelEn: "Under Activities" },
];

const AdminAds: React.FC = () => {
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
      const { data, error } = await (supabase as any).from("ads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch ads error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_ad_${Math.random().toString(36).substring(2)}.${ext}`;
      const filePath = `ads/${fileName}`;
      const { error } = await (supabase as any).storage.from("media").upload(filePath, file);
      if (error) throw error;
      const { data: urlData } = (supabase as any).storage.from("media").getPublicUrl(filePath);
      return urlData?.publicUrl || null;
    } catch (error: any) {
      toast.error(error.message); return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      setEditing(prev => ({ ...prev, image_url: url }));
      toast.success(lang === "ar" ? "تم رفع الصورة" : "Ad image uploaded");
    }
  };

  const save = async () => {
    if (!editing.title_ar || !editing.title_en) { toast.error(lang === "ar" ? "العنوان مطلوب" : "Title required"); return; }
    setSaving(true);
    try {
      const payload = { 
        title_ar: editing.title_ar, title_en: editing.title_en,
        ad_type: editing.ad_type || "manual",
        image_url: editing.image_url || null,
        link_url: editing.link_url || null,
        script_code: editing.script_code || null,
        placement: editing.placement || "homepage_banner",
        is_active: editing.is_active !== undefined ? editing.is_active : true
      };
      if (isNew) await (supabase as any).from("ads").insert([payload]);
      else await (supabase as any).from("ads").update(payload).eq("ad_id", editing.ad_id);
      toast.success(lang === "ar" ? "تم الحفظ" : "Saved successfully");
      setEditing(null); setIsNew(false); fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    try {
      await (supabase as any).from("ads").delete().eq("ad_id", id);
      toast.success("Deleted"); fetchData();
    } catch (error: any) { toast.error(error.message); }
  };

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 card-shadow border border-primary/10 transition-all duration-300">
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <h2 className="font-bold text-xl tracking-tight">{isNew ? (lang === "ar" ? "إضافة إعلان" : "New Ad") : (lang === "ar" ? "تعديل إعلان" : "Edit Ad")}</h2>
          <button type="button" onClick={() => { setEditing(null); setIsNew(false); }} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "العنوان (عربي)" : "Title (AR)"}</label><Input value={editing.title_ar} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} /></div>
            <div><label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "العنوان (إنجليزي)" : "Title (EN)"}</label><Input value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} dir="ltr" /></div>
          </div>
          
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <label className="block text-sm font-black text-primary mb-4 uppercase tracking-widest">{lang === "ar" ? "نوع الإعلان" : "Ad Type"}</label>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setEditing({ ...editing, ad_type: "manual" })}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${editing.ad_type === "manual" ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-muted hover:border-primary/30"}`}
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs font-bold uppercase">{lang === "ar" ? "يدوي (صورة + رابط)" : "Manual (Image & Link)"}</span>
              </button>
              <button 
                type="button"
                onClick={() => setEditing({ ...editing, ad_type: "script" })}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${editing.ad_type === "script" ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-muted hover:border-primary/30"}`}
              >
                <Code2 className="w-6 h-6" />
                <span className="text-xs font-bold uppercase">{lang === "ar" ? "تلقائي (كود / أدسنس)" : "Automatic (Script / AdSense)"}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">{lang === "ar" ? "المكان المخصص" : "Placement"}</label>
            <select value={editing.placement || "homepage_banner"} onChange={(e) => setEditing({ ...editing, placement: e.target.value })} className="w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
              {placments.map(p => <option key={p.value} value={p.value}>{lang === "ar" ? p.labelAr : p.labelEn}</option>)}
            </select>
          </div>

          {editing.ad_type === "manual" ? (
            <div className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-muted-foreground/10">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Image Link (Supabase or External)</label>
                  <Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} dir="ltr" />
                </div>
                <div className="relative">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading || saving} title="Upload" />
                   <Button variant="outline" className="h-10 px-6 rounded-xl" disabled={uploading} type="button">
                     {uploading ? (lang === "ar" ? "رفع..." : "...") : <Upload className="w-4 h-4" />}
                   </Button>
                </div>
              </div>
              <div><label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Redirect URL (External)</label><Input value={editing.link_url || ""} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} dir="ltr" placeholder="https://" /></div>
              {editing.image_url && <div className="aspect-video rounded-xl bg-black/5 overflow-hidden border-2 border-white shadow-xl max-w-sm mx-auto"><img src={editing.image_url} className="w-full h-full object-cover" alt="" /></div>}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-muted-foreground">HTML/Script Code (Paste AdSense code here)</label>
              <Textarea rows={8} value={editing.script_code || ""} onChange={(e) => setEditing({ ...editing, script_code: e.target.value })} dir="ltr" placeholder="<script async src='...'></script>" className="font-mono text-xs p-4 bg-muted/50 rounded-2xl" />
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <input type="checkbox" id="ad_active" checked={editing.is_active !== false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="w-5 h-5 rounded border-primary/30 text-primary focus:ring-primary" />
            <label htmlFor="ad_active" className="text-sm font-bold cursor-pointer select-none">{lang === "ar" ? "تفعيل الإعلان" : "Activate Ad"}</label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 py-6 rounded-xl" disabled={saving || uploading}>{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
            <Button type="button" onClick={save} className="flex-[2] py-6 rounded-xl shadow-lg shadow-primary/20" disabled={saving || uploading}>
              {saving ? <><span className="animate-spin mr-2">⏳</span> {lang === "ar" ? "جارٍ الحفظ..." : "Saving..."}</> : <><Save className="w-5 h-5 mr-2" /> {lang === "ar" ? "حفظ الإعلان" : "Save Changes"}</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-2xl card-shadow border border-primary/5">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <LayoutPanelTop className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground tracking-tight">{lang === "ar" ? "إدارة الإعلانات" : "Ad Management"}</h3>
            <p className="text-xs text-muted-foreground font-medium">{items.length} {lang === "ar" ? "إعلانات" : "ads active"}</p>
          </div>
        </div>
        <Button type="button" onClick={() => { setEditing({ title_ar: "", title_en: "", ad_type: "manual", is_active: true, placement: "homepage_banner" }); setIsNew(true); }} className="rounded-xl shadow-lg shadow-primary/10 px-6">
          <Plus className="w-4 h-4 mr-2" /> {lang === "ar" ? "إضافة إعلان" : "Create New Ad"}
        </Button>
      </div>

      <div className="bg-card rounded-2xl card-shadow overflow-hidden border border-primary/5">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">{lang === "ar" ? "الاسم" : "Title"}</TableHead>
              <TableHead className="font-bold">{lang === "ar" ? "النوع" : "Type"}</TableHead>
              <TableHead className="font-bold">{lang === "ar" ? "المكان" : "Placement"}</TableHead>
              <TableHead className="text-center font-bold">{lang === "ar" ? "الحالة" : "Status"}</TableHead>
              <TableHead className="text-right font-bold">{lang === "ar" ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.ad_id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-bold">{lang === "ar" ? item.title_ar : item.title_en}</TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.ad_type === "manual" ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
                    {item.ad_type === "manual" ? (lang === "ar" ? "يدوي" : "Manual") : (lang === "ar" ? "كود" : "Script")}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-bold text-muted-foreground uppercase opacity-70">{item.placement}</TableCell>
                <TableCell className="text-center">
                   <div className={`w-3 h-3 rounded-full mx-auto ${item.is_active ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-muted"}`} />
                </TableCell>
                <TableCell className="text-right flex gap-2 justify-end">
                  <button type="button" onClick={() => setEditing(item)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"><Pencil className="w-4 h-4" /></button>
                  <button type="button" onClick={() => remove(item.ad_id)} className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all text-destructive/40 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground opacity-50 italic">{lang === "ar" ? "لا توجد إعلانات" : "No advertisements tracked yet"}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminAds;
