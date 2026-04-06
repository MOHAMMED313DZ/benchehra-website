import { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  const checkAdmin = useCallback(async (userId: string) => {
    try {
      console.log("AuthProvider: Checking admin status for", userId);
      // Timeout the RPC call to prevent platform hanging
      const rpcPromise = supabase.rpc("is_admin", { _user_id: userId });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("RPC Timeout")), 3000));
      
      const { data, error } = await Promise.race([rpcPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error("checkAdmin error:", error.message);
        return false;
      }
      return !!data;
    } catch (err) {
      console.error("checkAdmin failure:", err);
      return false;
    }
  }, []);

  const refreshAdminStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const admin = await checkAdmin(session.user.id);
      setIsAdmin(admin);
    } else {
      setIsAdmin(false);
    }
  }, [checkAdmin]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Failsafe: Ensure loading is ALWAYS false after 5 seconds
    const failsafe = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const init = async () => {
      try {
        console.log("AuthProvider: Initializing session...");
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          const admin = await checkAdmin(initialSession.user.id);
          setIsAdmin(admin);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoading(false);
        clearTimeout(failsafe);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth Event:", event);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        const admin = await checkAdmin(newSession.user.id);
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(failsafe);
    };
  }, [checkAdmin]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.user) {
      const admin = await checkAdmin(data.user.id);
      setIsAdmin(admin);
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
      setIsAdmin(false);
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut, refreshAdminStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
