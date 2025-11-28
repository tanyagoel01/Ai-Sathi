/**
 * HINDI ALPHABET LESSON VIEW
 * Interactive exercises for learning Hindi letters
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
    getLessonById,
    getLetterById,
    type AlphabetLesson,
    type AlphabetExercise,
    type HindiLetter,
} from '@/data/languageLearning/hindiAlphabet';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import confetti from 'canvas-confetti';

export default function HindiAlphabetLessonView() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();
    const { play, isPlaying } = useAudioPlayer();

    const [lesson, setLesson] = useState<AlphabetLesson | null>(null);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [exerciseProgress, setExerciseProgress] = useState<Record<string, boolean>>({});
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        if (lessonId) {
            const foundLesson = getLessonById(lessonId);
            setLesson(foundLesson || null);
        }
    }, [lessonId]);

    if (!lesson) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Lesson not found</p>
            </div>
        );
    }

    const currentExercise = lesson.exercises[currentExerciseIndex];
    const progressPercentage = ((currentExerciseIndex + 1) / lesson.exercises.length) * 100;

    const playLetterSound = (letterId: string) => {
        const letter = getLetterById(letterId);
        if (letter) {
            // Use TTS with Indian accent
            play(letter.letter + ' ' + letter.romanization, 'hi-IN').catch(console.error);
        }
    };

    const handleNext = () => {
        if (currentExerciseIndex < lesson.exercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
        } else {
            // Lesson complete!
            completeLesson();
        }
    };

    const completeLesson = () => {
        // Save to localStorage
        const saved = localStorage.getItem('alphabetCompletedLessons');
        const completed = saved ? JSON.parse(saved) : [];
        if (!completed.includes(lesson.id)) {
            completed.push(lesson.id);
            localStorage.setItem('alphabetCompletedLessons', JSON.stringify(completed));
        }

        // Celebrate!
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        });

        // Show completion screen
        setTimeout(() => {
            navigate('/language-learning/alphabet-course');
        }, 2000);
    };

    const handleAnswerSelect = (answer: string, correctAnswer: string) => {
        setSelectedAnswer(answer);
        setIsCorrect(answer === correctAnswer);
        setShowFeedback(true);

        if (answer === correctAnswer) {
            // Mark exercise as complete
            setExerciseProgress({
                ...exerciseProgress,
                [currentExercise.id]: true,
            });

            // Auto-advance after 1.5 seconds
            setTimeout(() => {
                handleNext();
            }, 1500);
        }
    };

    // Render different exercise types
    const renderExercise = () => {
        switch (currentExercise.type) {
            case 'introduction':
                return <IntroductionExercise exercise={currentExercise} onNext={handleNext} playSound={playLetterSound} playText={play} />;

            case 'listen-repeat':
                return <ListenRepeatExercise exercise={currentExercise} onNext={handleNext} playSound={playLetterSound} />;

            case 'match':
                return (
                    <MatchExercise
                        exercise={currentExercise}
                        selectedAnswer={selectedAnswer}
                        showFeedback={showFeedback}
                        isCorrect={isCorrect}
                        onAnswerSelect={handleAnswerSelect}
                        onNext={handleNext}
                    />
                );

            case 'identify':
                return (
                    <IdentifyExercise
                        exercise={currentExercise}
                        selectedAnswer={selectedAnswer}
                        showFeedback={showFeedback}
                        isCorrect={isCorrect}
                        onAnswerSelect={handleAnswerSelect}
                        playSound={playLetterSound}
                    />
                );

            case 'word-building':
                return <WordBuildingExercise exercise={currentExercise} onNext={handleNext} playSound={playLetterSound} />;

            case 'reading':
                return <ReadingExercise exercise={currentExercise} onNext={handleNext} playSound={play} />;

            default:
                return <div>Exercise type not implemented</div>;
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

            {/* Progress Bar */}
            <div className="px-6 pt-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                        Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {Math.round(progressPercentage)}%
                    </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Lesson Title */}
            <div className="px-6 pt-6 pb-4 text-center">
                <h1 className="text-2xl font-bold text-foreground mb-1">{lesson.title}</h1>
                <p className="text-lg text-purple-600 dark:text-purple-400">{lesson.titleHindi}</p>
            </div>

            {/* Exercise Content */}
            <div className="px-6">{renderExercise()}</div>
        </div>
    );
}

// ============================================
// INTRODUCTION EXERCISE
// ============================================

