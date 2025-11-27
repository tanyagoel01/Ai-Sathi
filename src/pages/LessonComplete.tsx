/**
 * LESSON COMPLETE PAGE
 * 
 * Shows completion stats and next steps after finishing a lesson
 */

import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Star, ArrowRight, RotateCcw } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LessonComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const lesson = (location.state as { lesson?: { title: string } })?.lesson;
  const score = (location.state as { score?: number })?.score || 0;
  const subject = (location.state as { subject?: string })?.subject || "maths";
  const chapterId = (location.state as { chapterId?: string })?.chapterId;

  const getMessage = () => {
    if (score >= 90) return { emoji: "🏆", text: "Outstanding!", hindi: "शानदार!" };
    if (score >= 70) return { emoji: "🌟", text: "Great Job!", hindi: "बहुत अच्छा!" };
    if (score >= 50) return { emoji: "👍", text: "Good Work!", hindi: "अच्छा काम!" };
    return { emoji: "💪", text: "Keep Practicing!", hindi: "अभ्यास जारी रखें!" };
  };

  const message = getMessage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-black dark:to-black flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <Card className="max-w-md w-full p-8 shadow-lg">
        {/* Trophy Icon */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{message.emoji}</div>
          <h1 className="text-3xl font-bold mb-2">{message.text}</h1>
          <p className="text-xl text-gray-600">{message.hindi}</p>
        </div>

        {/* Lesson Title */}
        {lesson && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Completed:</p>
            <h2 className="text-xl font-semibold">{lesson.title}</h2>
          </div>
        )}

        {/* Score Display */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            <span className="text-4xl font-bold text-blue-600">{score}%</span>
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-center text-sm text-gray-600">Your Score</p>
        </div>

        {/* Encouragement */}
        <div className="p-4 bg-green-50 rounded-xl mb-6 text-center">
          <p className="text-sm text-green-800">
            {score >= 80
              ? "You're doing amazing! Keep up the great work! 🎉"
              : score >= 50
              ? "Good progress! Practice more to master this lesson! 📚"
              : "Don't worry! Try again and you'll improve! 💪"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/${subject}-chapters`, { state: { chapterId } })}
            className="w-full py-6 text-lg"
            size="lg"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Next Lesson
          </Button>
          
          <Button
            onClick={() => navigate(-2)} // Go back to learn page
            variant="outline"
            className="w-full py-6 text-lg"
            size="lg"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Practice Again
          </Button>

          <Button
            onClick={() => navigate("/subjects")}
            variant="ghost"
            className="w-full"
          >
            Back to Subjects
          </Button>
        </div>
      </Card>
    </div>
  );
}
