import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SubjectCard } from "@/components/SubjectCard";
import { Calculator, Globe, Wifi, WifiOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

const Subjects = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online!");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.info("Offline mode - AI Sathi still works!");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.log("Service worker registration failed:", error);
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const selectedClass = localStorage.getItem("selectedClass");

  const subjects = [
    {
      titleKey: "Maths",
      descriptionKey: selectedClass === "1"
        ? "Class 1 NCERT - Numbers, Addition, Fractions"
        : selectedClass === "6"
          ? "Class 6 NCERT - Numbers, Addition, Fractions"
          : "Grade 5 NCERT - Numbers, Addition, Fractions",
      icon: Calculator,
      color: "primary" as const,
      route: "/maths-chapters",
    },
    {
      titleKey: "Science",
      descriptionKey: selectedClass === "6"
        ? "Class 6 NCERT - Body, Plants, Weather"
        : "Grade 5 NCERT - Body, Plants, Weather",
      icon: Globe,
      color: "accent" as const,
      route: "/science-chapters",
    },
  ].filter(subject => {
    // Hide Science for Class 1
    if (selectedClass === "1" && subject.titleKey === "Science") {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Top Navigation */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <div className="px-6 pt-8 pb-8 text-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shadow-[var(--shadow-medium)] overflow-hidden border-2 border-primary/20">
          <img
            src="/teacher-mascot.jpg"
            alt="AI Sathi Teacher"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            AI Sathi
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your personal AI tutor that works without internet. Learn anytime, anywhere!
          </p>
        </div>

        {/* Offline Status Badge */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {isOnline ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <Wifi className="w-3 h-3" />
              {t("Online")}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-success bg-success/10 px-3 py-1.5 rounded-full">
              <WifiOff className="w-3 h-3" />
              {t("Offline Mode Active ✨")}
            </div>
          )}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="px-6 pb-8 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{t("Choose a Subject")}</h2>
        <div className="grid gap-4">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.titleKey}
              title={t(subject.titleKey)}
              description={t(subject.descriptionKey)}
              icon={subject.icon}
              color={subject.color}
              onClick={() => {
                if (subject.route === "/science-chapters" || subject.route === "/maths-chapters" || subject.route === "/language-learning") {
                  navigate(subject.route);
                } else {
                  toast.info(t("Coming Soon") + "! Start with " + t("Maths") + " for now.");
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Quick Start CTA */}
      <div className="px-6 pb-12">
        <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl border border-primary/20 space-y-4">
          <h3 className="font-semibold text-foreground">{t("Ready to Learn?")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("Ask me anything! I'll explain step-by-step in simple language.")}
          </p>
          <Button
            onClick={() => navigate("/chat")}
            className="w-full rounded-2xl h-12 bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
          >
            {t("Start Learning Now →")}
          </Button>
        </div>
      </div>

      {/* Info Footer */}
      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-muted-foreground">
          {t("Works completely offline • NCERT aligned • Free forever")}
        </p>
      </div>
    </div>
  );
};

export default Subjects;
