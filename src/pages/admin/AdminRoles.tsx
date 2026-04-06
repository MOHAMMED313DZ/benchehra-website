import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2, ShieldCheck, UserPlus, Search, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminRoles: React.FC = () => {
  const { lang, dir } = useLanguage();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAdmins(data || []);
    } catch (error: any) {
      console.error("Fetch admins error:", error.message);
      toast.error(lang === "ar" ? "فشل تحميل المسؤولين" : "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const searchUser = async () => {
    if (!searchEmail) return;
    setSearching(true);
    setFoundUser(null);
    try {
      // We look in profiles table first
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", searchEmail.toLowerCase().trim())
        .single();
      
      if (error) {
         toast.error(lang === "ar" ? "المستخدم غير موجود" : "User not found");
      } else {
         setFoundUser(data);
      }
    } catch (error: any) {
      console.error("Search user error:", error);
    } finally {
      setSearching(false);
    }
  };

  const addAdmin = async (userId: string, displayName: string) => {
    if (admins.find(a => a.user_id === userId)) {
      toast.error(lang === "ar" ? "هذا المستخدم هو مسؤول بالفعل" : "User is already an admin");
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase
        .from("admin_profiles")
        .insert([{ user_id: userId, display_name: displayName }]);
      
      if (error) throw error;
      
      toast.success(lang === "ar" ? "تمت إضافة المسؤول بنجاح" : "Admin added successfully");
      setSearchEmail("");
      setFoundUser(null);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (id: string, userId: string) => {
    // Prevent removing yourself if possible, but we don't have current user ID here easily without useAuth
    // So we just confirm
    if (!confirm(lang === "ar" ? "هل أنت متأكد من سحب صلاحيات المسؤول؟" : "Are you sure you want to remove admin privileges?")) return;
    
    try {
      const { error } = await supabase
        .from("admin_profiles")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success(lang === "ar" ? "تم سحب الصلاحيات" : "Privileges revoked");
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-card rounded-3xl p-8 card-shadow border border-primary/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">{lang === "ar" ? "إدارة الصلاحيات" : "Role Management"}</h2>
            <p className="text-muted-foreground text-sm font-medium">{lang === "ar" ? "إضافة أو إزالة المسؤولين عن لوحة التحكم" : "Add or remove administrators for the control panel"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* SEARCH & ADD SECTION */}
          <div className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                {lang === "ar" ? "إضافة مسؤول جديد" : "Add New Admin"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {lang === "ar" 
                  ? "ابحث عن المستخدم بواسطة بريده الإلكتروني المسجل لمنحه صلاحيات المسؤول." 
                  : "Search for a user by their registered email to grant them admin privileges."}
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder={lang === "ar" ? "البريد الإلكتروني..." : "Email address..."}
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                  />
                </div>
                <Button 
                  onClick={searchUser} 
                  disabled={searching || !searchEmail}
                  className="h-12 px-6 rounded-xl shadow-lg shadow-primary/10"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {foundUser && (
                <div className="mt-6 p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-between animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
                      {foundUser.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{foundUser.full_name}</p>
                      <p className="text-xs text-muted-foreground">{foundUser.email}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => addAdmin(foundUser.user_id, foundUser.full_name)}
                    disabled={adding}
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                    {lang === "ar" ? "تعيين كمسؤول" : "Grant Admin"}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-600/80 leading-relaxed font-medium">
                {lang === "ar" 
                  ? "تحذير: المسؤولون لديهم حق الوصول الكامل لتغيير كافة محتويات الموقع وحذف البيانات. يرجى توخي الحذر عند منح الصلاحيات." 
                  : "Warning: Admins have full access to change all site content and delete data. Please be cautious when granting privileges."}
              </div>
            </div>
          </div>

          {/* ADMIN LIST SECTION */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 px-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {lang === "ar" ? "قائمة المسؤولين الحاليين" : "Current Administrators"}
            </h3>
            
            {loading ? (
               <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" /></div>
            ) : (
              <div className="bg-background rounded-2xl border border-primary/5 overflow-hidden card-shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold">{lang === "ar" ? "الاسم" : "Name"}</TableHead>
                      <TableHead className="text-right">{lang === "ar" ? "إجراءات" : "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id} className="hover:bg-muted/30 transition-colors group">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{admin.display_name || "Admin"}</span>
                            <span className="text-[10px] text-muted-foreground font-medium" dir="ltr">{admin.user_id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <button 
                            onClick={() => removeAdmin(admin.id, admin.user_id)}
                            className="p-2 hover:bg-destructive/10 rounded-xl text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                            title={lang === "ar" ? "سحب الصلاحيات" : "Revoke Access"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {admins.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-10 opacity-50 italic">
                          {lang === "ar" ? "لا يوجد مسؤولين" : "No administrators found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoles;
