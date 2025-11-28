/**
 * LANGUAGE ONBOARDING SCREEN
 * 
 * First screen for non-readers:
 * - Text + Icon + Audio for each language
 * - Saves preference to localStorage
 * - Redirects to literacy assessment
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LanguageOnboarding() {
  const navigate = useNavigate();
  const { setLanguage, language } = useLanguage();
  const { play, isPlaying } = useAudioPlayer();
  const [selectedLang, setSelectedLang] = useState<"hindi" | "kannada" | "english" | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; lang: string } | null>(null);
  const [speakerAnimating, setSpeakerAnimating] = useState<string | null>(null);
  const welcomeAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleLanguageSelect = (lang: "hindi" | "kannada" | "english") => {
    setSelectedLang(lang);
  };

  const handleContinue = () => {
    if (selectedLang) {
      // Map hindi/kannada/english to hi/kn/en for context
      const langCode = selectedLang === "hindi" ? "hi" : selectedLang === "kannada" ? "kn" : "en";
      setLanguage(langCode);
      localStorage.setItem("selectedLanguage", selectedLang);
      
      // NEW FLOW: After language selection, go to class selection
      navigate("/class-selection");
    }
  };

  // Initialize welcome audio
  useEffect(() => {
    welcomeAudioRef.current = new Audio();
    return () => {
      if (welcomeAudioRef.current) {
        welcomeAudioRef.current.pause();
        welcomeAudioRef.current = null;
      }
    };
  }, []);

  // Get subtitle text based on selected language or current app language
  const getSubtitle = () => {
    const lang = selectedLang || (language === "hi" ? "hindi" : language === "kn" ? "kannada" : "english");
    if (lang === "hindi") {
      return "मैं आपकी सीखने में मदद करूँगी — अपनी भाषा चुनें!";
    } else if (lang === "kannada") {
      return "ನಾನು ನಿಮಗೆ ಕಲಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ — ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ!";
    }
    return "Let me help you learn — choose your language to begin!";
  };

  // Handle mascot tap to play welcome message
  const handleMascotTap = () => {
    if (welcomeAudioRef.current) {
      // Determine language: use selectedLang, or fallback to current app language, or default to English
      const lang = selectedLang || (language === "hi" ? "hindi" : language === "kn" ? "kannada" : "english");
      
      // Try to play local audio file first, fallback to TTS
      const audioPath = lang === "hindi" 
        ? "/audio/welcome-hi.mp3" 
        : lang === "kannada"
        ? "/audio/welcome-kn.mp3"
        : "/audio/welcome-en.mp3";
      
      welcomeAudioRef.current.src = audioPath;
      welcomeAudioRef.current.play().catch(() => {
        // Fallback to TTS if audio file doesn't exist
        const text = lang === "hindi"
          ? "मैं आपकी सीखने में मदद करूँगी — अपनी भाषा चुनें!"
          : lang === "kannada"
          ? "ನಾನು ನಿಮಗೆ ಕಲಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ — ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ!"
          : "Let me help you learn — choose your language to begin!";
        const ttsLang = lang === "hindi" ? "hi-IN" : lang === "kannada" ? "kn-IN" : "en-US";
        play(text, ttsLang).catch(console.error);
      });
    }
  };

  // Handle ripple effect on language tile tap
  const handleLanguageTileClick = (e: React.MouseEvent<HTMLButtonElement>, lang: "hindi" | "kannada" | "english") => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, lang });
    setTimeout(() => setRipple(null), 600);
    handleLanguageSelect(lang);
  };

  const playLanguageAudio = (lang: "hindi" | "kannada" | "english", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPlaying) return;
    
    setSpeakerAnimating(lang);
    setTimeout(() => setSpeakerAnimating(null), 1000);
    
    const text = lang === "hindi" ? "हिंदी" : lang === "kannada" ? "ಕನ್ನಡ" : "English";
    const ttsLang = lang === "hindi" ? "hi-IN" : lang === "kannada" ? "kn-IN" : "en-US";
    play(text, ttsLang).catch(console.error);
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes floatShape {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
        }
        .mascot-float {
          animation: float 3s ease-in-out infinite;
        }
        .mascot-wave {
          animation: wave 2s ease-in-out infinite;
        }
        .shape-float {
          animation: floatShape 6s ease-in-out infinite;
        }
        .shape-float-delay-1 {
          animation: floatShape 8s ease-in-out infinite 1s;
        }
        .shape-float-delay-2 {
          animation: floatShape 7s ease-in-out infinite 2s;
        }
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.3);
          pointer-events: none;
          animation: ripple 0.6s ease-out;
        }
        .speaker-pulse {
          animation: pulse 0.8s ease-in-out;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full shape-float"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/30 rounded-full shape-float-delay-1"></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-pink-200/30 rounded-full shape-float-delay-2"></div>
          <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-blue-200/30 rounded-full shape-float"></div>
          <div className="absolute top-1/2 left-1/3 w-10 h-10 bg-purple-200/20 rounded-full shape-float-delay-1"></div>
          <div className="absolute top-1/3 right-1/4 w-18 h-18 bg-pink-200/20 rounded-full shape-float-delay-2"></div>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate("/");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate("/");
          }}
          className="absolute top-4 left-4 z-50 rounded-full hover:bg-white/80 backdrop-blur-sm min-h-[44px] min-w-[44px] touch-manipulation"
          aria-label="Go back to home page"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="max-w-md w-full p-8 shadow-2xl border-2 border-blue-100 dark:border-gray-700 relative z-10">
          {/* Teacher Mascot with Animation */}
          <div className="text-center mb-4">
            <div className="relative inline-block">
              <div 
                className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1 shadow-lg cursor-pointer hover:scale-105 transition-transform mascot-float"
                onClick={handleMascotTap}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMascotTap();
                  }
                }}
                aria-label="Tap to hear welcome message"
              >
                <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden mascot-wave">
                  <img
                    src="/teacher-mascot.jpg"
                    alt="AI Sathi Teacher"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>
            {/* Friendly Subtitle */}
            <p className="text-sm md:text-base text-gray-600 font-medium px-4 mb-2">
              {getSubtitle()}
            </p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Select Your Language
            </h1>
            <h2 className="text-lg font-bold text-gray-600 dark:text-gray-400">
              अपनी भाषा चुनें | ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ
            </h2>
          </div>

        <div className="space-y-4 mb-8">
          {/* Hindi Button */}
          <button
            onClick={(e) => handleLanguageTileClick(e, "hindi")}
            className={`w-full p-6 rounded-lg border-2 transition-all flex items-center justify-between relative overflow-hidden ${
              selectedLang === "hindi"
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-800 shadow-md scale-[1.02]"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98]"
            }`}
          >
            {ripple && ripple.lang === "hindi" && (
              <span
                className="ripple-effect"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: "20px",
                  height: "20px",
                }}
              />
            )}
            <div className="flex items-center gap-4">
              <span className="text-4xl">🇮🇳</span>
              <span className="text-2xl font-bold text-foreground">हिंदी</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => playLanguageAudio("hindi", e)}
              disabled={isPlaying}
              className={`hover:bg-blue-100 dark:hover:bg-gray-700 ${speakerAnimating === "hindi" ? "speaker-pulse" : ""}`}
            >
              <Volume2 className={`h-6 w-6 text-blue-600 dark:text-blue-400 ${speakerAnimating === "hindi" ? "animate-pulse" : ""}`} />
            </Button>
          </button>

          {/* Kannada Button */}
          <button
            onClick={(e) => handleLanguageTileClick(e, "kannada")}
            className={`w-full p-6 rounded-lg border-2 transition-all flex items-center justify-between relative overflow-hidden ${
              selectedLang === "kannada"
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-800 shadow-md scale-[1.02]"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98]"
            }`}
          >
            {ripple && ripple.lang === "kannada" && (
              <span
                className="ripple-effect"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: "20px",
                  height: "20px",
                }}
              />
            )}
            <div className="flex items-center gap-4">
              <span className="text-4xl">🇮🇳</span>
              <span className="text-2xl font-bold text-foreground">ಕನ್ನಡ</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => playLanguageAudio("kannada", e)}
              disabled={isPlaying}
              className={`hover:bg-blue-100 dark:hover:bg-gray-700 ${speakerAnimating === "kannada" ? "speaker-pulse" : ""}`}
            >
              <Volume2 className={`h-6 w-6 text-blue-600 dark:text-blue-400 ${speakerAnimating === "kannada" ? "animate-pulse" : ""}`} />
            </Button>
          </button>

          {/* English Button */}
          <button
            onClick={(e) => handleLanguageTileClick(e, "english")}
            className={`w-full p-6 rounded-lg border-2 transition-all flex items-center justify-between relative overflow-hidden ${
              selectedLang === "english"
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-800 shadow-md scale-[1.02]"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98]"
            }`}
          >
            {ripple && ripple.lang === "english" && (
              <span
                className="ripple-effect"
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  width: "20px",
                  height: "20px",
                }}
              />
            )}
            <div className="flex items-center gap-4">
              <span className="text-4xl">🇬🇧</span>
              <span className="text-2xl font-bold text-foreground">English</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => playLanguageAudio("english", e)}
              disabled={isPlaying}
              className={`hover:bg-blue-100 dark:hover:bg-gray-700 ${speakerAnimating === "english" ? "speaker-pulse" : ""}`}
            >
              <Volume2 className={`h-6 w-6 text-blue-600 dark:text-blue-400 ${speakerAnimating === "english" ? "animate-pulse" : ""}`} />
            </Button>
          </button>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedLang}
          className="w-full py-6 text-xl"
          size="lg"
        >
          {selectedLang === "hindi" ? "जारी रखें" : selectedLang === "kannada" ? "ಮುಂದುವರಿಸಿ" : "Continue"}
        </Button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          {selectedLang === "hindi" 
            ? "🔊 किसी भी शब्द को सुनने के लिए स्पीकर आइकन दबाएं"
            : selectedLang === "kannada"
            ? "🔊 ಯಾವುದೇ ಪದವನ್ನು ಕೇಳಲು ಸ್ಪೀಕರ್ ಐಕಾನ್ ಟ್ಯಾಪ್ ಮಾಡಿ"
            : "🔊 Tap speaker icon to hear any word"}
        </p>
      </Card>
    </div>
    </>
  );
}
