/**
 * HINDI LESSON VIEW
 * Interactive lesson with vocab viewer, matching game, etc.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { hindiLessons, hindiVocabulary, type Lesson, type VocabEntry } from '@/data/languageLearning/hindiCourse';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import confetti from 'canvas-confetti';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HindiLessonView() {
    const navigate = useNavigate();
    const location = useLocation();
    const { lessonId } = useParams();
    const { play, isPlaying } = useAudioPlayer();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [vocabIndex, setVocabIndex] = useState(0);
    const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        const lessonData = location.state?.lesson || hindiLessons.find(l => l.id === lessonId);
        if (lessonData) {
            setLesson(lessonData);
        }
    }, [lessonId, location.state]);

    if (!lesson) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const currentExercise = lesson.exercises[currentExerciseIndex];

    const playAudio = (audioPath: string) => {
        // In production, this would play the actual audio file
        // For now, use TTS as fallback
        const vocab = hindiVocabulary.find(v => v.audio === audioPath);
        if (vocab) {
            play(vocab.hindi, 'hi-IN').catch(console.error);
        }
    };

    const handleNextExercise = () => {
        if (currentExerciseIndex < lesson.exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
            setShowFeedback(false);
            setMatchingAnswers({});
            setVocabIndex(0);
        } else {
            // Lesson complete
            const completed = JSON.parse(localStorage.getItem('hindiCompletedLessons') || '[]');
            if (!completed.includes(lesson.id)) {
                completed.push(lesson.id);
                localStorage.setItem('hindiCompletedLessons', JSON.stringify(completed));
            }
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                navigate('/language-learning/hindi-course');
            }, 2000);
        }
    };

    const renderVocabViewer = () => {
        const vocabIds = currentExercise.data.vocabIds || [];
        const currentVocab = hindiVocabulary.find(v => v.id === vocabIds[vocabIndex]);

        if (!currentVocab) return null;

        return (
            <div className="space-y-6">
                <Card className="p-8 text-center space-y-6">
                    {/* Picture */}
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-3xl flex items-center justify-center overflow-hidden">
                        <div className="text-8xl">{getEmojiForCategory(currentVocab.category)}</div>
                    </div>

                    {/* Hindi Word */}
                    <div>
                        <h2 className="text-5xl font-bold text-foreground mb-2">
                            {currentVocab.hindi}
                        </h2>
                        <p className="text-xl text-muted-foreground mb-1">
                            {currentVocab.romanization}
                        </p>
                        <p className="text-lg text-muted-foreground">
                            {currentVocab.english}
                        </p>
                    </div>

                    {/* Audio Button */}
                    <Button
                        size="lg"
                        onClick={() => playAudio(currentVocab.audio)}
                        disabled={isPlaying}
                        className="rounded-full px-8"
                    >
                        <Volume2 className="w-5 h-5 mr-2" />
                        Listen
                    </Button>
                </Card>

                {/* Navigation */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setVocabIndex(Math.max(0, vocabIndex - 1))}
                        disabled={vocabIndex === 0}
                        className="flex-1"
                    >
                        ← Previous
                    </Button>
                    <Button
                        onClick={() => {
                            if (vocabIndex < vocabIds.length - 1) {
                                setVocabIndex(vocabIndex + 1);
                            } else {
                                handleNextExercise();
                            }
                        }}
                        className="flex-1"
                    >
                        {vocabIndex < vocabIds.length - 1 ? 'Next →' : 'Continue →'}
                    </Button>
                </div>
            </div>
        );
    };

    const renderMatchingGame = () => {
        const pairs = currentExercise.data.pairs || [];
        const [leftItems, setLeftItems] = useState(pairs.map((p: any) => p.hindi));
        const [rightItems, setRightItems] = useState(
            [...pairs.map((p: any) => p.english)].sort(() => Math.random() - 0.5)
        );
        const [selected, setSelected] = useState<{ hindi?: string; english?: string }>({});

        const handleSelect = (item: string, type: 'hindi' | 'english') => {
            const newSelected = { ...selected, [type]: item };
            setSelected(newSelected);

            if (newSelected.hindi && newSelected.english) {
                // Check if match is correct
                const pair = pairs.find((p: any) => p.hindi === newSelected.hindi);
                if (pair && pair.english === newSelected.english) {
                    setMatchingAnswers({
                        ...matchingAnswers,
                        [newSelected.hindi]: newSelected.english
                    });
                    setSelected({});
                } else {
                    // Wrong match - shake animation
                    setTimeout(() => setSelected({}), 500);
                }
            }
        };

        const allMatched = Object.keys(matchingAnswers).length === pairs.length;

        return (
            <div className="space-y-6">
                <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">Match Hindi to English</h3>
                    <p className="text-sm text-muted-foreground">हिंदी को अंग्रेजी से मिलाएं</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Hindi Column */}
                    <div className="space-y-3">
                        {leftItems.map((hindi) => {
                            const isMatched = matchingAnswers[hindi];
                            const isSelected = selected.hindi === hindi;
                            return (
                                <button
                                    key={hindi}
                                    onClick={() => !isMatched && handleSelect(hindi, 'hindi')}
                                    disabled={!!isMatched}
                                    className={`w-full p-4 rounded-xl border-2 font-bold text-lg transition-all ${isMatched
                                        ? 'bg-green-100 border-green-500 text-green-700'
                                        : isSelected
                                            ? 'bg-blue-100 border-blue-500'
                                            : 'bg-white border-gray-300 hover:border-blue-300'
                                        }`}
                                >
                                    {hindi}
                                </button>
                            );
                        })}
                    </div>

                    {/* English Column */}
                    <div className="space-y-3">
                        {rightItems.map((english) => {
                            const isMatched = Object.values(matchingAnswers).includes(english);
                            const isSelected = selected.english === english;
                            return (
                                <button
                                    key={english}
                                    onClick={() => !isMatched && handleSelect(english, 'english')}
                                    disabled={!!isMatched}
                                    className={`w-full p-4 rounded-xl border-2 font-bold text-lg transition-all ${isMatched
                                        ? 'bg-green-100 border-green-500 text-green-700'
                                        : isSelected
                                            ? 'bg-blue-100 border-blue-500'
                                            : 'bg-white border-gray-300 hover:border-blue-300'
                                        }`}
                                >
                                    {english}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {allMatched && (
                    <div className="text-center space-y-4">
                        <div className="text-6xl">🎉</div>
                        <h3 className="text-2xl font-bold text-green-600">Perfect!</h3>
                        <Button onClick={handleNextExercise} size="lg" className="px-8">
                            Continue →
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const renderExercise = () => {
        switch (currentExercise.type) {
            case 'vocab-viewer':
                return renderVocabViewer();
            case 'matching':
                return renderMatchingGame();
            default:
                return (
                    <div className="text-center p-8">
                        <p className="text-muted-foreground">Exercise type not implemented yet</p>
                        <Button onClick={handleNextExercise} className="mt-4">
                            Skip →
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-black dark:to-black pb-12">
            {/* Header */}
            <div className="px-4 pt-4 flex items-center justify-between mb-6">
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
                <span className="text-sm font-semibold text-muted-foreground">
                    {currentExerciseIndex + 1} / {lesson.exercises.length}
                </span>
            </div>

            {/* Lesson Title */}
            <div className="px-6 mb-6 text-center">
                <h1 className="text-2xl font-bold text-foreground mb-1">{lesson.title}</h1>
                <p className="text-muted-foreground">{lesson.titleHindi}</p>
            </div>

            {/* Exercise Content */}
            <div className="px-6">
                {renderExercise()}
            </div>
        </div>
    );
}

function getEmojiForCategory(category: string): string {
    const emojiMap: Record<string, string> = {
        greetings: '👋',
        numbers: '🔢',
        family: '👨‍👩‍👧‍👦',
        verbs: '🏃',
        animals: '🐾',
        food: '🍎',
        school: '📚',
        home: '🏠',
    };
    return emojiMap[category] || '📖';
}
