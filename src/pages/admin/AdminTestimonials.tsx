import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Check, X, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

const AdminTestimonials: React.FC = () => {
  const { lang } = useLanguage();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("testimonials").select("*").order("submission_date", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Fetch testimonials error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase.from("testimonials").update({ status }).eq("testimonial_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم تحديث الحالة" : "Status updated");
      fetchData();
    } catch (error: any) {
      console.error("Update testimonial status error:", error.message);
      toast.error(error.message);
    }
  };

  const remove = async (id: number) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("testimonial_id", id);
      if (error) throw error;
      toast.success(lang === "ar" ? "تم الحذف" : "Deleted"); 
      fetchData();
    } catch (error: any) {
      console.error("Delete testimonial error:", error.message);
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground text-sm">{items.length} {lang === "ar" ? "شهادة" : "testimonials"}</p>
      </div>
      
      {loading ? <p className="text-center py-10 opacity-50">Loading...</p> : (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
              <TableHead>{lang === "ar" ? "المحتوى" : "Content"}</TableHead>
              <TableHead>{lang === "ar" ? "التقييم" : "Rating"}</TableHead>
              <TableHead>{lang === "ar" ? "الحالة" : "Status"}</TableHead>
              <TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.testimonial_id}>
                  <TableCell className="font-medium">{item.author_name}</TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm line-clamp-2" title={item.content}>{item.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < (item.rating || 0) ? "text-accent fill-accent" : "text-muted opacity-30"}`} 
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.status === "approved" ? "bg-primary/20 text-primary" : 
                      item.status === "rejected" ? "bg-destructive/10 text-destructive" : 
                      "bg-accent/20 text-accent-foreground"
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
                          onClick={() => updateStatus(item.testimonial_id, "approved")} 
                          className="p-1 hover:bg-primary/10 rounded text-primary transition-colors" 
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {item.status !== "rejected" && (
                        <button 
                          type="button" 
                          onClick={() => updateStatus(item.testimonial_id, "rejected")} 
                          className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors" 
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        type="button" 
                        onClick={() => remove(item.testimonial_id)} 
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
                    {lang === "ar" ? "لا توجد شهادات" : "No testimonials found"}
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

export default AdminTestimonials;
