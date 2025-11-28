/**
 * PROGRESS DASHBOARD
 * Parent/Teacher view of learning progress
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Download, TrendingUp, BookOpen, Award, Target } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface ProgressData {
    hindiLessonsCompleted: number;
    englishLessonsCompleted: number;
    storiesRead: number;
    wordsLearned: number;
    pronunciationAccuracy: number;
    totalTimeSpent: number;
    lastActive: string;
}

export default function ProgressDashboard() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState<ProgressData>({
        hindiLessonsCompleted: 0,
        englishLessonsCompleted: 0,
        storiesRead: 0,
        wordsLearned: 0,
        pronunciationAccuracy: 0,
        totalTimeSpent: 0,
        lastActive: new Date().toLocaleDateString(),
    });

    useEffect(() => {
        // Load progress from localStorage
        const demoMode = localStorage.getItem('demoMode') === 'true';

        if (demoMode) {
            const demoProgress = JSON.parse(localStorage.getItem('demoProgress') || '{}');
            setProgress({
                hindiLessonsCompleted: demoProgress.hindiLessonsCompleted || 2,
                englishLessonsCompleted: demoProgress.englishLessonsCompleted || 1,
                storiesRead: demoProgress.storiesRead || 3,
                wordsLearned: demoProgress.wordsLearned || 45,
                pronunciationAccuracy: demoProgress.pronunciationAccuracy || 85,
                totalTimeSpent: 120,
                lastActive: new Date().toLocaleDateString(),
            });
        } else {
            const hindiCompleted = JSON.parse(localStorage.getItem('hindiCompletedLessons') || '[]');
            const englishCompleted = JSON.parse(localStorage.getItem('englishCompletedLessons') || '[]');
            const storiesRead = JSON.parse(localStorage.getItem('readStories') || '[]');

            setProgress({
                hindiLessonsCompleted: hindiCompleted.length,
                englishLessonsCompleted: englishCompleted.length,
                storiesRead: storiesRead.length,
                wordsLearned: (hindiCompleted.length * 5) + (englishCompleted.length * 3),
                pronunciationAccuracy: 0,
                totalTimeSpent: 0,
                lastActive: new Date().toLocaleDateString(),
            });
        }
    }, []);

    const exportReport = () => {
        const report = `
AI SATHI - LEARNING PROGRESS REPORT
===================================

Student Progress Summary
------------------------
Hindi Lessons Completed: ${progress.hindiLessonsCompleted}
English Lessons Completed: ${progress.englishLessonsCompleted}
Stories Read: ${progress.storiesRead}
Words Learned: ${progress.wordsLearned}
Pronunciation Accuracy: ${progress.pronunciationAccuracy}%
Total Time Spent: ${progress.totalTimeSpent} minutes
Last Active: ${progress.lastActive}

Recommendations
---------------
${progress.hindiLessonsCompleted < 2 ? '• Continue practicing Hindi basics\n' : ''}
${progress.englishLessonsCompleted < 2 ? '• Focus on English alphabet\n' : ''}
${progress.storiesRead < 3 ? '• Read more stories to improve comprehension\n' : ''}
${progress.pronunciationAccuracy < 70 ? '• Practice pronunciation with audio exercises\n' : ''}

Generated on: ${new Date().toLocaleString()}
    `.trim();

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-sathi-progress-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const stats = [
        {
            icon: BookOpen,
            label: 'Hindi Lessons',
            value: progress.hindiLessonsCompleted,
            total: 4,
            color: 'from-orange-500 to-red-500',
        },
        {
            icon: BookOpen,
            label: 'English Lessons',
            value: progress.englishLessonsCompleted,
            total: 3,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: BookOpen,
            label: 'Stories Read',
            value: progress.storiesRead,
            total: 6,
            color: 'from-yellow-500 to-orange-500',
        },
        {
            icon: Target,
            label: 'Words Learned',
            value: progress.wordsLearned,
            total: 100,
            color: 'from-green-500 to-emerald-500',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-black dark:to-black pb-12">
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
                <Button
                    size="sm"
                    variant="outline"
                    onClick={exportReport}
                    className="rounded-full"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </div>

            {/* Hero */}
            <div className="px-6 pt-8 pb-6 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Progress Dashboard</h1>
                <p className="text-muted-foreground">प्रगति डैशबोर्ड</p>
                <p className="text-sm text-muted-foreground">
                    Last active: {progress.lastActive}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="px-6 space-y-4 mb-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground">{stat.label}</h3>
                                <p className="text-2xl font-bold text-foreground">
                                    {stat.value} <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                                </p>
                            </div>
                        </div>
                        <Progress value={(stat.value / stat.total) * 100} className="h-2" />
                    </Card>
                ))}
            </div>

            {/* Pronunciation Accuracy */}
            {progress.pronunciationAccuracy > 0 && (
                <div className="px-6 mb-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground">Pronunciation Accuracy</h3>
                                <p className="text-2xl font-bold text-foreground">{progress.pronunciationAccuracy}%</p>
                            </div>
                        </div>
                        <Progress value={progress.pronunciationAccuracy} className="h-2" />
                    </Card>
                </div>
            )}

            {/* Recommendations */}
            <div className="px-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span>💡</span> Recommendations
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        {progress.hindiLessonsCompleted < 2 && (
                            <li>• Continue practicing Hindi basics to build a strong foundation</li>
                        )}
                        {progress.englishLessonsCompleted < 2 && (
                            <li>• Focus on English alphabet to improve reading skills</li>
                        )}
                        {progress.storiesRead < 3 && (
                            <li>• Read more stories to improve comprehension and vocabulary</li>
                        )}
                        {progress.wordsLearned < 50 && (
                            <li>• Practice more vocabulary to reach 50 words milestone</li>
                        )}
                        {progress.hindiLessonsCompleted >= 2 && progress.englishLessonsCompleted >= 2 && (
                            <li className="text-green-600 font-semibold">✓ Great progress! Keep up the excellent work!</li>
                        )}
                    </ul>
                </Card>
            </div>
        </div>
    );
}
