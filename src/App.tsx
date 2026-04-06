import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import HomePage from "./pages/HomePage";
import ActivitiesPage from "./pages/ActivitiesPage";
import GalleryPage from "./pages/GalleryPage";
import NewsPage from "./pages/NewsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import TeamPage from "./pages/TeamPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import RegistrationPage from "./pages/RegistrationPage";
import ReportPage from "./pages/ReportPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserLoginPage from "./pages/UserLoginPage";
import MyActivitiesPage from "./pages/MyActivitiesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/registration" element={<RegistrationPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/login" element={<UserLoginPage />} />
              <Route path="/my-activities" element={<MyActivitiesPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
