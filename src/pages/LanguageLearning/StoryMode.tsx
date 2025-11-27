/**
 * STORY MODE
 * Interactive stories with word highlighting and audio
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Volume2, BookOpen } from 'lucide-react';
import { stories, type Story } from '@/data/languageLearning/stories';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function StoryMode() {
    const navigate = useNavigate();
    const { storyId } = useParams();
    const { play, isPlaying } = useAudioPlayer();
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
    const [readingLanguage, setReadingLanguage] = useState<'english' | 'hindi'>('english');

    useEffect(() => {
        if (storyId) {
            const story = stories.find(s => s.id === storyId);
            if (story) {
                setSelectedStory(story);
            }
        }
    }, [storyId]);

    const playStory = (story: Story) => {
        const text = readingLanguage === 'hindi' && story.textHindi ? story.textHindi : story.text;
        const lang = readingLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
        play(text, lang).catch(console.error);
    };

    const playWord = (word: string, isHindi: boolean) => {
        const lang = isHindi ? 'hi-IN' : 'en-IN';
        play(word, lang).catch(console.error);
    };

    if (selectedStory) {
        const text = readingLanguage === 'hindi' && selectedStory.textHindi
            ? selectedStory.textHindi
            : selectedStory.text;

        return (
            <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-black dark:to-black pb-12">
                {/* Header */}
                <div className="px-4 pt-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSelectedStory(null);
                            navigate('/language-learning/stories');
                        }}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={readingLanguage === 'english' ? 'default' : 'outline'}
                            onClick={() => setReadingLanguage('english')}
                        >
                            English
                        </Button>
                        <Button
                            size="sm"
                            variant={readingLanguage === 'hindi' ? 'default' : 'outline'}
                            onClick={() => setReadingLanguage('hindi')}
                        >
                            हिंदी
                        </Button>
                    </div>
                </div>

                {/* Story Content */}
                <div className="px-6 pt-8 space-y-6">
                    {/* Title */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            {readingLanguage === 'hindi' ? selectedStory.titleHindi : selectedStory.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Level {selectedStory.level} • {selectedStory.language}
                        </p>
                    </div>

                    {/* Illustration */}
                    <Card className="p-8">
                        <div className="w-full aspect-video bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl flex items-center justify-center">
                            <div className="text-9xl">📖</div>
                        </div>
                    </Card>

                    {/* Story Text */}
                    <Card className="p-6">
                        <div className="mb-4 flex justify-between items-center">
                            <h3 className="font-semibold text-foreground">Story</h3>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => playStory(selectedStory)}
                                disabled={isPlaying}
                                className="rounded-full"
                            >
                                <Volume2 className="w-4 h-4 mr-2" />
                                Read Aloud
                            </Button>
                        </div>
                        <div className="text-lg leading-relaxed space-y-2">
                            {text.split('. ').map((sentence, index) => (
                                <p key={index} className="text-foreground">
                                    {sentence.trim()}{sentence.trim() && '.'}
                                </p>
                            ))}
                        </div>
                    </Card>

                    {/* Vocabulary from Story */}
                    <Card className="p-6">
                        <h3 className="font-semibold text-foreground mb-4">Key Words</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {selectedStory.words.slice(0, 6).map((wordData) => (
                                <button
                                    key={wordData.word}
                                    onClick={() => {
                                        setHighlightedWord(wordData.word);
                                        playWord(wordData.word, readingLanguage === 'hindi');
                                    }}
                                    className={`p-3 rounded-xl border-2 transition-all ${highlightedWord === wordData.word
                                        ? 'bg-yellow-100 border-yellow-500'
                                        : 'bg-white border-gray-300 hover:border-yellow-300'
                                        }`}
                                >
                                    <p className="font-bold text-foreground">{wordData.word}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {readingLanguage === 'hindi' ? wordData.meaningHindi : wordData.meaning}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Complete Button */}
                    <Button
                        size="lg"
                        onClick={() => {
                            // Mark story as read
                            const readStories = JSON.parse(localStorage.getItem('readStories') || '[]');
                            if (!readStories.includes(selectedStory.id)) {
                                readStories.push(selectedStory.id);
                                localStorage.setItem('readStories', JSON.stringify(readStories));
                            }
                            navigate('/language-learning/stories');
                        }}
                        className="w-full rounded-2xl h-14 bg-gradient-to-r from-yellow-500 to-orange-500"
                    >
                        ✓ Mark as Read
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-black dark:to-black pb-12">
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
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">Story Mode</h1>
                <p className="text-muted-foreground">कहानी मोड</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Read interactive stories with audio narration and learn new words!
                </p>
            </div>

            {/* Stories List */}
            <div className="px-6 space-y-4">
                {stories.map((story) => {
                    const isRead = JSON.parse(localStorage.getItem('readStories') || '[]').includes(story.id);

                    return (
                        <Card
                            key={story.id}
                            className="p-6 cursor-pointer hover:shadow-lg transition-all"
                            onClick={() => navigate(`/language-learning/story/${story.id}`)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                                    <div className="text-4xl">📖</div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            Level {story.level}
                                        </span>
                                        {isRead && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                ✓ Read
                                            </span>
                                        )}
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            {story.language}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-1">
                                        {story.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {story.titleHindi}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {story.text.substring(0, 100)}...
                                    </p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
