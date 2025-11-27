/**
 * CLASS SELECTION PAGE
 * 
 * Shows classes 1-5, all enabled
 */

import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ClassOption {
    id: number;
    enabled: boolean;
}

const ClassSelection = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();

    const classes: ClassOption[] = [
        { id: 1, enabled: true },
        { id: 2, enabled: false },
        { id: 3, enabled: false },
        { id: 4, enabled: false },
        { id: 5, enabled: false },
        { id: 6, enabled: true },
    ];

    const handleClassSelect = (classNum: number, enabled: boolean) => {
        if (!enabled) return;

        // Save selected class
        localStorage.setItem("selectedClass", classNum.toString());

        // Navigate to subjects
        navigate("/subjects");
    };

    const getText = (key: string) => {
        const translations: { [key: string]: { en: string; hi: string; kn: string } } = {
            title: {
                en: "Select Your Class",
                hi: "अपनी कक्षा चुनें",
                kn: "ನಿಮ್ಮ ತರಗತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
            },
            subtitle: {
                en: "Choose which class you're studying in",
                hi: "चुनें कि आप किस कक्षा में पढ़ते हैं",
                kn: "ನೀವು ಯಾವ ತರಗತಿಯಲ್ಲಿ ಓದುತ್ತಿದ್ದೀರಿ ಎಂಬುದನ್ನು ಆರಿಸಿ",
            },
            class: {
                en: "Class",
                hi: "कक्षा",
                kn: "ತರಗತಿ",
            },
            comingSoon: {
                en: "Coming Soon",
                hi: "जल्द आ रहा है",
                kn: "ಶೀಘ್ರದಲ್ಲಿ ಬರಲಿದೆ",
            },
            available: {
                en: "Available Now",
                hi: "अभी उपलब्ध",
                kn: "ಈಗ ಲಭ್ಯವಿದೆ",
            },
            info: {
                en: "Classes 1 and 6 are now available with full course content!",
                hi: "कक्षा 1 और 6 अब पूर्ण पाठ्यक्रम सामग्री के साथ उपलब्ध हैं!",
                kn: "ತರಗತಿ 1 ಮತ್ತು 6 ಈಗ ಸಂಪೂರ್ಣ ಕೋರ್ಸ್ ವಿಷಯದೊಂದಿಗೆ ಲಭ್ಯವಿದೆ!",
            },
            languageCourse: {
                en: "Language Literacy Course",
                hi: "भाषा साक्षरता पाठ्यक्रम",
                kn: "ಭಾಷಾ ಸಾಕ್ಷರತಾ ಕೋರ್ಸ್",
            },
            languageDesc: {
                en: "Learn Hindi, English, Kannada basics",
                hi: "हिंदी, अंग्रेजी, कन्नड़ मूल बातें सीखें",
                kn: "ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್, ಕನ್ನಡ ಮೂಲಗಳನ್ನು ಕಲಿಯಿರಿ",
            },
            new: {
                en: "New",
                hi: "नया",
                kn: "ಹೊಸ",
            },
        };

        return translations[key]?.[language] || translations[key]?.en || "";
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 dark:from-black dark:via-black dark:to-black relative">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
                <ThemeToggle />
            </div>
            
            {/* Back Button */}
            <button
                onClick={() => navigate("/language-onboarding")}
                className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110 z-10 group"
                aria-label="Go back"
            >
                <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header with Teacher Mascot */}
                <div className="text-center mb-12">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1.5 shadow-xl">
                        <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden">
                            <img
                                src="/teacher-mascot.jpg"
                                alt="AI Sathi Teacher"
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {getText("title")}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        {getText("subtitle")}
                    </p>
                </div>

                {/* Language Learning Button */}
                <div className="max-w-2xl mx-auto mb-8">
                    <Card
                        className="p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center gap-6"
                        onClick={() => navigate("/language-learning")}
                    >
                        <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-orange-900 dark:text-orange-300 mb-1">
                                {getText("languageCourse")}
                            </h3>
                            <p className="text-orange-700/80 dark:text-orange-400/80">
                                {getText("languageDesc")}
                            </p>
                        </div>
                        <div className="ml-auto">
                            <Badge className="bg-orange-200 text-orange-800 hover:bg-orange-200">
                                {getText("new")}
                            </Badge>
                        </div>
                    </Card>
                </div>

                {/* Class Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    {classes.map((classOption) => (
                        <Card
                            key={classOption.id}
                            className={`relative p-6 transition-all cursor-pointer ${classOption.enabled
                                ? "hover:shadow-lg hover:scale-105 border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900"
                                : "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                                }`}
                            onClick={() => handleClassSelect(classOption.id, classOption.enabled)}
                        >
                            {/* Lock Icon for Disabled */}
                            {!classOption.enabled && (
                                <div className="absolute top-3 right-3">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                            )}

                            {/* Class Number */}
                            <div className="text-center mb-3">
                                <div
                                    className={`text-5xl font-bold mb-2 ${classOption.enabled
                                        ? "text-blue-600"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {classOption.id}
                                </div>
                                <p
                                    className={`text-sm font-semibold ${classOption.enabled
                                        ? "text-gray-700"
                                        : "text-gray-400"
                                        }`}
                                >
                                    {getText("class")} {classOption.id}
                                </p>
                            </div>

                            {/* Status Badge */}
                            <div className="flex justify-center">
                                {classOption.enabled ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                        {getText("available")}
                                    </Badge>
                                ) : (
                                    <Badge className="bg-gray-200 text-gray-600">
                                        {getText("comingSoon")}
                                    </Badge>
                                )}
                            </div>

                            {/* Hover Effect Border for Enabled */}
                            {classOption.enabled && (
                                <div className="absolute inset-0 rounded-lg border-2 border-transparent hover:border-blue-400 transition-colors pointer-events-none"></div>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Info Text */}
                <div className="text-center mt-12">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        📚 {getText("info")}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ClassSelection;
