/**
 * HINDI COURSE - Duolingo-style lessons
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Lock, CheckCircle2, Play } from 'lucide-react';
import { hindiLessons, type Lesson } from '@/data/languageLearning/hindiCourse';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HindiCourse() {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState<Lesson[]>(hindiLessons);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);

    useEffect(() => {
        // Load progress from localStorage
        const completed = JSON.parse(localStorage.getItem('hindiCompletedLessons') || '[]');
        setCompletedLessons(completed);

        // Check demo mode
        const demoMode = localStorage.getItem('demoMode') === 'true';
        if (demoMode) {
            // Unlock all lessons in demo mode
            setLessons(lessons.map(l => ({ ...l, unlocked: true })));
        } else {
            // Unlock next lesson if previous is completed
            const updatedLessons = lessons.map((lesson, index) => {
                if (index === 0) return { ...lesson, unlocked: true };
                const previousCompleted = completed.includes(lessons[index - 1].id);
                return { ...lesson, unlocked: previousCompleted };
            });
            setLessons(updatedLessons);
        }
    }, []);

    const handleLessonClick = (lesson: Lesson) => {
        if (!lesson.unlocked) return;
        navigate(`/language-learning/hindi-lesson/${lesson.id}`, { state: { lesson } });
    };

    const getProgress = () => {
        return (completedLessons.length / lessons.length) * 100;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-black dark:to-black">
            {/* Header */}
            <div className="px-4 pt-4 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="rounded-full"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <ThemeToggle />
            </div>

            {/* Hero */}
            <div className="px-6 pt-8 pb-6 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                    <span className="text-4xl">🇮🇳</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">Hindi Course</h1>
                <p className="text-muted-foreground">हिंदी कोर्स</p>

                {/* Progress */}
                <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold">Progress</span>
                        <span>{completedLessons.length} / {lessons.length} lessons</span>
                    </div>
                    <Progress value={getProgress()} className="h-3" />
                </div>
            </div>

            {/* Lessons List */}
            <div className="px-6 pb-12 space-y-4">
                {lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isLocked = !lesson.unlocked;

                    return (
                        <Card
                            key={lesson.id}
                            className={`p-6 transition-all ${isLocked
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer hover:shadow-lg'
                                }`}
                            onClick={() => handleLessonClick(lesson)}
                        >
                            <div className="flex items-center gap-4">
                                {/* Level Badge */}
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${isCompleted
                                    ? 'bg-green-100'
                                    : isLocked
                                        ? 'bg-gray-100'
                                        : 'bg-gradient-to-br from-orange-500 to-red-500'
                                    }`}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                                    ) : isLocked ? (
                                        <Lock className="w-8 h-8 text-gray-400" />
                                    ) : (
                                        <Play className="w-8 h-8 text-white" />
                                    )}
                                </div>

                                {/* Lesson Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            Level {lesson.level}
                                        </span>
                                        {isCompleted && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                ✓ Completed
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-1">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {lesson.titleHindi}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {lesson.vocabEntries.length} words • {lesson.exercises.length} exercises
                                    </p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Encouragement */}
            {completedLessons.length === lessons.length && (
                <div className="px-6 pb-12">
                    <Card className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                        <p className="text-muted-foreground">
                            You've completed all Hindi lessons! बधाई हो!
                        </p>
                    </Card>
                </div>
            )}
        </div>
    );
}