function IntroductionExercise({
    exercise,
    onNext,
    playSound,
    playText,
}: {
    exercise: AlphabetExercise;
    onNext: () => void;
    playSound: (letterId: string) => void;
    playText: (text: string, lang: string) => Promise<void>;
}) {
    const letters = exercise.data.letters.map((id: string) => getLetterById(id)).filter(Boolean) as HindiLetter[];

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-foreground mb-2">{exercise.title}</h2>
                <p className="text-sm text-muted-foreground mb-1">{exercise.instructions}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">{exercise.instructionsHindi}</p>
            </Card>

            <div className="grid gap-4">
                {letters.map((letter) => (
                    <Card key={letter.id} className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <span className="text-4xl text-white font-bold">{letter.letter}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-3xl font-bold text-foreground mb-1">{letter.letter}</h3>
                                <p className="text-lg text-purple-600 dark:text-purple-400 mb-1">{letter.romanization}</p>
                                <p className="text-sm text-muted-foreground">{letter.sound}</p>
                            </div>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => playSound(letter.id)}
                                className="rounded-full"
                            >
                                <Volume2 className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Examples */}
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">Examples:</p>
                            {letter.examples.map((example, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-gray-800 rounded-lg justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{example.picture}</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-foreground">{example.word}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        playText(example.word, 'hi-IN');
                                                    }}
                                                >
                                                    <Volume2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-muted-foreground">
                                                    {example.wordRoman} - {example.meaning}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        playText(example.meaning, 'en-IN');
                                                    }}
                                                >
                                                    <Volume2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            <Button onClick={onNext} size="lg" className="w-full rounded-2xl h-14 bg-gradient-to-r from-purple-500 to-pink-500">
                Continue →
            </Button>
        </div>
    );
}

// ============================================
// LISTEN & REPEAT EXERCISE
// ============================================

