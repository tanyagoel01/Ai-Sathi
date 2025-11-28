/**
 * PICTURE DICTIONARY
 * Visual glossary for non-readers
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { pictureDictionary, type DictionaryCategory, type DictionaryItem } from '@/data/languageLearning/pictureDictionary';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function PictureDictionary() {
    const navigate = useNavigate();
    const { play, isPlaying } = useAudioPlayer();
    const [selectedCategory, setSelectedCategory] = useState<DictionaryCategory | null>(null);
    const [selectedItem, setSelectedItem] = useState<DictionaryItem | null>(null);

    const playWord = (item: DictionaryItem, lang: 'english' | 'hindi' | 'kannada') => {
        const audioMap = {
            english: item.audioEnglish,
            hindi: item.audioHindi,
            kannada: item.audioKannada,
        };

        const textMap = {
            english: item.english,
            hindi: item.hindi,
            kannada: item.kannada || item.english,
        };

        const langCodeMap = {
            english: 'en-IN',
            hindi: 'hi-IN',
            kannada: 'kn-IN',
        };

        // Use TTS as fallback
        play(textMap[lang], langCodeMap[lang]).catch(console.error);
    };

    if (selectedItem) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-black dark:to-black pb-12">
                {/* Header */}
                <div className="px-4 pt-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedItem(null)}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <ThemeToggle />
                </div>

                {/* Word Detail */}
                <div className="px-6 pt-8 space-y-6">
                    {/* Picture */}
                    <Card className="p-8">
                        <div className="w-full max-w-[16rem] aspect-square mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center overflow-hidden">
                            {selectedCategory?.id === 'school' ? (
                                <img
                                    src={selectedItem.picture}
                                    alt={selectedItem.english}
                                    className="w-full h-full object-contain p-4"
                                />
                            ) : (
                                <div className="text-9xl">
                                    {getCategoryEmoji(selectedCategory?.id || '')}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Words in All Languages */}
                    <div className="space-y-4">
                        {/* English */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">English</p>
                                    <h2 className="text-3xl font-bold text-foreground">
                                        {selectedItem.english}
                                    </h2>
                                </div>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => playWord(selectedItem, 'english')}
                                    disabled={isPlaying}
                                    className="rounded-full"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </Button>
                            </div>
                        </Card>

                        {/* Hindi */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">हिंदी</p>
                                    <h2 className="text-3xl font-bold text-foreground">
                                        {selectedItem.hindi}
                                    </h2>
                                </div>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => playWord(selectedItem, 'hindi')}
                                    disabled={isPlaying}
                                    className="rounded-full"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </Button>
                            </div>
                        </Card>

                        {/* Kannada */}
                        {selectedItem.kannada && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">ಕನ್ನಡ</p>
                                        <h2 className="text-3xl font-bold text-foreground">
                                            {selectedItem.kannada}
                                        </h2>
                                    </div>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() => playWord(selectedItem, 'kannada')}
                                        disabled={isPlaying}
                                        className="rounded-full"
                                    >
                                        <Volume2 className="w-6 h-6" />
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Play All Button */}
                    <Button
                        size="lg"
                        onClick={() => {
                            playWord(selectedItem, 'english');
                            setTimeout(() => playWord(selectedItem, 'hindi'), 2000);
                            if (selectedItem.kannada) {
                                setTimeout(() => playWord(selectedItem, 'kannada'), 4000);
                            }
                        }}
                        className="w-full rounded-2xl h-14 bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                        🔊 Play All Languages
                    </Button>
                </div>
            </div>
        );
    }

    if (selectedCategory) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-black dark:to-black pb-12">
                {/* Header */}
                <div className="px-4 pt-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <ThemeToggle />
                </div>

                {/* Category Header */}
                <div className="px-6 pt-8 pb-6 text-center">
                    <div className="text-6xl mb-4">{selectedCategory.icon}</div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">
                        {selectedCategory.name}
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        {selectedCategory.nameHindi}
                    </p>
                </div>

                {/* Items Grid */}
                <div className="px-6 grid grid-cols-2 gap-4">
                    {selectedCategory.items.map((item) => (
                        <Card
                            key={item.id}
                            className="p-4 cursor-pointer hover:shadow-lg transition-all"
                            onClick={() => setSelectedItem(item)}
                        >
                            <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-3 overflow-hidden">
                                {selectedCategory.id === 'school' ? (
                                    <img
                                        src={item.picture}
                                        alt={item.english}
                                        className="w-full h-full object-contain p-2"
                                    />
                                ) : (
                                    <div className="text-5xl">
                                        {getCategoryEmoji(selectedCategory.id)}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-center text-foreground mb-1">
                                {item.english}
                            </h3>
                            <p className="text-sm text-center text-muted-foreground">
                                {item.hindi}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-black dark:to-black pb-12">
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
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <span className="text-4xl">📖</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">Picture Dictionary</h1>
                <p className="text-muted-foreground">चित्र शब्दकोश</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Tap any picture to hear the word in English, Hindi, and Kannada!
                </p>
            </div>

            {/* Categories */}
            <div className="px-6 space-y-4">
                {pictureDictionary.map((category) => (
                    <Card
                        key={category.id}
                        className="p-6 cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => setSelectedCategory(category)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-3xl">{category.icon}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-foreground mb-1">
                                    {category.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {category.nameHindi} • {category.items.length} words
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function getCategoryEmoji(categoryId: string): string {
    const emojiMap: Record<string, string[]> = {
        animals: ['🐱', '🐕', '🐄', '🐦', '🐘'],
        food: ['🍎', '🍌', '🍚', '💧', '🍞'],
        school: ['📚', '✏️', '🎒', '👨‍🏫'],
        home: ['🪑', '🪑', '🛏️', '🚪'],
    };

    const emojis = emojiMap[categoryId] || ['📖'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}
