import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FlaskConical, Play, Clock, BookOpen } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { scienceChapters, getLocalizedText } from "@/data/lessonContent";

const ScienceChapters = () => {
    const navigate = useNavigate();
    const { language, t } = useLanguage();

    const handleLessonClick = (chapterId: string, lessonId: string) => {
        navigate("/learn", {
            state: {
                subject: "science",
                chapterId,
                lessonId,
            }
        });
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "easy": return "bg-green-100 text-green-700";
            case "medium": return "bg-yellow-100 text-yellow-700";
            case "hard": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const selectedClass = localStorage.getItem("selectedClass");

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
            <div className="px-6 pt-8 pb-6 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center shadow-lg overflow-hidden border-2 border-blue-500/20">
                    <FlaskConical className="w-10 h-10 text-blue-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        {t("Science Lessons")}
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {t(selectedClass === "1" ? "Class 1 • NCERT | Learn with Cards" : selectedClass === "6" ? "Class 6 • NCERT | Learn with Cards" : "Class 5 • NCERT | Learn with Cards")}
                    </p>
                </div>
            </div>

            {/* Chapters and Lessons */}
            <div className="px-6 pb-8 space-y-8">
                {scienceChapters.map((chapter) => (
                    <div key={chapter.id} className="space-y-4">
                        {/* Chapter Header */}
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {language === "hi" ? chapter.titleHindi : chapter.title}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {chapter.lessons.length} {chapter.lessons.length === 1 ? t("Lesson") : t("Lessons")}
                                </p>
                            </div>
                        </div>

                        {/* Lesson Cards */}
                        <div className="grid gap-4">
                            {chapter.lessons.map((lesson, index) => (
                                <Card
                                    key={lesson.id}
                                    className="p-5 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
                                    onClick={() => handleLessonClick(chapter.id, lesson.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Lesson Number Badge */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-lg font-bold text-blue-600">
                                                    {index + 1}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Lesson Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold mb-1">
                                                {language === "hi" ? lesson.titleHindi : lesson.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {getLocalizedText(lesson.description, lesson.descriptionHindi, lesson.descriptionKannada, language)}
                                            </p>

                                            {/* Lesson Metadata */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge className={getDifficultyColor(lesson.difficulty)}>
                                                    {t(lesson.difficulty)}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{lesson.duration}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <BookOpen className="w-3 h-3" />
                                                    <span>{lesson.cards.length} {t("cards")}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Play Button */}
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors">
                                                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                            </div>
                                        </div>
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

export default ScienceChapters;
