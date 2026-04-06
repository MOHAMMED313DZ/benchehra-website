import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Check, Trash2, Eye, X } from "lucide-react";
import { toast } from "sonner";

const AdminReports: React.FC = () => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("reports").select("*").order("submission_date", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch reports error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase.from("reports").update({ status }).eq("report_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم تحديث الحالة" : "Status updated");
      fetchData();
    } catch (error: any) {
      console.error("Update report status error:", error.message);
      toast.error(error.message);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    try {
      const { error } = await supabase.from("reports").delete().eq("report_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted"); 
      fetchData();
    } catch (error: any) {
      console.error("Delete report error:", error.message);
      toast.error(error.message);
    }
  };

  if (viewing) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-xl p-6 card-shadow border border-primary/10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">{lang === "ar" ? `بلاغ #${viewing.report_id}` : `Report #${viewing.report_id}`}</h2>
          <button type="button" onClick={() => setViewing(null)} className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">{lang === "ar" ? "النوع" : "Type"}</span>
              <span className="font-medium">{viewing.issue_type}</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">{lang === "ar" ? "الموقع" : "Location"}</span>
              <span className="font-medium">{viewing.location}</span>
            </div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">{lang === "ar" ? "الوصف" : "Description"}</span>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{viewing.description}</p>
          </div>
          {viewing.reporter_info && (
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">{lang === "ar" ? "معلومات الاتصال" : "Contact Info"}</span>
              <span className="text-sm">{viewing.reporter_info}</span>
            </div>
          )}
          <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
            <div>
              <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">{lang === "ar" ? "الحالة" : "Status"}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                viewing.status === "resolved" ? "bg-primary/20 text-primary" : 
                viewing.status === "in_progress" ? "bg-accent/20 text-accent-foreground" : 
                "bg-muted text-muted-foreground"
              }`}>
                {viewing.status === "resolved" ? (lang === "ar" ? "تم الحل" : "Resolved") : 
                 viewing.status === "in_progress" ? (lang === "ar" ? "قيد المعالجة" : "In Progress") : 
                 (lang === "ar" ? "جديد" : "New")}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">{lang === "ar" ? "التاريخ" : "Date"}</span>
              <span className="text-xs text-muted-foreground" dir="ltr">{viewing.submission_date?.split("T")[0]}</span>
            </div>
          </div>
          {viewing.status !== "resolved" && (
            <button 
              type="button" 
              onClick={() => { updateStatus(viewing.report_id, "resolved"); setViewing(null); }} 
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              <Check className="w-4 h-4" />
              {lang === "ar" ? "تحديد كـ تم الحل" : "Mark as Resolved"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm">{items.length} {lang === "ar" ? "بلاغ" : "reports"}</p>
      </div>

      {loading ? <p className="text-center py-10 opacity-50">Loading...</p> : (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{lang === "ar" ? "النوع" : "Type"}</TableHead>
              <TableHead>{lang === "ar" ? "الموقع" : "Location"}</TableHead>
              <TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
              <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.report_id}>
                  <TableCell className="font-medium">{item.issue_type}</TableCell>
                  <TableCell className="text-sm">{item.location}</TableCell>
                  <TableCell dir="ltr" className="text-xs text-muted-foreground">{item.submission_date?.split("T")[0]}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.status === "resolved" ? "bg-primary/20 text-primary" : 
                      item.status === "in_progress" ? "bg-accent/20 text-accent-foreground" : 
                      "bg-muted text-muted-foreground"
                    }`}>
                      {item.status === "resolved" ? (lang === "ar" ? "تم الحل" : "Resolved") : 
                       item.status === "in_progress" ? (lang === "ar" ? "قيد المعالجة" : "In Progress") : 
                       (lang === "ar" ? "جديد" : "New")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setViewing(item)} className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground" title="View"><Eye className="w-4 h-4" /></button>
                      {item.status !== "resolved" && (
                        <button 
                          type="button" 
                          onClick={() => updateStatus(item.report_id, "resolved")} 
                          className="p-1 hover:bg-primary/10 rounded text-primary transition-colors" 
                          title="Resolve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => remove(item.report_id)} 
                        className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground opacity-50">
                    {lang === "ar" ? "لا توجد بلاغات" : "No reports found"}
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

export default AdminReports;
