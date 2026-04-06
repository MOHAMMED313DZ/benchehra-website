import { useState, useEffect, createContext, useContext, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem("is_admin") === "true";
  });
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  const updateAdminStatus = useCallback((status: boolean) => {
    setIsAdmin(status);
    if (status) sessionStorage.setItem("is_admin", "true");
    else sessionStorage.removeItem("is_admin");
  }, []);

  const checkAdmin = useCallback(async (userId: string) => {
    try {
      console.log("AuthProvider: Checking admin status for", userId);
      const rpcPromise = supabase.rpc("is_admin", { _user_id: userId });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("RPC Timeout")), 4000));
      
      const res = await Promise.race([rpcPromise, timeoutPromise]) as any;
      
      if (res?.error) {
        console.error("checkAdmin error:", res.error.message);
        return sessionStorage.getItem("is_admin") === "true";
      }
      const status = !!res?.data;
      updateAdminStatus(status);
      return status;
    } catch (err) {
      console.error("checkAdmin failure:", err);
      return sessionStorage.getItem("is_admin") === "true";
    }
  }, [updateAdminStatus]);

  const refreshAdminStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await checkAdmin(session.user.id);
    } else {
      updateAdminStatus(false);
    }
  }, [checkAdmin, updateAdminStatus]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const init = async () => {
      try {
        console.log("AuthProvider: Initializing session...");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await checkAdmin(initialSession.user.id);
        } else {
          updateAdminStatus(false);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth Event:", event);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (newSession?.user) {
           await checkAdmin(newSession.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        updateAdminStatus(false);
      }
      
      if (event !== "INITIAL_SESSION") {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdmin, updateAdminStatus]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.user) {
      await checkAdmin(data.user.id);
      setUser(data.user);
      setSession(data.session);
    }
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      updateAdminStatus(false);
      setUser(null);
      setSession(null);
      sessionStorage.clear();
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    user, session, isAdmin, loading, signIn, signOut, refreshAdminStatus
  }), [user, session, isAdmin, loading, checkAdmin, updateAdminStatus]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
