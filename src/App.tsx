import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Welcome from "./pages/Welcome";
import LanguageOnboarding from "./pages/LanguageOnboarding";
import Quiz from "./pages/Quiz";
import Learn from "./pages/Learn";
import LessonComplete from "./pages/LessonComplete";
import ClassSelection from "./pages/ClassSelection";
import Subjects from "./pages/Subjects";
import Chat from "./pages/Chat";
import MathChat from "./pages/MathChat";
import PracticeMode from "./pages/PracticeMode";
import ScienceChapters from "./pages/ScienceChapters";
import MathsChapters from "./pages/MathsChapters";
import NotFound from "./pages/NotFound";

// Language Learning Module
import LanguageLearningHub from "./pages/LanguageLearning/LanguageLearningHub";
import HindiCourse from "./pages/LanguageLearning/HindiCourse";
import HindiLessonView from "./pages/LanguageLearning/HindiLessonView";
import HindiAlphabetCourse from "./pages/LanguageLearning/HindiAlphabetCourse";
import HindiAlphabetLessonView from "./pages/LanguageLearning/HindiAlphabetLessonView";
import EnglishCourse from "./pages/LanguageLearning/EnglishCourse";
import EnglishLessonView from "./pages/LanguageLearning/EnglishLessonView";
import PictureDictionary from "./pages/LanguageLearning/PictureDictionary";
import StoryMode from "./pages/LanguageLearning/StoryMode";
import MultiStudentManager from "./pages/LanguageLearning/MultiStudentManager";
import ProgressDashboard from "./pages/LanguageLearning/ProgressDashboard";

// Helper to check if user has selected language
const hasSelectedLanguage = () => {
  return localStorage.getItem("selectedLanguage") !== null;
};

// Helper to check if user has selected class
const hasSelectedClass = () => {
  return localStorage.getItem("selectedClass") !== null;
};

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Landing Page - Cute Welcome Screen */}
            <Route path="/" element={<Welcome />} />

            {/* NEW FLOW: Welcome → Language → Class → Subjects */}
            <Route path="/get-started" element={
              !hasSelectedLanguage() ? <Navigate to="/language-onboarding" replace /> :
                !hasSelectedClass() ? <Navigate to="/class-selection" replace /> :
                  <Navigate to="/subjects" replace />
            } />

            {/* Step 1: Language Selection */}
            <Route path="/language-onboarding" element={<LanguageOnboarding />} />

            {/* Step 2: Class Selection (5-10, only 5 enabled) */}
            <Route path="/class-selection" element={<ClassSelection />} />

            {/* Step 3: Subjects (Maths, Science) */}
            <Route path="/subjects" element={<Subjects />} />

            {/* Old Quiz Flow - Keeping for backward compatibility */}
            <Route path="/quiz" element={<Quiz />} />

            {/* Learning Routes */}
            <Route path="/learn" element={<Learn />} />
            <Route path="/lesson-complete" element={<LessonComplete />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/science-chapters" element={<ScienceChapters />} />
            <Route path="/maths-chapters" element={<MathsChapters />} />
            
            {/* Math AI Tutor Routes */}
            <Route path="/math-chat" element={<MathChat />} />
            <Route path="/practice-mode" element={<PracticeMode />} />

            {/* Language Learning Module Routes */}
            <Route path="/language-learning" element={<LanguageLearningHub />} />
            <Route path="/language-learning/alphabet-course" element={<HindiAlphabetCourse />} />
            <Route path="/language-learning/alphabet-lesson/:lessonId" element={<HindiAlphabetLessonView />} />
            <Route path="/language-learning/hindi-course" element={<HindiCourse />} />
            <Route path="/language-learning/hindi-lesson/:lessonId" element={<HindiLessonView />} />
            <Route path="/language-learning/english-course" element={<EnglishCourse />} />
            <Route path="/language-learning/english-lesson/:lessonId" element={<EnglishLessonView />} />
            <Route path="/language-learning/picture-dictionary" element={<PictureDictionary />} />
            <Route path="/language-learning/stories" element={<StoryMode />} />
            <Route path="/language-learning/story/:storyId" element={<StoryMode />} />
            <Route path="/language-learning/profiles" element={<MultiStudentManager />} />
            <Route path="/language-learning/dashboard" element={<ProgressDashboard />} />


            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
