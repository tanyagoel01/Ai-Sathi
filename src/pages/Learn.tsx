/**
 * LEARN PAGE - Duolingo-Style Card Learning
 * 
 * Interactive card-based learning with swipe navigation
 * Shows lesson content one card at a time with progress tracking
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Volume2, CheckCircle2, XCircle, Trophy, HelpCircle, Loader2, MessageCircle } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLessonById, getLocalizedText, type Lesson, type LessonCard } from "@/data/lessonContent";
import { answerQuestionSimple } from "@/services/searchService";
import { toast } from "sonner";
import EmojiImage from "@/components/EmojiImage";

// Component to render visual content with emoji images
const VisualContent = ({ visual }: { visual: string }) => {
  // Regex to match emojis
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  const matches = [...visual.matchAll(emojiRegex)];
  
  matches.forEach((match) => {
    // Add text before emoji
    if (match.index !== undefined && match.index > lastIndex) {
      parts.push(visual.substring(lastIndex, match.index));
    }
    
    // Add emoji as image
    parts.push(
      <EmojiImage 
        key={`emoji-${key++}`}
        emoji={match[0]} 
        size={48}
        className="mx-1"
      />
    );
    
    lastIndex = (match.index || 0) + match[0].length;
  });
  
  // Add remaining text
  if (lastIndex < visual.length) {
    parts.push(visual.substring(lastIndex));
  }
  
  return (
    <div className="text-2xl font-bold flex flex-wrap items-center justify-center gap-1">
      {parts.length > 0 ? parts : visual}
    </div>
  );
};

export default function Learn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { play, isPlaying } = useAudioPlayer();
  const { language, t } = useLanguage();
  
  // Get subject, chapter, lesson from state or params
  const locationState = location.state as { 
    subject?: "maths" | "science"; 
    chapterId?: string; 
    lessonId?: string;
  } | null;
  const subject = locationState?.subject || "maths";
  const chapterId = locationState?.chapterId || "numbers";
  const lessonId = locationState?.lessonId || "addition-basics";
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  
  // Question asking feature
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [studentQuestion, setStudentQuestion] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    const loadedLesson = getLessonById(subject, chapterId, lessonId);
    if (loadedLesson) {
      setLesson(loadedLesson);
    } else {
      toast.error("Lesson not found");
      navigate(-1);
    }
  }, [subject, chapterId, lessonId, navigate]);

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("Loading lesson...")}</p>
      </div>
    );
  }

  const currentCard = lesson.cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / lesson.cards.length) * 100;
  const isLastCard = currentCardIndex === lesson.cards.length - 1;

  const playCardAudio = () => {
    if (isPlaying) return;
    const lang = language === "hi" ? "hi-IN" : "en-US";
    const text = currentCard.title + ". " + currentCard.content;
    play(text, lang).catch(console.error);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || !currentCard.correctAnswer) return;
    
    const isCorrect = selectedAnswer === currentCard.correctAnswer;
    setShowFeedback(true);
    
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      setCompletedCards(new Set([...completedCards, currentCard.id]));
    }
  };

  const handleNext = () => {
    if (currentCard.type === "practice" && !showFeedback) {
      // Must check answer first
      toast.info(t("Please check your answer first!"));
      return;
    }

    if (isLastCard) {
      // Lesson complete!
      navigate("/lesson-complete", {
        state: {
          lesson,
          score: Math.round((correctAnswers / lesson.cards.filter(c => c.type === "practice").length) * 100),
          subject,
          chapterId,
        },
      });
    } else {
      setCurrentCardIndex(currentCardIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!studentQuestion.trim()) {
      toast.error(t("Please enter a question"));
      return;
    }

    setIsAnswering(true);
    try {
      const answer = await answerQuestionSimple(
        studentQuestion,
        language,
        subject
      );
      setQuestionAnswer(answer);
    } catch (error) {
      toast.error(t("Error getting answer"));
      setQuestionAnswer("");
    } finally {
      setIsAnswering(false);
    }
  };

  const handleCloseQuestionDialog = () => {
    setQuestionDialogOpen(false);
    setStudentQuestion("");
    setQuestionAnswer("");
  };

  const handleGoToChat = () => {
    // Navigate to chat with context about current card
    const cardTitle = getLocalizedText(currentCard.title, currentCard.titleHindi, currentCard.titleKannada, language);
    const cardContent = getLocalizedText(currentCard.content, currentCard.contentHindi, currentCard.contentKannada, language);
    
    navigate("/chat", {
      state: {
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        chapter: lesson.title,
        initialQuestion: `I want to learn more about: ${cardTitle}. ${cardContent.substring(0, 100)}...`
      }
    });
  };

  const getCardColor = (type: LessonCard["type"]) => {
    switch (type) {
      case "explanation":
        return "from-blue-50 to-blue-100 border-blue-200";
      case "example":
        return "from-green-50 to-green-100 border-green-200";
      case "tip":
        return "from-yellow-50 to-yellow-100 border-yellow-200";
      case "practice":
        return "from-purple-50 to-purple-100 border-purple-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  const getCardIcon = (type: LessonCard["type"]) => {
    switch (type) {
      case "explanation":
        return "📚";
      case "example":
        return "💡";
      case "tip":
        return "✨";
      case "practice":
        return "✏️";
      default:
        return "📖";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 mx-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">
                {language === "hi" ? lesson.titleHindi : lesson.title}
              </span>
              <span className="text-sm text-gray-600">
                {currentCardIndex + 1} / {lesson.cards.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={playCardAudio}
            disabled={isPlaying}
          >
            <Volume2 className="h-5 w-5 text-blue-600" />
          </Button>
        </div>
      </div>

      {/* Card Content */}
      <div className="max-w-2xl mx-auto p-6">
        <Card className={`p-8 shadow-lg border-2 bg-gradient-to-br ${getCardColor(currentCard.type)}`}>
          {/* Card Type Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">{getCardIcon(currentCard.type)}</span>
            <span className="text-xs font-semibold uppercase text-gray-600">
              {t(currentCard.type)}
            </span>
          </div>

          {/* Card Title */}
          <h2 className="text-2xl font-bold mb-4">
            {getLocalizedText(currentCard.title, currentCard.titleHindi, currentCard.titleKannada, language)}
          </h2>

          {/* Card Content */}
          <p className="text-lg mb-6 leading-relaxed">
            {getLocalizedText(currentCard.content, currentCard.contentHindi, currentCard.contentKannada, language)}
          </p>

          {/* Visual Aid */}
          {currentCard.visual && (
            <div className="p-6 bg-white/50 rounded-xl mb-6 text-center">
              <VisualContent visual={getLocalizedText(currentCard.visual, currentCard.visualHindi, currentCard.visualKannada, language)} />
            </div>
          )}

          {/* Practice Question */}
          {currentCard.type === "practice" && currentCard.options && (
            <div className="space-y-4 mb-6">
              <p className="font-semibold text-lg">
                {getLocalizedText(currentCard.question || "", currentCard.questionHindi, currentCard.questionKannada, language)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {currentCard.options.map((option, index) => {
                  // Get localized option text
                  const localizedOptions = language === "hi" && currentCard.optionsHindi 
                    ? currentCard.optionsHindi 
                    : language === "kn" && currentCard.optionsKannada
                    ? currentCard.optionsKannada
                    : currentCard.options;
                  
                  const displayOption = localizedOptions?.[index] || option;
                  const correctAnswerLocalized = language === "hi" && currentCard.correctAnswerHindi
                    ? currentCard.correctAnswerHindi
                    : language === "kn" && currentCard.correctAnswerKannada
                    ? currentCard.correctAnswerKannada
                    : currentCard.correctAnswer;
                  
                  let buttonClass = "p-4 text-lg font-semibold rounded-xl border-2 transition-all";
                  
                  if (showFeedback) {
                    if (option === currentCard.correctAnswer) {
                      buttonClass += " border-green-500 bg-green-50";
                    } else if (option === selectedAnswer) {
                      buttonClass += " border-red-500 bg-red-50";
                    } else {
                      buttonClass += " border-gray-300 bg-gray-50";
                    }
                  } else if (selectedAnswer === option) {
                    buttonClass += " border-blue-500 bg-blue-50 shadow-md";
                  } else {
                    buttonClass += " border-gray-300 hover:border-blue-300 hover:bg-white";
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showFeedback}
                      className={buttonClass}
                    >
                      {displayOption}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && currentCard.explanation && (
            <div
              className={`p-4 rounded-xl mb-6 ${
                selectedAnswer === currentCard.correctAnswer
                  ? "bg-green-50 border-2 border-green-300"
                  : "bg-red-50 border-2 border-red-300"
              }`}
            >
              <div className="flex items-start gap-3">
                {selectedAnswer === currentCard.correctAnswer ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
                )}
                <div>
                  <p className="font-semibold mb-1">
                    {selectedAnswer === currentCard.correctAnswer 
                      ? t("Correct! 🎉")
                      : t("Not quite 😔")}
                  </p>
                  <p className="text-sm">
                    {getLocalizedText(currentCard.explanation, currentCard.explanationHindi, currentCard.explanationKannada, language)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Button */}
          <Button
            onClick={handleGoToChat}
            variant="outline"
            className="w-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {t("Learn More About This 💬")}
          </Button>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("Previous")}
          </Button>

          {currentCard.type === "practice" && !showFeedback ? (
            <Button
              onClick={handleCheckAnswer}
              disabled={!selectedAnswer}
              className="flex-1"
            >
              {t("Check Answer")}
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {isLastCard ? (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  {t("Finish Lesson")}
                </>
              ) : (
                <>
                  {t("Next")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Ask Question Floating Button */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all"
            size="icon"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("Ask a Question 💭")}
            </DialogTitle>
            <DialogDescription>
              {t("Ask your question and get an answer from the AI teacher!")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!questionAnswer ? (
              <>
                <Textarea
                  placeholder={t("Type your question here...")}
                  value={studentQuestion}
                  onChange={(e) => setStudentQuestion(e.target.value)}
                  rows={4}
                  disabled={isAnswering}
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={isAnswering || !studentQuestion.trim()}
                  className="w-full"
                >
                  {isAnswering ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("Finding answer...")}
                    </>
                  ) : (
                    <>
                      {t("Get Answer")}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="font-semibold mb-2 text-blue-900">
                    {t("Your Question:")}
                  </p>
                  <p className="text-gray-700 italic">{studentQuestion}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="font-semibold mb-2 text-green-900">
                    {t("Answer:")}
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">{questionAnswer}</p>
                </div>

                <Button
                  onClick={handleCloseQuestionDialog}
                  variant="outline"
                  className="w-full"
                >
                  {t("Close")}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
