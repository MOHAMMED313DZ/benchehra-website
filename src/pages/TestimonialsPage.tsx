import React, { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const TestimonialsPage: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("testimonials").select("*").eq("status", "approved").order("submission_date", { ascending: false }).then(({ data }) => setTestimonials(data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("testimonials").insert([{ author_name: name.trim(), content: content.trim(), rating }]);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(lang === "ar" ? "شكراً لك! سيتم مراجعة رأيك قبل النشر." : "Thank you! Your review will be reviewed before publishing.");
    setName(""); setContent(""); setRating(5);
  };

  return (
    <Layout>
      <section className="hero-gradient py-16" dir={dir}>
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">{t.testimonials.title}</h1>
          <p className="text-primary-foreground/70">{t.testimonials.subtitle}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12" dir={dir}>
        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {testimonials.map((item) => (
              <div key={item.testimonial_id} className="bg-card rounded-xl p-6 card-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < (item.rating || 0) ? "text-accent fill-accent" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-foreground text-sm mb-4 italic leading-relaxed">"{item.content}"</p>
                <p className="text-primary font-semibold text-sm">— {item.author_name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Submit Form */}
        <div className="max-w-lg mx-auto bg-card rounded-xl p-8 card-shadow">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">{t.testimonials.submitTitle}</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.testimonials.yourName}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.testimonials.rating}</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setRating(i + 1)}>
                    <Star className={`w-6 h-6 cursor-pointer ${i < rating ? "text-accent fill-accent" : "text-muted"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t.testimonials.yourReview}</label>
              <Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
            </div>
            <Button variant="hero" className="w-full" type="submit" disabled={submitting}>
              {submitting ? "..." : t.testimonials.submitReview}
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default TestimonialsPage;
