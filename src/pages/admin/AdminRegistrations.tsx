import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminRegistrations: React.FC = () => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("registrations").select("*, activities(title_ar, title_en)").order("submission_date", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch registrations error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase.from("registrations").update({ status }).eq("registration_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم تحديث الحالة" : "Status updated");
      fetchData();
    } catch (error: any) {
      console.error("Update registration status error:", error.message);
      toast.error(error.message);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    try {
      const { error } = await supabase.from("registrations").delete().eq("registration_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted"); 
      fetchData();
    } catch (error: any) {
      console.error("Delete registration error:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm">{items.length} {lang === "ar" ? "تسجيل" : "registrations"}</p>
      </div>

      {loading ? <p className="text-center py-10 opacity-50">Loading...</p> : (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
              <TableHead>{lang === "ar" ? "الهاتف" : "Phone"}</TableHead>
              <TableHead>{lang === "ar" ? "النشاط" : "Activity"}</TableHead>
              <TableHead>{lang === "ar" ? "التاريخ" : "Date"}</TableHead>
              <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.registration_id}>
                  <TableCell className="font-medium">{item.full_name}</TableCell>
                  <TableCell dir="ltr" className="text-sm font-semibold">{item.phone_number}</TableCell>
                  <TableCell className="text-sm">{lang === "ar" ? item.activities?.title_ar : item.activities?.title_en}</TableCell>
                  <TableCell dir="ltr" className="text-xs text-muted-foreground">{item.submission_date?.split("T")[0]}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.status === "approved" ? "bg-primary/20 text-primary border border-primary/20" : 
                      item.status === "rejected" ? "bg-destructive/10 text-destructive border border-destructive/20" : 
                      "bg-accent/20 text-accent-foreground border border-accent/20"
                    }`}>
                      {item.status === "approved" ? (lang === "ar" ? "مقبول" : "Approved") : 
                       item.status === "rejected" ? (lang === "ar" ? "مرفوض" : "Rejected") : 
                       (lang === "ar" ? "قيد الانتظار" : "Pending")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.status !== "approved" && (
                        <button 
                          type="button" 
                          onClick={() => updateStatus(item.registration_id, "approved")} 
                          className="p-1 hover:bg-primary/10 rounded text-primary transition-colors" 
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button 
                          type="button" 
                          onClick={() => updateStatus(item.registration_id, "rejected")} 
                          className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors" 
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => remove(item.registration_id)} 
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
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground opacity-50">
                    {lang === "ar" ? "لا توجد تسجيلات" : "No registrations found"}
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

export default AdminRegistrations;
