/**
 * LANGUAGE LEARNING HUB
 * Main entry point for the Adaptive Literacy System
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Library, MessageSquare, Users, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LanguageLearningHub() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [demoMode, setDemoMode] = useState(false);

    useEffect(() => {
        const demo = localStorage.getItem('demoMode') === 'true';
        setDemoMode(demo);
    }, []);

    const modules = [
        {
            id: 'hindi-alphabet',
            titleKey: 'Hindi Alphabet',
            descriptionKey: 'Learn to read Hindi step by step',
            icon: BookOpen,
            color: 'from-purple-500 to-pink-500',
            route: '/language-learning/alphabet-course',
            available: true,
        },
        {
            id: 'hindi-course',
            titleKey: 'Hindi Course',
            descriptionKey: 'Learn Hindi from basics',
            icon: BookOpen,
            color: 'from-orange-500 to-red-500',
            route: '/language-learning/hindi-course',
            available: true,
        },
        {
            id: 'english-course',
            titleKey: 'English Course',
            descriptionKey: 'Learn English A-Z',
            icon: BookOpen,
            color: 'from-blue-500 to-cyan-500',
            route: '/language-learning/english-course',
            available: true,
        },
        {
            id: 'picture-dictionary',
            titleKey: 'Picture Dictionary',
            descriptionKey: 'Visual word learning',
            icon: Library,
            color: 'from-green-500 to-emerald-500',
            route: '/language-learning/picture-dictionary',
            available: true,
        },
        {
            id: 'story-mode',
            titleKey: 'Story Mode',
            descriptionKey: 'Read interactive stories',
            icon: MessageSquare,
            color: 'from-yellow-500 to-orange-500',
            route: '/language-learning/stories',
            available: true,
        },
        {
            id: 'multi-student',
            titleKey: 'Student Profiles',
            descriptionKey: 'Manage multiple students',
            icon: Users,
            color: 'from-indigo-500 to-purple-500',
            route: '/language-learning/profiles',
            available: true,
        },
        {
            id: 'dashboard',
            titleKey: 'Progress Dashboard',
            descriptionKey: 'View learning progress',
            icon: BarChart3,
            color: 'from-pink-500 to-rose-500',
            route: '/language-learning/dashboard',
            available: true,
        },
    ];

    const enableDemoMode = () => {
        localStorage.setItem('demoMode', 'true');
        setDemoMode(true);
        // Unlock all lessons
        localStorage.setItem('allLessonsUnlocked', 'true');
        // Pre-fill progress
        localStorage.setItem('demoProgress', JSON.stringify({
            hindiLessonsCompleted: 2,
            englishLessonsCompleted: 1,
            storiesRead: 3,
            wordsLearned: 45,
            pronunciationAccuracy: 85,
        }));
        alert('🎉 Demo Mode Activated! All lessons unlocked.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
            {/* Header */}
            <div className="px-4 pt-4 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="rounded-full hover:bg-muted"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {!demoMode && (
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={enableDemoMode}
                        className="text-xs"
                    >
                        🎬 Demo Mode
                    </Button>
                    )}
                </div>
            </div>

            {/* Hero Section */}
            <div className="px-6 pt-8 pb-8 text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-12 h-12 text-primary" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground">
                        {t('Language Learning')}
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {t('Learn Hindi, English & Kannada with interactive lessons, stories, and games!')}
                    </p>
                </div>

                {demoMode && (
                    <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        🎬 Demo Mode Activated
                    </div>
                )}
            </div>

            {/* Modules Grid */}
            <div className="px-6 pb-12 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">{t('Choose a Module')}</h2>
                <div className="grid gap-4">
                    {modules.map((module) => (
                        <Card
                            key={module.id}
                            className={`p-6 cursor-pointer transition-all hover:shadow-lg ${!module.available ? 'opacity-50' : ''
                                }`}
                            onClick={() => {
                                if (module.available) {
                                    navigate(module.route);
                                }
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center flex-shrink-0`}>
                                    <module.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-foreground mb-1">
                                        {t(module.titleKey)}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t(module.descriptionKey)}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Start Info */}
            <div className="px-6 pb-12">
                <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                    <h3 className="font-semibold text-foreground mb-2">
                        {t('New to Language Learning?')}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('Start with the Hindi Alphabet to learn to read Hindi step by step!')}
                    </p>
                    <Button
                        onClick={() => navigate('/language-learning/alphabet-course')}
                        className="w-full rounded-2xl h-12 bg-gradient-to-r from-primary to-secondary"
                    >
                        {t('Start Learning →')}
                    </Button>
                </Card>
            </div>
        </div>
    );
}
