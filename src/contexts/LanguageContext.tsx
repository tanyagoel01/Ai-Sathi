import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'kn';

export interface LiteracyState {
    completedAssessment: boolean;
    hindiScore: number;
    englishScore: number;
    placement: "hindi-literacy" | "english-literacy" | "both-literacy" | "skip-to-subjects" | null;
}

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    translate: (text: string, targetLang?: Language) => Promise<string>;
    t: (text: string) => string;
    aiPipeline: any;
    setAiPipeline: (pipeline: any) => void;
    literacyState: LiteracyState;
    setLiteracyState: (state: LiteracyState) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Static translations moved to component scope for access by both translate and t
const staticTranslations: Record<Language, Record<string, string>> = {
    hi: {
        'Choose Your Class': 'अपनी कक्षा चुनें',
        'Select your grade to start learning': 'सीखना शुरू करने के लिए अपनी कक्षा चुनें',
        'Choose a Subject': 'विषय चुनें',
        'Back': 'वापस',
        'Coming Soon': 'जल्द आ रहा है',
        'Class': 'कक्षा',
        'Start with Class 5': 'कक्षा 5 से शुरू करें',
        'Learn Maths, Language, and more with AI-powered explanations in simple language. More classes coming soon!': 'सरल भाषा में AI-संचालित स्पष्टीकरण के साथ गणित, भाषा और अधिक सीखें। अधिक कक्षाएं जल्द आ रही हैं!',
        'Your personal AI tutor that works without internet. Learn anytime, anywhere!': 'आपका व्यक्तिगत AI शिक्षक जो इंटरनेट के बिना काम करता है। कभी भी, कहीं भी सीखें!',
        'AI Sathi': 'AI साथी',
        'Works Offline': 'ऑफ़लाइन काम करता है',
        'NCERT Aligned': 'NCERT के अनुसार',
        'Free Forever': 'हमेशा मुफ़्त',
        'Powered by AI • Designed for Indian Students • Made with ❤️': 'AI द्वारा संचालित • भारतीय छात्रों के लिए डिज़ाइन किया गया • ❤️ के साथ बनाया गया',
        'Hello! I\'m your AI tutor. Ask me anything about your lesson or share your doubts!': 'नमस्ते! मैं आपका AI शिक्षक हूं। अपने पाठ के बारे में कुछ भी पूछें!',
        'Type your question...': 'अपना प्रश्न लिखें...',
        'Maths': 'गणित',
        'Science': 'विज्ञान',
        'Grade 5 NCERT - Numbers, Addition, Fractions': 'NCERT - संख्याएं, जोड़, भिन्न',
        'Grade 5 NCERT - Body, Plants, Weather': 'NCERT - शरीर, पौधे, मौसम',
        'Maths Chapters': 'गणित के अध्याय',
        'Numbers and Operations': 'संख्याएं और संक्रियाएं',
        'Learn about numbers, addition, and subtraction': 'संख्याओं, जोड़ और घटाव के बारे में जानें',
        'Shapes and Patterns': 'आकृतियां और पैटर्न',
        'Identify shapes and create patterns': 'आकृतियों को पहचानें और पैटर्न बनाएं',
        'Measurement': 'मापन',
        'Learn about length, weight, and capacity': 'लंबाई, वजन और क्षमता के बारे में जानें',
        'Time and Money': 'समय और पैसा',
        'Tell time and understand money': 'समय बताएं और पैसे को समझें',
        'Science Chapters': 'विज्ञान के अध्याय',
        'The Human Body': 'मानव शरीर',
        'Learn about body parts and their functions': 'शरीर के अंगों और उनके कार्यों के बारे में जानें',
        'Plants Around Us': 'हमारे चारों ओर के पौधे',
        'Understand plant parts and their importance': 'पौधों के अंगों और उनके महत्व को समझें',
        'Animal Life': 'जीव जंतु',
        'Discover different animals and their habitats': 'विभिन्न जानवरों और उनके आवासों की खोज करें',
        'Weather and Climate': 'मौसम और जलवायु',
        'Explore weather patterns and seasons': 'मौसम के पैटर्न और ऋतुओं का पता लगाएं',
        'Class 5 • NCERT': 'कक्षा 5 • NCERT',
        'Easy': 'आसान',
        'Medium': 'मध्यम',
        'Hard': 'कठिन',
        'cards': 'कार्ड',
        'Science Lessons': 'विज्ञान पाठ',
        'Class 5 • NCERT | Learn with Cards': 'कक्षा 5 • NCERT | कार्ड के साथ सीखें',
        'Lesson': 'पाठ',
        'Lessons': 'पाठ',
        'easy': 'आसान',
        'medium': 'मध्यम',
        'hard': 'कठिन',
        'Online': 'लाइव',
        'Offline Mode Active ✨': 'ऑफ़लाइन मोड सक्रिय ✨',
        'Ready to Learn?': 'सीखने के लिए तैयार हैं?',
        'Start with Grade 5 Maths and ask me anything! I\'ll explain step-by-step in simple language.': 'कक्षा 5 गणित से शुरू करें और मुझसे कुछ भी पूछें! मैं सरल भाषा में चरण-दर-चरण समझाऊंगा।',
        'Start Learning Now →': 'अभी सीखना शुरू करें →',
        'Works completely offline • NCERT aligned • Free forever': 'पूरी तरह से ऑफ़लाइन काम करता है • NCERT के अनुसार • हमेशा के लिए मुफ़्त',
        'Loading lesson...': 'पाठ लोड हो रहा है...',
        'explanation': 'व्याख्या',
        'example': 'उदाहरण',
        'tip': 'सुझाव',
        'practice': 'अभ्यास',
        'Previous': 'पिछला',
        'Next': 'अगला',
        'Check Answer': 'जवाब जांचें',
        'Finish Lesson': 'पाठ पूरा करें',
        'Correct! 🎉': 'सही! 🎉',
        'Not quite 😔': 'फिर कोशिश करें 😔',
        'Learn More About This 💬': 'इस विषय पर और जानें 💬',
        'Ask a Question 💭': 'कोई प्रश्न पूछें 💭',
        'Ask your question and get an answer from the AI teacher!': 'अपना सवाल पूछें और AI शिक्षक से उत्तर पाएं!',
        'Type your question here...': 'यहाँ अपना सवाल लिखें...',
        'Get Answer': 'जवाब पाएं',
        'Finding answer...': 'जवाब खोज रहे हैं...',
        'Your Question:': 'आपका प्रश्न:',
        'Answer:': 'उत्तर:',
        'Close': 'बंद करें',
        'Please enter a question': 'कृपया एक प्रश्न लिखें',
        'Error getting answer': 'उत्तर प्राप्त करने में त्रुटि',
        'Please check your answer first!': 'कृपया पहले अपना जवाब जांचें!',
        'Language Learning': 'भाषा सीखना',
        'Learn Hindi, English & Kannada with interactive lessons, stories, and games!': 'इंटरैक्टिव पाठों, कहानियों और खेलों के साथ हिंदी, अंग्रेज़ी और कन्नड़ सीखें!',
        'Choose a Module': 'एक मॉड्यूल चुनें',
        'Hindi Alphabet': 'हिंदी वर्णमाला',
        'Learn to read Hindi step by step': 'हिंदी पढ़ना कदम-दर-कदम सीखें',
        'Hindi Course': 'हिंदी कोर्स',
        'Learn Hindi from basics': 'हिंदी बुनियादी से सीखें',
        'English Course': 'अंग्रेज़ी कोर्स',
        'Learn English A-Z': 'अंग्रेज़ी A-Z सीखें',
        'Picture Dictionary': 'चित्र शब्दकोश',
        'Visual word learning': 'चित्रों से शब्द सीखें',
        'Story Mode': 'कहानी मोड',
        'Read interactive stories': 'इंटरैक्टिव कहानियाँ पढ़ें',
        'Student Profiles': 'छात्र प्रोफ़ाइल',
        'Manage multiple students': 'कई छात्रों को प्रबंधित करें',
        'Progress Dashboard': 'प्रगति डैशबोर्ड',
        'View learning progress': 'सीखने की प्रगति देखें',
        'New to Language Learning?': 'भाषा सीखने में नए हैं?',
        'Start with the Hindi Alphabet to learn to read Hindi step by step!': 'हिंदी पढ़ना कदम-दर-कदम सीखने के लिए हिंदी वर्णमाला से शुरू करें!',
        'Start Learning →': 'सीखना शुरू करें →',
    },
    kn: {
        'Choose Your Class': 'ನಿಮ್ಮ ತರಗತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'Select your grade to start learning': 'ಕಲಿಕೆಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ತರಗತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'Choose a Subject': 'ವಿಷಯವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        'Back': 'ಹಿಂದೆ',
        'Coming Soon': 'ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ',
        'Class': 'ತರಗತಿ',
        'Start with Class 5': 'ತರಗತಿ 5 ರಿಂದ ಪ್ರಾರಂಭಿಸಿ',
        'Learn Maths, Language, and more with AI-powered explanations in simple language. More classes coming soon!': 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ AI-ಚಾಲಿತ ವಿವರಣೆಗಳೊಂದಿಗೆ ಗಣಿತ, ಭಾಷೆ ಮತ್ತು ಹೆಚ್ಚಿನದನ್ನು ಕಲಿಯಿರಿ. ಹೆಚ್ಚಿನ ತರಗತಿಗಳು ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿವೆ!',
        'Your personal AI tutor that works without internet. Learn anytime, anywhere!': 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆ ಕೆಲಸ ಮಾಡುವ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ AI ಶಿಕ್ಷಕ. ಯಾವಾಗ ಬೇಕಾದರೂ, ಎಲ್ಲಿಯಾದರೂ ಕಲಿಯಿರಿ!',
        'AI Sathi': 'AI ಸಾಥಿ',
        'Works Offline': 'ಆಫ್‌ಲೈನ್ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
        'NCERT Aligned': 'NCERT ಪ್ರಕಾರ',
        'Free Forever': 'ಶಾಶ್ವತವಾಗಿ ಉಚಿತ',
        'Powered by AI • Designed for Indian Students • Made with ❤️': 'AI ನಿಂದ ನಡೆಸಲ್ಪಡುತ್ತದೆ • ಭಾರತೀಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ • ❤️ ನೊಂದಿಗೆ ತಯಾರಿಸಲಾಗಿದೆ',
        'Hello! I\'m your AI tutor. Ask me anything about your lesson or share your doubts!': 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಶಿಕ್ಷಕ. ನಿಮ್ಮ ಪಾಠದ ಬಗ್ಗೆ ಏನನ್ನು ಬೇಕಾದರೂ ಕೇಳಿ!',
        'Type your question...': 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ...',
        'Maths': 'ಗಣಿತ',
        'Science': 'ವಿಜ್ಞಾನ',
        'Grade 5 NCERT - Numbers, Addition, Fractions': 'ತರಗತಿ 5 NCERT - ಸಂಖ್ಯೆಗಳು, ಸೇರ್ಪಡೆ, ಭಿನ್ನರಾಶಿಗಳು',
        'Grade 5 NCERT - Body, Plants, Weather': 'ತರಗತಿ 5 NCERT - ದೇಹ, ಸಸ್ಯಗಳು, ಹವಾಮಾನ',
        'Maths Chapters': 'ಗಣಿತ ಅಧ್ಯಾಯಗಳು',
        'Numbers and Operations': 'ಸಂಖ್ಯೆಗಳು ಮತ್ತು ಕಾರ್ಯಾಚರಣೆಗಳು',
        'Learn about numbers, addition, and subtraction': 'ಸಂಖ್ಯೆಗಳು, ಸಂಕಲನ ಮತ್ತು ವ್ಯವಕಲನದ ಬಗ್ಗೆ ಕಲಿಯಿರಿ',
        'Shapes and Patterns': 'ಆಕಾರಗಳು ಮತ್ತು ಮಾದರಿಗಳು',
        'Identify shapes and create patterns': 'ಆಕಾರಗಳನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ಮಾದರಿಗಳನ್ನು ರಚಿಸಿ',
        'Measurement': 'ಅಳತೆ',
        'Learn about length, weight, and capacity': 'ಉದ್ದ, ತೂಕ ಮತ್ತು ಸಾಮರ್ಥ್ಯದ ಬಗ್ಗೆ ಕಲಿಯಿರಿ',
        'Time and Money': 'ಸಮಯ ಮತ್ತು ಹಣ',
        'Tell time and understand money': 'ಸಮಯ ಹೇಳಿ ಮತ್ತು ಹಣವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
        'Science Chapters': 'ವಿಜ್ಞಾನ ಅಧ್ಯಾಯಗಳು',
        'The Human Body': 'ಮಾನವ ದೇಹ',
        'Learn about body parts and their functions': 'ದೇಹದ ಭಾಗಗಳು ಮತ್ತು ಅವುಗಳ ಕಾರ್ಯಗಳ ಬಗ್ಗೆ ಕಲಿಯಿರಿ',
        'Plants Around Us': 'ನಮ್ಮ ಸುತ್ತಲಿನ ಸಸ್ಯಗಳು',
        'Understand plant parts and their importance': 'ಸಸ್ಯದ ಭಾಗಗಳು ಮತ್ತು ಅವುಗಳ ಮಹತ್ವವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',
        'Animal Life': 'ಪ್ರಾಣಿ ಜೀವನ',
        'Discover different animals and their habitats': 'ವಿವಿಧ ಪ್ರಾಣಿಗಳು ಮತ್ತು ಅವುಗಳ ಆವಾಸಸ್ಥಾನಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
        'Weather and Climate': 'ಹವಾಮಾನ ಮತ್ತು ವಾಯುಗುಣ',
        'Explore weather patterns and seasons': 'ಹವಾಮಾನ ಮಾದರಿಗಳು ಮತ್ತು ಋತುಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
        'Class 5 • NCERT': 'ತರಗತಿ 5 • NCERT',
        'Easy': 'ಸುಲಭ',
        'Medium': 'ಮಧ್ಯಮ',
        'Hard': 'ಕಠಿಣ',
        'cards': 'ಕಾರ್ಡ್‌ಗಳು',
        'Science Lessons': 'ವಿಜ್ಞಾನ ಪಾಠಗಳು',
        'Class 5 • NCERT | Learn with Cards': 'ತರಗತಿ 5 • NCERT | ಕಾರ್ಡ್‌ಗಳ ಮೂಲಕ ಕಲಿಯಿರಿ',
        'Lesson': 'ಪಾಠ',
        'Lessons': 'ಪಾಠಗಳು',
        'easy': 'ಸುಲಭ',
        'medium': 'ಮಧ್ಯಮ',
        'hard': 'ಕಠಿಣ',
        'Online': 'ಲೈವ್',
        'Offline Mode Active ✨': 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯ ✨',
        'Ready to Learn?': 'ಕಲಿಯಲು ಸಿದ್ಧರಿದ್ದೀರಾ?',
        'Start with Grade 5 Maths and ask me anything! I\'ll explain step-by-step in simple language.': 'ತರಗತಿ 5 ಗಣಿತದಿಂದ ಪ್ರಾರಂಭಿಸಿ ಮತ್ತು ನನಗೆ ಏನು ಬೇಕಾದರೂ ಕೇಳಿ! ನಾನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಹಂತ ಹಂತವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ.',
        'Start Learning Now →': 'ಈಗ ಕಲಿಕೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ →',
        'Works completely offline • NCERT aligned • Free forever': 'ಸಂಪೂರ್ಣವಾಗಿ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ • NCERT ಪ್ರಕಾರ • ಶಾಶ್ವತವಾಗಿ ಉಚಿತ',
        'Loading lesson...': 'ಪಾಠವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
        'explanation': 'ವಿವರಣೆ',
        'example': 'ಉದಾಹರಣೆ',
        'tip': 'ಸಲಹೆ',
        'practice': 'ಅಭ್ಯಾಸ',
        'Previous': 'ಹಿಂದಿನ',
        'Next': 'ಮುಂದಿನ',
        'Check Answer': 'ಉತ್ತರ ಪರೀಕ್ಷಿಸಿ',
        'Finish Lesson': 'ಪಾಠ ಮುಗಿಸಿ',
        'Correct! 🎉': 'ಸರಿ! 🎉',
        'Not quite 😔': 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ 😔',
        'Learn More About This 💬': 'ಈ ವಿಷಯದ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ 💬',
        'Ask a Question 💭': 'ಪ್ರಶ್ನೆ ಕೇಳಿ 💭',
        'Ask your question and get an answer from the AI teacher!': 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕೇಳಿ ಮತ್ತು AI ಶಿಕ್ಷಕರಿಂದ ಉತ್ತರ ಪಡೆಯಿರಿ!',
        'Type your question here...': 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...',
        'Get Answer': 'ಉತ್ತರ ಪಡೆಯಿರಿ',
        'Finding answer...': 'ಉತ್ತರ ಹುಡುಕುತ್ತಿದ್ದೇವೆ...',
        'Your Question:': 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ:',
        'Answer:': 'ಉತ್ತರ:',
        'Close': 'ಮುಚ್ಚಿ',
        'Please enter a question': 'ದಯವಿಟ್ಟು ಒಂದು ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ',
        'Error getting answer': 'ಉತ್ತರ ಪಡೆಯುವಲ್ಲಿ ದೋಷ',
        'Please check your answer first!': 'ದಯವಿಟ್ಟು ಮೊದಲು ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಪರೀಕ್ಷಿಸಿ!',
        'Language Learning': 'ಭಾಷಾ ಕಲಿಕೆ',
        'Learn Hindi, English & Kannada with interactive lessons, stories, and games!': 'ಸಂವಾದಾತ್ಮಕ ಪಾಠಗಳು, ಕಥೆಗಳು ಮತ್ತು ಆಟಗಳೊಂದಿಗೆ ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡ ಕಲಿಯಿರಿ!',
        'Choose a Module': 'ಮಾಡ್ಯೂಲ್ ಆಯ್ಕೆಮಾಡಿ',
        'Hindi Alphabet': 'ಹಿಂದಿ ವರ್ಣಮಾಲೆ',
        'Learn to read Hindi step by step': 'ಹಂತ ಹಂತವಾಗಿ ಹಿಂದಿ ಓದಲು ಕಲಿಯಿರಿ',
        'Hindi Course': 'ಹಿಂದಿ ಕೋರ್ಸ್',
        'Learn Hindi from basics': 'ಮೂಲಭೂತ ರಿಂದ ಹಿಂದಿ ಕಲಿಯಿರಿ',
        'English Course': 'ಇಂಗ್ಲಿಷ್ ಕೋರ್ಸ್',
        'Learn English A-Z': 'ಇಂಗ್ಲಿಷ್ A-Z ಕಲಿಯಿರಿ',
        'Picture Dictionary': 'ಚಿತ್ರ ನಿಘಂಟು',
        'Visual word learning': 'ದೃಶ್ಯ ಪದ ಕಲಿಕೆ',
        'Story Mode': 'ಕಥೆ ಮೋಡ್',
        'Read interactive stories': 'ಸಂವಾದಾತ್ಮಕ ಕಥೆಗಳನ್ನು ಓದಿ',
        'Student Profiles': 'ವಿದ್ಯಾರ್ಥಿ ಪ್ರೊಫೈಲ್‌ಗಳು',
        'Manage multiple students': 'ಬಹು ವಿದ್ಯಾರ್ಥಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
        'Progress Dashboard': 'ಪ್ರಗತಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
        'View learning progress': 'ಕಲಿಕೆಯ ಪ್ರಗತಿಯನ್ನು ವೀಕ್ಷಿಸಿ',
        'New to Language Learning?': 'ಭಾಷಾ ಕಲಿಕೆಗೆ ಹೊಸಬರೇ?',
        'Start with the Hindi Alphabet to learn to read Hindi step by step!': 'ಹಂತ ಹಂತವಾಗಿ ಹಿಂದಿ ಓದಲು ಕಲಿಯಲು ಹಿಂದಿ ವರ್ಣಮಾಲೆಯಿಂದ ಪ್ರಾರಂಭಿಸಿ!',
        'Start Learning →': 'ಕಲಿಕೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ →',
    },
    en: {},
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');
    const [aiPipeline, setAiPipeline] = useState<any>(null);
    const [literacyState, setLiteracyState] = useState<LiteracyState>({
        completedAssessment: localStorage.getItem('completedAssessment') === 'true',
        hindiScore: parseInt(localStorage.getItem('hindiScore') || '0'),
        englishScore: parseInt(localStorage.getItem('englishScore') || '0'),
        placement: (localStorage.getItem('placement') as LiteracyState['placement']) || null,
    });

    const t = (text: string): string => {
        if (language === 'en') return text;
        return staticTranslations[language]?.[text] || text;
    };

    const translate = async (text: string, targetLang?: Language): Promise<string> => {
        const lang = targetLang || language;

        // If the target language is English or no translation needed, return as is
        if (lang === 'en' || !text) {
            return text;
        }

        // Use AI pipeline for translation if available
        if (aiPipeline) {
            try {
                const languageNames = {
                    hi: 'Hindi',
                    kn: 'Kannada',
                    en: 'English'
                };

                const prompt = `Translate the following text to ${languageNames[lang]}. Only provide the translation, nothing else.`;

                const messages = [
                    { role: "system", content: prompt },
                    { role: "user", content: text }
                ];

                const result = await aiPipeline.chat.completions.create({
                    messages,
                    max_tokens: 200,
                    temperature: 0.3,
                });

                const translation = result.choices[0].message.content || text;

                // Extract just the translation part (after "Translation:")
                const translationMatch = translation.match(/Translation:\s*(.+)/s);
                if (translationMatch) {
                    return translationMatch[1].trim();
                }

                return translation.trim();
            } catch (error) {
                console.error('Translation error:', error);
                return text; // Fallback to original text
            }
        }

        return staticTranslations[lang][text] || text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, translate, t, aiPipeline, setAiPipeline, literacyState, setLiteracyState }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
