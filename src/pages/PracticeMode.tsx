import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, X, Trophy, Star, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useLanguage } from "@/contexts/LanguageContext";

// Import Class 1 questions
import class1Data from "@/math-tutor/data/class1.json";

interface Question {
  q: string;
  a: string;
}

interface PracticeQuestion extends Question {
  chapterName: string;
  chapterIndex: number;
}

const PracticeMode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  // Get chapter from navigation state
  const targetChapter = (location.state as { chapter?: string })?.chapter;

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Load questions from selected chapter
  useEffect(() => {
    const loadQuestions = () => {
      let allQuestions: PracticeQuestion[] = [];

      class1Data.forEach((chapterData, index) => {
        if (chapterData.questions && chapterData.questions.length > 0) {
          // If specific chapter selected, filter by it
          if (!targetChapter || chapterData.chapter.includes(targetChapter)) {
            const chapterQuestions = chapterData.questions.map(q => ({
              q: q.q,
              a: q.a,
              chapterName: chapterData.chapter,
              chapterIndex: index
            }));
            allQuestions = [...allQuestions, ...chapterQuestions];
          }
        }
      });

      // Shuffle and take 10 questions
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 10));
    };

    loadQuestions();
  }, [targetChapter]);

  const currentQuestion = questions[currentIndex];

  // Check if answer is correct (flexible matching)
  const checkAnswer = (userAns: string, correctAns: string): boolean => {
    const normalize = (str: string) => 
      str.toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' '); // Normalize spaces

    const normalizedUser = normalize(userAns);
    const normalizedCorrect = normalize(correctAns);

    // Exact match
    if (normalizedUser === normalizedCorrect) return true;

    // Check if answer contains the correct answer
    if (normalizedUser.includes(normalizedCorrect) || 
        normalizedCorrect.includes(normalizedUser)) return true;

    // Check for numeric answers
    const userNum = parseFloat(userAns);
    const correctNum = parseFloat(correctAns);
    if (!isNaN(userNum) && !isNaN(correctNum) && userNum === correctNum) return true;

    return false;
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      toast.error(language === "hi" ? "कृपया उत्तर दें" : "Please provide an answer");
      return;
    }

    const correct = checkAnswer(userAnswer, currentQuestion.a);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(score + 1);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      toast.success(getEncouragingMessage());
    } else {
      toast.info(language === "hi" ? "अच्छी कोशिश!" : "Good try!");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setShowResult(false);
      setIsCorrect(false);
    } else {
      setCompleted(true);
      // Big celebration for completion
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 }
      });
    }
  };

  const getEncouragingMessage = (): string => {
    const messages = language === "hi" ? [
      "बहुत बढ़िया! 🌟",
      "शाबाश! 🎉",
      "सही उत्तर! ⭐",
      "तुम बहुत स्मार्ट हो! 🎯",
      "बहुत अच्छे! 💫",
      "कमाल का! 🏆"
    ] : [
      "Excellent! 🌟",
      "Well done! 🎉",
      "Correct! ⭐",
      "You're so smart! 🎯",
      "Amazing! 💫",
      "Superb! 🏆"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getScoreEmoji = (percentage: number): string => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 70) return "⭐";
    if (percentage >= 50) return "👍";
    return "💪";
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-spin">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            {language === "hi" ? "सवाल लोड हो रहे हैं..." : "Loading questions..."}
          </p>
        </div>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 text-center space-y-6">
          <div className="text-6xl">{getScoreEmoji(percentage)}</div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              {language === "hi" ? "बहुत बढ़िया!" : "Great Job!"}
            </h1>
            <p className="text-muted-foreground">
              {language === "hi" ? "तुमने पूरा कर लिया!" : "You completed all questions!"}
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6">
            <div className="text-5xl font-bold text-primary mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-xl text-muted-foreground">
              {percentage}% {language === "hi" ? "सही" : "Correct"}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setCompleted(false);
                setUserAnswer("");
                setShowResult(false);
                // Shuffle questions
                setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
              }}
              className="flex-1"
            >
              {language === "hi" ? "फिर से खेलें" : "Play Again"}
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1"
            >
              {language === "hi" ? "वापस जाएं" : "Go Back"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Header */}
      <div className="bg-card shadow-lg border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">
            {language === "hi" ? "अभ्यास मोड" : "Practice Mode"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "प्रश्न" : "Question"} {currentIndex + 1}/{questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Trophy className="w-4 h-4" />
          {score}/{questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6">
        <Card className="p-6 space-y-6 shadow-lg">
          {/* Chapter Badge */}
          <div className="flex items-center justify-between">
            <div className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">
              {currentQuestion.chapterName.split('(')[0].trim()}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: questions.length }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < currentIndex
                      ? "bg-green-500"
                      : i === currentIndex
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="space-y-4">
            <div className="text-lg font-medium text-foreground">
              {currentQuestion.q}
            </div>

            {/* Answer Input */}
            {!showResult ? (
              <div className="space-y-3">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={language === "hi" ? "अपना उत्तर यहाँ लिखें..." : "Write your answer here..."}
                  className="w-full p-4 border-2 border-border rounded-xl focus:border-primary focus:outline-none min-h-[100px] text-lg"
                  disabled={showResult}
                />
                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 text-lg"
                  disabled={!userAnswer.trim()}
                >
                  {language === "hi" ? "जवाब जमा करें" : "Submit Answer"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Result */}
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isCorrect
                      ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                      : "bg-orange-50 dark:bg-orange-900/20 border-orange-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <X className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold mb-2">
                        {isCorrect
                          ? (language === "hi" ? "सही उत्तर! 🎉" : "Correct Answer! 🎉")
                          : (language === "hi" ? "अच्छी कोशिश! 💪" : "Good Try! 💪")}
                      </div>
                      {!isCorrect && (
                        <div className="text-sm">
                          <div className="opacity-75 mb-1">
                            {language === "hi" ? "सही उत्तर:" : "Correct answer:"}
                          </div>
                          <div className="font-medium">{currentQuestion.a}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <Button
                  onClick={handleNext}
                  className="w-full h-12 text-lg"
                >
                  {currentIndex < questions.length - 1
                    ? (language === "hi" ? "अगला प्रश्न" : "Next Question")
                    : (language === "hi" ? "परिणाम देखें" : "See Results")}
                  <Star className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Encouraging Message */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {language === "hi" ? "तुम बहुत अच्छा कर रहे हो! 🌟" : "You're doing great! 🌟"}
        </div>
      </div>
    </div>
  );
};

export default PracticeMode;
