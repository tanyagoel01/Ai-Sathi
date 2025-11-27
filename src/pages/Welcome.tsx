/**
 * WELCOME/HOME PAGE
 * 
 * Cute landing page with teacher mascot
 * Shows before language selection
 */

import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Zap, Heart, Volume2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Welcome() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMascotClick = () => {
    if (videoRef.current) {
      // If video is playing, pause it and reset to start
      if (!videoRef.current.paused) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // Reset to beginning
      } else {
        // If video is paused, unmute and play it from start
        videoRef.current.muted = false;
        videoRef.current.currentTime = 0; // Start from beginning
        videoRef.current.play().catch((error) => {
          console.error('Error playing video with audio:', error);
        });
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes mascotWave {
          0%, 100% { transform: rotate(0deg) translateY(0px); }
          25% { transform: rotate(15deg) translateY(-5px); }
          50% { transform: rotate(0deg) translateY(0px); }
          75% { transform: rotate(-15deg) translateY(-5px); }
        }
        .mascot-float {
          animation: mascotFloat 4s ease-in-out infinite;
        }
        .mascot-wave {
          animation: mascotWave 2.5s ease-in-out infinite;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 dark:from-black dark:via-black dark:to-black relative overflow-hidden">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        {/* Floating Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "1s" }}></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "0.5s" }}></div>
          <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-purple-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: "1.5s" }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12 relative">
          {/* Teacher Mascot - Large Hero with Animation */}
          <div className="text-center mb-8 animate-in fade-in zoom-in duration-700">
            <div className="relative inline-block">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              
              {/* Mascot Container */}
              <div 
                className="relative w-48 h-48 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-2 shadow-2xl transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={handleMascotClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMascotClick();
                  }
                }}
                aria-label="Tap to hear mascot voice"
              >
                <div className="relative w-full h-full rounded-full bg-white p-2 overflow-hidden">
                  <video
                    ref={videoRef}
                    src="/mascot-video.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover rounded-full"
                    aria-label="AI Sathi Teacher"
                    onError={(e) => {
                      console.error('Video failed to load:', e);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Audio Indicator Icon */}
                  <div className="absolute bottom-2 right-2 bg-white/90 rounded-full p-1.5 shadow-md">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              </div>

            {/* Floating Sparkles around mascot */}
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-pink-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
            <Heart className="absolute top-4 -left-8 w-6 h-6 text-red-400 animate-bounce" style={{ animationDelay: "1s" }} />
            <Heart className="absolute top-4 -right-8 w-6 h-6 text-red-400 animate-bounce" style={{ animationDelay: "1.5s" }} />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <h1 className="text-6xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Sathi
            </span>
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
            Powered by Small Language Models (SLM)
          </p>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Built for Rural India 🇮🇳
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Button
            onClick={() => navigate("/language-onboarding")}
            size="lg"
            className="text-xl px-12 py-8 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <Sparkles className="w-6 h-6 mr-3" />
            Start Learning!
            <Sparkles className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
