import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calculator, PlayCircle, Lock, MessageCircle, Trophy } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { mathsChapters, getLocalizedText } from "@/data/lessonContent";

const MathsChapters = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    const handleLessonClick = (chapterId: string, lessonId: string) => {
        navigate("/learn", {
            state: {
                subject: "maths",
                chapterId,
                lessonId,
            }
        });
    };

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
                    {t("Back")}
                </Button>
                <LanguageSelector />
            </div>

            {/* Header Section */}
            <div className="px-6 pt-8 pb-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center shadow-[var(--shadow-medium)] overflow-hidden border-2 border-orange-500/20">
                    <Calculator className="w-10 h-10 text-orange-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        {t("Maths Chapters")}
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {t("Class 5 • NCERT")}
                    </p>
                </div>
            </div>

            {/* AI Learning Modes */}
            <div className="px-6 pb-4">
                <h2 className="text-xl font-bold mb-3">
                    {t("AI Learning Modes")}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <Card
                        className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                        onClick={() => navigate("/math-chat")}
                    >
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 mx-auto rounded-full bg-blue-500 flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold">
                                {t("Ask AI Tutor")}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {t("Get instant help")}
                            </p>
                        </div>
                    </Card>

                    <Card
                        className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
                        onClick={() => navigate("/practice-mode")}
                    >
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold">
                                {t("Practice Mode")}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {t("Test your skills")}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Chapters & Lessons */}
            <div className="px-6 pb-8 space-y-6">
                {mathsChapters.map((chapter) => (
                    <div key={chapter.id}>
                        <h2 className="text-xl font-bold mb-3">
                            {language === "hi" ? chapter.titleHindi : chapter.title}
                        </h2>

                        <div className="space-y-3">
                            {chapter.lessons.map((lesson, index) => (
                                <Card
                                    key={lesson.id}
                                    className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2"
                                    onClick={() => handleLessonClick(chapter.id, lesson.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Lesson Number */}
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                            {index + 1}
                                        </div>

                                        {/* Lesson Info */}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">
                                                {language === "hi" ? lesson.titleHindi : lesson.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {getLocalizedText(lesson.description, lesson.descriptionHindi, lesson.descriptionKannada, language)}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                    {t(lesson.difficulty)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ⏱️ {lesson.duration}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    📝 {lesson.cards.length} {t("cards")}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Play Button */}
                                        <PlayCircle className="w-8 h-8 text-blue-500" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MathsChapters;
