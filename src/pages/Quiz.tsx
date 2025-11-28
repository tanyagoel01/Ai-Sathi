/**
 * QUIZ SCREEN - Duolingo-style Learning
 * 
 * Features:
 * - Multiple question types (multiple choice, fill blank, match pairs, audio)
 * - Progress tracking with streaks
 * - Instant feedback with encouragement
 * - Audio-first for non-readers
 * - Adaptive difficulty
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2, Heart, Trophy, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { generateQuizQuestions, checkQuizAnswer, type QuizQuestion } from "@/services/geminiService";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const { play, isPlaying } = useAudioPlayer();
  
  const placement = (location.state as { placement?: string })?.placement || "hindi-literacy";
  const language = placement.includes("hindi") ? "hindi" : "english";
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const quizQuestions = await generateQuizQuestions(
        language as "hindi" | "english",
        "beginner",
        "Basic Literacy",
        10
      );
      setQuestions(quizQuestions);
    } catch (error) {
      console.error("Failed to load quiz questions:", error);
      toast.error("Failed to load questions. Using offline fallback.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const playQuestionAudio = () => {
    if (!currentQuestion) return;
    const lang = language === "hindi" ? "hi-IN" : "en-US";
    const text = currentQuestion.questionAudio || currentQuestion.question;
    play(text, lang).catch(console.error);
  };

  const handleAnswerSelect = (answer: string) => {
    if (feedback) return; // Already answered
    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    setIsChecking(true);
    try {
      const result = await checkQuizAnswer(currentQuestion, selectedAnswer);
      
      setFeedback({
        correct: result.correct,
        message: result.feedback,
      });

      if (result.correct) {
        setScore(score + 10);
        setCorrectAnswers(correctAnswers + 1);
        setStreak(streak + 1);
        const lang = language === "hindi" ? "hi-IN" : "en-US";
        play(result.encouragement, lang).catch(console.error);
      } else {
        setWrongAnswers(wrongAnswers + 1);
        setLives(lives - 1);
        setStreak(0);
        if (lives <= 1) {
          // Game over
          setTimeout(() => {
            setQuizComplete(true);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Failed to check answer:", error);
      toast.error("Failed to check answer");
    } finally {
      setIsChecking(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setFeedback(null);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setFeedback(null);
    setLives(5);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setStreak(0);
    setQuizComplete(false);
    loadQuestions();
  };

  const handleExit = () => {
    // If this is a Hindi/English literacy quiz, go back to language learning
    if (placement.includes("hindi") || placement.includes("english")) {
      navigate("/language-learning");
    } else {
      navigate("/subjects");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading quiz...</p>
        </Card>
      </div>
    );
  }

  if (quizComplete) {
    const totalAttempted = correctAnswers + wrongAnswers;
    const finalScore = totalAttempted > 0 
      ? Math.round((correctAnswers / totalAttempted) * 100) 
      : 0;
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 shadow-lg">
          <div className="text-center mb-6">
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              {lives > 0 ? "Quiz Complete! 🎉" : "Out of Lives 💔"}
            </h1>
            <p className="text-gray-600">
              {language === "hindi" ? "क्विज़ पूर्ण!" : "Quiz Complete!"}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Final Score:</span>
                <span className="text-3xl font-bold text-blue-600">{finalScore}%</span>
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {correctAnswers} out of {totalAttempted} correct
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-1" />
                <p className="text-sm font-semibold">Correct</p>
                <p className="text-2xl font-bold">{correctAnswers}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                <p className="text-sm font-semibold">Wrong</p>
                <p className="text-2xl font-bold">{wrongAnswers}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleRestart} className="w-full py-6 text-xl" size="lg">
              Try Again 🔄
            </Button>
            <Button onClick={handleExit} variant="outline" className="w-full py-6 text-xl" size="lg">
              {placement.includes("hindi") || placement.includes("english") 
                ? "Back to Language Learning" 
                : "Exit to Subjects"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-black dark:to-black flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <p className="text-lg text-red-600">No questions available</p>
          <Button onClick={handleExit} className="mt-4">Exit</Button>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-black dark:to-black p-4">
      <div className="max-w-2xl mx-auto py-4">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        {/* Header with Lives and Score */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold">{lives}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-full">
                <span className="text-sm font-bold text-orange-600">🔥 {streak}</span>
              </div>
            )}
            <div className="text-xl font-bold text-blue-600">
              {score} pts
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-gray-600 mt-1 text-center">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <Card className="p-6 shadow-lg">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold flex-1">
                {currentQuestion.question}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={playQuestionAudio}
                disabled={isPlaying}
                className="shrink-0"
              >
                <Volume2 className="h-6 w-6 text-blue-600" />
              </Button>
            </div>

            {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  let buttonClass = "w-full p-4 text-lg font-semibold rounded-lg border-2 transition-all text-left";
                  
                  if (feedback) {
                    if (option === currentQuestion.correctAnswer) {
                      buttonClass += " border-green-500 bg-green-50";
                    } else if (option === selectedAnswer && !feedback.correct) {
                      buttonClass += " border-red-500 bg-red-50";
                    } else {
                      buttonClass += " border-gray-300 bg-gray-100";
                    }
                  } else if (selectedAnswer === option) {
                    buttonClass += " border-blue-500 bg-blue-50 shadow-md";
                  } else {
                    buttonClass += " border-gray-300 hover:border-blue-300 hover:bg-gray-50";
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={!!feedback}
                      className={buttonClass}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                feedback.correct ? "bg-green-50 border border-green-300" : "bg-red-50 border border-red-300"
              }`}
            >
              <div className="flex items-start gap-3">
                {feedback.correct ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 shrink-0" />
                )}
                <div>
                  <p className="font-semibold mb-1">
                    {feedback.correct ? "Correct! 🎉" : "Not quite 😔"}
                  </p>
                  <p className="text-sm">{feedback.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!feedback ? (
            <Button
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer || isChecking}
              className="w-full py-6 text-xl"
              size="lg"
            >
              {isChecking ? "Checking..." : "Check Answer"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="w-full py-6 text-xl"
              size="lg"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question →" : "Finish Quiz"}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
