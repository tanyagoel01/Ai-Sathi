/**
 * HINDI ALPHABET COURSE
 * Progressive learning from letters to reading
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Lock, CheckCircle2, Play, Star } from 'lucide-react';
import { hindiAlphabetLessons, type AlphabetLesson } from '@/data/languageLearning/hindiAlphabet';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HindiAlphabetCourse() {
    const navigate = useNavigate();
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [demoMode, setDemoMode] = useState(false);

    useEffect(() => {
        // Load progress from localStorage
        const saved = localStorage.getItem('alphabetCompletedLessons');
        if (saved) {
            setCompletedLessons(JSON.parse(saved));
        }

        // Check demo mode
        const demo = localStorage.getItem('demoMode') === 'true';
        setDemoMode(demo);
    }, []);

    const isLessonUnlocked = (lesson: AlphabetLesson): boolean => {
        if (demoMode) return true;
        if (lesson.level === 1) return true;

        // Check if previous lesson is completed
        const previousLesson = hindiAlphabetLessons.find(l => l.level === lesson.level - 1);
        if (previousLesson) {
            return completedLessons.includes(previousLesson.id);
        }
        return false;
    };

    const isLessonCompleted = (lessonId: string): boolean => {
        return completedLessons.includes(lessonId);
    };

    const getProgressPercentage = (): number => {
        return Math.round((completedLessons.length / hindiAlphabetLessons.length) * 100);
    };

    const handleLessonClick = (lesson: AlphabetLesson) => {
        if (isLessonUnlocked(lesson)) {
            navigate(`/language-learning/alphabet-lesson/${lesson.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-black dark:to-black pb-12">
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

            {/* Hero Section */}
            <div className="px-6 pt-8 pb-6 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <span className="text-4xl">🔤</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">Hindi Alphabet</h1>
                <p className="text-muted-foreground">हिंदी वर्णमाला</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Learn to read Hindi step by step! From basic letters to complete stories.
                </p>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                            Your Progress
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {completedLessons.length}/{hindiAlphabetLessons.length} lessons
                        </span>
                    </div>
                    <Progress value={getProgressPercentage()} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                        {getProgressPercentage()}% Complete
                    </p>
                </div>
            </div>

            {/* Learning Path */}
            <div className="px-6 space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Learning Path
                </h2>

                {/* Lessons Grid */}
                <div className="space-y-3">
                    {hindiAlphabetLessons.map((lesson) => {
                        const unlocked = isLessonUnlocked(lesson);
                        const completed = isLessonCompleted(lesson.id);

                        return (
                            <Card
                                key={lesson.id}
                                className={`p-4 transition-all ${unlocked
                                    ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]'
                                    : 'opacity-60'
                                    }`}
                                onClick={() => handleLessonClick(lesson)}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${completed
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                            : unlocked
                                                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                                : 'bg-gray-300'
                                            }`}
                                    >
                                        {completed ? (
                                            <CheckCircle2 className="w-7 h-7 text-white" />
                                        ) : unlocked ? (
                                            <span className="text-2xl">{lesson.icon}</span>
                                        ) : (
                                            <Lock className="w-6 h-6 text-gray-600" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                                                        Level {lesson.level}
                                                    </span>
                                                    {completed && (
                                                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                            ✓ Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-foreground mb-1">
                                                    {lesson.title}
                                                </h3>
                                                <p className="text-sm text-purple-600 mb-2">
                                                    {lesson.titleHindi}
                                                </p>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {lesson.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Play className="w-3 h-3" />
                                                        {lesson.estimatedMinutes} min
                                                    </span>
                                                    <span>•</span>
                                                    <span>{lesson.exercises.length} exercises</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Encouragement Message */}
                {completedLessons.length === 0 && (
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                        <div className="text-center space-y-2">
                            <div className="text-4xl mb-2">🎯</div>
                            <h3 className="text-lg font-bold text-foreground">
                                Start Your Journey!
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Begin with Level 1 to learn your first Hindi letters. Each lesson builds on the previous one!
                            </p>
                        </div>
                    </Card>
                )}

                {completedLessons.length > 0 && completedLessons.length < hindiAlphabetLessons.length && (
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <div className="text-center space-y-2">
                            <div className="text-4xl mb-2">🌟</div>
                            <h3 className="text-lg font-bold text-foreground">
                                Great Progress!
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                You've completed {completedLessons.length} lessons. Keep going to unlock more!
                            </p>
                        </div>
                    </Card>
                )}

                {completedLessons.length === hindiAlphabetLessons.length && (
                    <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                        <div className="text-center space-y-2">
                            <div className="text-4xl mb-2">🏆</div>
                            <h3 className="text-lg font-bold text-foreground">
                                Congratulations!
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                You've completed the entire Hindi Alphabet course! You can now read Hindi! 🎉
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