function ListenRepeatExercise({
    exercise,
    onNext,
    playSound,
}: {
    exercise: AlphabetExercise;
    onNext: () => void;
    playSound: (letterId: string) => void;
}) {
    const letters = exercise.data.letters.map((id: string) => getLetterById(id)).filter(Boolean) as HindiLetter[];

    return (
        <div className="space-y-6 px-4 pb-6">
            {/* Improved Instructional Box */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 rounded-2xl shadow-sm">
                <h2 className="text-2xl font-bold text-foreground mb-4">{exercise.title}</h2>
                <p className="text-base text-muted-foreground mb-3 leading-relaxed">{exercise.instructions}</p>
                <p className="text-base text-purple-700 dark:text-purple-400 font-medium">{exercise.instructionsHindi}</p>
            </Card>

            {/* Improved Letter Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {letters.map((letter) => (
                    <Card
                        key={letter.id}
                        className="relative cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 rounded-2xl shadow-md hover:shadow-xl border border-purple-100 bg-white overflow-hidden group"
                        onClick={() => playSound(letter.id)}
                    >
                        {/* Audio Icon - Top Right */}
                        <div className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-1.5 shadow-sm group-hover:bg-purple-100 transition-colors">
                            <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>

                        {/* Letter Card Content */}
                        <div className="w-full h-[140px] md:h-[160px] flex flex-col items-center justify-center p-4">
                            {/* Letter Display with Soft Pastel Background */}
                            <div className="w-full h-full max-w-[140px] max-h-[140px] rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-inner mb-2">
                                <span className="text-6xl md:text-7xl text-purple-800 dark:text-purple-300 font-black leading-none">{letter.letter}</span>
                            </div>
                            
                            {/* Romanization */}
                            <p className="text-sm md:text-base font-semibold text-purple-700 dark:text-purple-400 mt-2">{letter.romanization}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <Button onClick={onNext} size="lg" className="w-full rounded-2xl h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg">
                I've Practiced! →
            </Button>
        </div>
    );
}

// ============================================
// MATCH EXERCISE
// ============================================

function MatchExercise({
    exercise,
    selectedAnswer,
    showFeedback,
    isCorrect,
    onAnswerSelect,
    onNext,
}: {
    exercise: AlphabetExercise;
    selectedAnswer: string | null;
    showFeedback: boolean;
    isCorrect: boolean;
    onAnswerSelect: (answer: string, correct: string) => void;
    onNext: () => void;
}) {
    const [currentPairIndex, setCurrentPairIndex] = useState(0);
    const pairs = exercise.data.pairs;
    const currentPair = pairs[currentPairIndex];
    const letter = getLetterById(currentPair.letter);

    if (!letter) return null;

    // Create options (correct + 2 random)
    const allImages = pairs.map((p: any) => p.image);
    const options = [currentPair.image];
    const otherImages = allImages.filter((img: string) => img !== currentPair.image);
    while (options.length < 3 && otherImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherImages.length);
        options.push(otherImages[randomIndex]);
        otherImages.splice(randomIndex, 1);
    }
    // Shuffle
    options.sort(() => Math.random() - 0.5);

    const handleSelect = (image: string) => {
        onAnswerSelect(image, currentPair.image);
        if (image === currentPair.image && currentPairIndex < pairs.length - 1) {
            setTimeout(() => {
                setCurrentPairIndex(currentPairIndex + 1);
            }, 1500);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-yellow-50 dark:bg-gray-800 border-yellow-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-foreground mb-2">{exercise.title}</h2>
                <p className="text-sm text-muted-foreground mb-1">{exercise.instructions}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">{exercise.instructionsHindi}</p>
            </Card>

            {/* Letter to match */}
            <Card className="p-8">
                <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">Match this letter:</p>
                    <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-6xl text-white font-bold">{letter.letter}</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{letter.romanization}</p>
                </div>
            </Card>

            {/* Options */}
            <div className="grid grid-cols-3 gap-4">
                {options.map((image, idx) => (
                    <Card
                        key={idx}
                        className={`p-6 cursor-pointer transition-all ${selectedAnswer === image
                            ? isCorrect
                                ? 'bg-green-100 border-green-500 border-2'
                                : 'bg-red-100 border-red-500 border-2'
                            : 'hover:shadow-lg hover:scale-105'
                            }`}
                        onClick={() => !showFeedback && handleSelect(image)}
                    >
                        <div className="text-center">
                            <div className="text-6xl mb-2">{image}</div>
                            {selectedAnswer === image && showFeedback && (
                                <div className="mt-2">
                                    {isCorrect ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600 mx-auto" />
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {showFeedback && isCorrect && currentPairIndex === pairs.length - 1 && (
                <Button onClick={onNext} size="lg" className="w-full rounded-2xl h-14 bg-gradient-to-r from-green-500 to-emerald-500">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Continue
                </Button>
            )}
        </div>
    );
}

// ============================================
// IDENTIFY EXERCISE
// ============================================

function IdentifyExercise({
    exercise,
    selectedAnswer,
    showFeedback,
    isCorrect,
    onAnswerSelect,
    playSound,
}: {
    exercise: AlphabetExercise;
    selectedAnswer: string | null;
    showFeedback: boolean;
    isCorrect: boolean;
    onAnswerSelect: (answer: string, correct: string) => void;
    playSound: (letterId: string) => void;
}) {
    const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
    const letters = exercise.data.letters;
    const currentLetterId = letters[currentLetterIndex];
    const currentLetter = getLetterById(currentLetterId);

    if (!currentLetter) return null;

    // Create options
    const options = [currentLetterId];
    const otherLetters = letters.filter((id: string) => id !== currentLetterId);
    while (options.length < 3 && otherLetters.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherLetters.length);
        options.push(otherLetters[randomIndex]);
        otherLetters.splice(randomIndex, 1);
    }
    options.sort(() => Math.random() - 0.5);

    const handleSelect = (letterId: string) => {
        onAnswerSelect(letterId, currentLetterId);
        if (letterId === currentLetterId && currentLetterIndex < letters.length - 1) {
            setTimeout(() => {
                setCurrentLetterIndex(currentLetterIndex + 1);
            }, 1500);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-orange-50 border-orange-200">
                <h2 className="text-xl font-bold text-foreground mb-2">{exercise.title}</h2>
                <p className="text-sm text-muted-foreground mb-1">{exercise.instructions}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">{exercise.instructionsHindi}</p>
            </Card>

            {/* Play sound */}
            <Card className="p-8">
                <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">Listen to the sound:</p>
                    <Button
                        size="lg"
                        onClick={() => playSound(currentLetterId)}
                        className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                        <Volume2 className="w-6 h-6 mr-2" />
                        Play Sound
                    </Button>
                    <p className="text-sm text-muted-foreground">Then tap the correct letter below</p>
                </div>
            </Card>

            {/* Options */}
            <div className="grid grid-cols-3 gap-4">
                {options.map((letterId) => {
                    const letter = getLetterById(letterId);
                    if (!letter) return null;

                    return (
                        <Card
                            key={letterId}
                            className={`p-6 cursor-pointer transition-all ${selectedAnswer === letterId
                                ? isCorrect
                                    ? 'bg-green-100 border-green-500 border-2'
                                    : 'bg-red-100 border-red-500 border-2'
                                : 'hover:shadow-lg hover:scale-105'
                                }`}
                            onClick={() => !showFeedback && handleSelect(letterId)}
                        >
                            <div className="text-center">
                                <div className="text-5xl font-bold mb-2">{letter.letter}</div>
                                <p className="text-sm text-purple-600 dark:text-purple-400">{letter.romanization}</p>
                                {selectedAnswer === letterId && showFeedback && (
                                    <div className="mt-2">
                                        {isCorrect ? (
                                            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-red-600 mx-auto" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================
// WORD BUILDING EXERCISE
// ============================================

function WordBuildingExercise({
    exercise,
    onNext,
    playSound,
}: {
    exercise: AlphabetExercise;
    onNext: () => void;
    playSound: (letterId: string) => void;
}) {
    const combinations = exercise.data.combinations;

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-pink-50 dark:bg-gray-800 border-pink-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-foreground mb-2">{exercise.title}</h2>
                <p className="text-sm text-muted-foreground mb-1">{exercise.instructions}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">{exercise.instructionsHindi}</p>
            </Card>

            <div className="space-y-4">
                {combinations.map((combo: any, idx: number) => {
                    const consonant = getLetterById(combo.consonant);
                    const vowel = getLetterById(combo.vowel);

                    if (!consonant || !vowel) return null;

                    return (
                        <Card key={idx} className="p-6">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center mb-2">
                                        <span className="text-3xl font-bold">{consonant.letter}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{consonant.romanization}</p>
                                </div>

                                <span className="text-2xl text-muted-foreground">+</span>

                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-xl bg-pink-100 flex items-center justify-center mb-2">
                                        <span className="text-3xl font-bold">{vowel.letter}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{vowel.romanization}</p>
                                </div>

                                <span className="text-2xl text-muted-foreground">=</span>

                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
                                        <span className="text-4xl font-bold text-white">{combo.word}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">{combo.meaning}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Button onClick={onNext} size="lg" className="w-full rounded-2xl h-14 bg-gradient-to-r from-purple-500 to-pink-500">
                Continue →
            </Button>
        </div>
    );
}

// ============================================
// READING EXERCISE
// ============================================

function ReadingExercise({
    exercise,
    onNext,
    playSound,
}: {
    exercise: AlphabetExercise;
    onNext: () => void;
    playSound: (text: string, lang: string) => Promise<void>;
}) {
    const data = exercise.data;

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-cyan-50 border-cyan-200">
                <h2 className="text-xl font-bold text-foreground mb-2">{exercise.title}</h2>
                <p className="text-sm text-muted-foreground mb-1">{exercise.instructions}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">{exercise.instructionsHindi}</p>
            </Card>

            {/* Words */}
            {data.words && (
                <div className="space-y-3">
                    {data.words.map((item: any, idx: number) => (
                        <Card key={idx} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-3xl font-bold text-foreground mb-1">{item.word}</h3>
                                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">{item.roman}</p>
                                    <p className="text-sm text-muted-foreground">{item.meaning}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() => playSound(item.word, 'hi-IN')}
                                        className="rounded-full"
                                    >
                                        <Volume2 className="w-6 h-6" />
                                        <span className="sr-only">Play Hindi</span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => playSound(item.meaning, 'en-IN')}
                                        className="rounded-full text-muted-foreground"
                                    >
                                        <Volume2 className="w-4 h-4 mr-1" />
                                        Eng
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Sentences */}
            {data.sentences && (
                <div className="space-y-3">
                    {data.sentences.map((item: any, idx: number) => (
                        <Card key={idx} className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-foreground mb-2">{item.sentence}</h3>
                                        <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">{item.roman}</p>
                                        <p className="text-sm text-muted-foreground">{item.meaning}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            onClick={() => playSound(item.sentence, 'hi-IN')}
                                            className="rounded-full"
                                        >
                                            <Volume2 className="w-6 h-6" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => playSound(item.meaning, 'en-IN')}
                                            className="rounded-full text-muted-foreground"
                                        >
                                            <Volume2 className="w-4 h-4 mr-1" />
                                            Eng
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Story */}
            {data.story && (
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="space-y-4">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-foreground mb-1">{data.story.title}</h3>
                            <p className="text-lg text-purple-600 dark:text-purple-400 mb-1">{data.story.titleRoman}</p>
                            <p className="text-sm text-muted-foreground">{data.story.titleEnglish}</p>
                        </div>

                        <div className="p-6 bg-white rounded-xl">
                            <p className="text-xl leading-relaxed text-foreground mb-4">{data.story.text}</p>
                            <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">{data.story.textRoman}</p>
                            <p className="text-sm text-muted-foreground">{data.story.textEnglish}</p>
                        </div>

                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => playSound(data.story.text, 'hi-IN')}
                            className="w-full rounded-2xl"
                        >
                            <Volume2 className="w-6 h-6 mr-2" />
                            Read Aloud
                        </Button>
                    </div>
                </Card>
            )}

            <Button onClick={onNext} size="lg" className="w-full rounded-2xl h-14 bg-gradient-to-r from-cyan-500 to-blue-500">
                <Trophy className="w-5 h-5 mr-2" />
                Complete Exercise
            </Button>
        </div>
    );
}
