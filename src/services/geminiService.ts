/**
 * AI SERVICE - TEMPORARY PROTOTYPE ENGINE
 * 
 * ⚠️ REPLACE WITH SLM LATER ⚠️
 * 
 * All AI API calls are isolated here for easy replacement.
 * When your SLM is ready, replace functions in this file with your local model calls.
 * 
 * Search for: "// 🔄 REPLACE WITH SLM" to find all integration points.

 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; // Get from environment variable
const GEMINI_API_URL = GEMINI_API_KEY 
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
  : "";

interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiResponse {
  candidates?: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

/**
 * 🔄 REPLACE WITH SLM
 * Generic API caller
 */
async function callGemini(prompt: string): Promise<string> {
  // If no API key is configured, return a helpful fallback message
  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    console.warn("⚠️ API key not configured. Using fallback responses.");
    console.warn("💡 Make sure VITE_GEMINI_API_KEY is set in your .env file");
    return getFallbackResponse(prompt);
  }

  const requestBody: GeminiRequest = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  try {
    console.log("📡 Calling AI API...");
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ AI API error: ${response.status} - ${errorText}`);
      // Fall back to local responses if API fails
      return getFallbackResponse(prompt);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (text.trim()) {
      console.log("✅ AI API response received");
      return text.trim();
    } else {
      console.warn("⚠️ Empty response from API, using fallback");
      return getFallbackResponse(prompt);
    }
  } catch (error) {
    console.error("❌ AI API call failed:", error);
    // Return fallback response instead of throwing
    return getFallbackResponse(prompt);
  }
}

/**
 * Fallback responses when AI API is not available
 */
function getFallbackResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Math-related questions
  if (lowerPrompt.includes("addition") || lowerPrompt.includes("add") || lowerPrompt.includes("जोड़")) {
    return "Addition means putting numbers together! For example: 5 + 3 = 8. When we add, we count up from the first number. Try practicing with small numbers first and then move to bigger ones!";
  }
  
  if (lowerPrompt.includes("subtraction") || lowerPrompt.includes("subtract") || lowerPrompt.includes("घटा")) {
    return "Subtraction means taking away! For example: 8 - 3 = 5. We start with 8 and count backwards 3 times: 7, 6, 5. Practice with objects like marbles or stones to make it easier!";
  }
  
  if (lowerPrompt.includes("multiplication") || lowerPrompt.includes("multiply") || lowerPrompt.includes("गुणा")) {
    return "Multiplication is repeated addition! For example: 3 × 4 means adding 3 four times: 3 + 3 + 3 + 3 = 12. It's a quick way to add the same number many times!";
  }
  
  // Science-related questions
  if (lowerPrompt.includes("plant") || lowerPrompt.includes("पौधे")) {
    return "Plants are amazing! They have roots that drink water, stems that carry it up, leaves that make food using sunlight, and flowers that make seeds. Plants need water, sunlight, and soil to grow healthy and strong!";
  }
  
  if (lowerPrompt.includes("body") || lowerPrompt.includes("शरीर")) {
    return "Our body has many important parts! Eyes help us see, ears help us hear, nose helps us smell, tongue helps us taste, and hands help us hold things. Each part has a special job to keep us healthy and happy!";
  }
  
  if (lowerPrompt.includes("animal") || lowerPrompt.includes("जानवर")) {
    return "There are many types of animals! Domestic animals like cows and chickens live with us. Wild animals like tigers and elephants live in forests. Water animals like fish live in rivers and seas. All animals need food, water, and shelter!";
  }
  
  // General educational response
  return "That's a great question! I'm here to help you learn. Let me explain: Every topic we study builds on what we already know. Try breaking the problem into smaller parts and practice step by step. If you need more help with a specific concept, feel free to ask more questions!";
}

// ============================================================
// LITERACY ASSESSMENT FUNCTIONS
// ============================================================

export interface AssessmentResult {
  hindiScore: number; // 0-100
  englishScore: number; // 0-100
  placement: "hindi-literacy" | "english-literacy" | "both-literacy" | "skip-to-subjects";
  recommendations: string;
}

/**
 * 🔄 REPLACE WITH SLM
 * Score literacy assessment answers
 */
export async function scoreLiteracyAssessment(
  hindiAnswers: Record<string, string>,
  englishAnswers: Record<string, string>
): Promise<AssessmentResult> {
  const prompt = `You are an educational assessment engine for rural India literacy placement.

Hindi Assessment Answers:
${JSON.stringify(hindiAnswers, null, 2)}

English Assessment Answers:
${JSON.stringify(englishAnswers, null, 2)}

Scoring rubric:
- Letter identification: 10 points each
- Sound matching: 15 points each
- Word-picture matching: 10 points each

Return ONLY valid JSON:
{
  "hindiScore": <0-100>,
  "englishScore": <0-100>,
  "placement": "<hindi-literacy|english-literacy|both-literacy|skip-to-subjects>",
  "recommendations": "<brief guidance in English and Hindi>"
}

Placement logic:
- Both scores < 40: both-literacy
- Hindi < 40, English >= 40: hindi-literacy
- English < 40, Hindi >= 40: english-literacy
- Both >= 70: skip-to-subjects`;

  try {
    const response = await callGemini(prompt);
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response from API");
  } catch (error) {
    console.error("Assessment scoring failed:", error);
    // Fallback: simple rule-based scoring
    return fallbackAssessmentScoring(hindiAnswers, englishAnswers);
  }
}

/**
 * Fallback assessment scoring (no AI needed)
 */
function fallbackAssessmentScoring(
  hindiAnswers: Record<string, string>,
  englishAnswers: Record<string, string>
): AssessmentResult {
  // Simple correct answer counting
  const hindiCorrect = Object.values(hindiAnswers).filter(Boolean).length;
  const englishCorrect = Object.values(englishAnswers).filter(Boolean).length;
  
  const hindiScore = Math.min(100, hindiCorrect * 20);
  const englishScore = Math.min(100, englishCorrect * 20);

  let placement: AssessmentResult["placement"] = "both-literacy";
  if (hindiScore >= 70 && englishScore >= 70) {
    placement = "skip-to-subjects";
  } else if (hindiScore < 40 && englishScore >= 40) {
    placement = "hindi-literacy";
  } else if (englishScore < 40 && hindiScore >= 40) {
    placement = "english-literacy";
  }

  return {
    hindiScore,
    englishScore,
    placement,
    recommendations: "Complete the recommended literacy courses before continuing.",
  };
}

// ============================================================
// QUIZ GENERATION (Duolingo-style)
// ============================================================

export interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "match-pairs" | "fill-blank" | "audio-prompt";
  question: string;
  questionAudio?: string; // TTS text or audio URL
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
}

/**
 * 🔄 REPLACE WITH SLM
 * Generate adaptive quiz questions
 */
export async function generateQuizQuestions(
  language: "hindi" | "english",
  level: "beginner" | "intermediate" | "advanced",
  topic: string,
  count: number = 5
): Promise<QuizQuestion[]> {
  const prompt = `Generate ${count} ${level} literacy quiz questions in ${language} for topic: ${topic}.

Requirements:
- Mix question types: multiple-choice, fill-blank, match-pairs
- Audio-first approach (provide text that can be read aloud)
- Rural India context (familiar objects, scenarios)
- Progressive difficulty

Return ONLY valid JSON array:
[
  {
    "id": "q1",
    "type": "multiple-choice",
    "question": "Which letter makes the 'ka' sound?",
    "questionAudio": "Which letter makes the ka sound",
    "options": ["क", "ख", "ग", "घ"],
    "correctAnswer": "क",
    "explanation": "क makes the 'ka' sound",
    "difficulty": "easy"
  }
]`;

  try {
    const response = await callGemini(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid JSON response from API");
  } catch (error) {
    console.error("Quiz generation failed:", error);
    // Fallback: return sample questions
    return getFallbackQuizQuestions(language, level);
  }
}

/**
 * Fallback quiz questions (no AI needed)
 */
function getFallbackQuizQuestions(
  language: "hindi" | "english",
  level: string
): QuizQuestion[] {
  if (language === "hindi") {
    return [
      {
        id: "h1",
        type: "multiple-choice",
        question: "कौन सा अक्षर 'क' है?",
        questionAudio: "कौन सा अक्षर 'क' है?",
        options: ["क", "ख", "ग", "घ"],
        correctAnswer: "क",
        explanation: "यह 'क' अक्षर है",
        difficulty: "easy",
      },
      {
        id: "h2",
        type: "multiple-choice",
        question: "इनमें से कौन सा शब्द है?",
        questionAudio: "इनमें से कौन सा शब्द है?",
        options: ["माँ", "123", "xyz", "@#$"],
        correctAnswer: "माँ",
        explanation: "'माँ' एक हिंदी शब्द है",
        difficulty: "easy",
      },
    ];
  } else {
    return [
      {
        id: "e1",
        type: "multiple-choice",
        question: "Which letter is 'A'?",
        questionAudio: "Which letter is A?",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
        explanation: "This is the letter A",
        difficulty: "easy",
      },
      {
        id: "e2",
        type: "multiple-choice",
        question: "What is this? 🐱",
        questionAudio: "What is this?",
        options: ["Cat", "Dog", "Bird", "Fish"],
        correctAnswer: "Cat",
        explanation: "This is a cat",
        difficulty: "easy",
      },
    ];
  }
}

/**
 * 🔄 REPLACE WITH SLM
 * Check quiz answer and provide feedback
 */
export async function checkQuizAnswer(
  question: QuizQuestion,
  userAnswer: string
): Promise<{
  correct: boolean;
  feedback: string;
  encouragement: string;
}> {
  const isCorrect = Array.isArray(question.correctAnswer)
    ? question.correctAnswer.includes(userAnswer)
    : question.correctAnswer === userAnswer;

  // For prototype, use simple feedback
  // Later: use SLM for personalized, empathetic feedback
  return {
    correct: isCorrect,
    feedback: isCorrect
      ? question.explanation || "Correct!"
      : `The correct answer is: ${question.correctAnswer}`,
    encouragement: isCorrect
      ? "Great job! Keep going! 🎉"
      : "Don't worry, practice makes perfect! 💪",
  };
}

// ============================================================
// SUBJECT TUTORING (MATH, SCIENCE, ETC.)
// ============================================================

export interface TutoringContext {
  subject: string;
  chapter: string;
  language: "hindi" | "english";
  userQuestion: string;
  chatHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * 🔄 REPLACE WITH SLM
 * Main tutoring function for subject questions (Math, Science, etc.)
 */
export async function getTutoringResponse(context: TutoringContext): Promise<string> {
  const languageInstruction =
    context.language === "hindi"
      ? "Respond in Hindi (Devanagari script) with simple explanations suitable for rural students."
      : "Respond in simple English suitable for rural students.";

  const historyContext = context.chatHistory
    ? context.chatHistory.slice(-4).map((msg) => `${msg.role}: ${msg.content}`).join("\n")
    : "";

  const prompt = `You are an AI tutor (AI Sathi) for Indian students learning ${context.subject}.

Current Topic: ${context.chapter}
${languageInstruction}

Context from previous messages:
${historyContext}

Student Question: ${context.userQuestion}

Instructions:
- Explain concepts step-by-step in simple language
- Use examples from rural Indian daily life (farming, markets, local festivals)
- For math: show working clearly, use examples with rupees, meters, kilograms
- For science: relate to everyday observations
- Be encouraging and patient
- Keep answers concise (2-3 paragraphs max)
- Do not use any emojis in your response

Answer:`;

  try {
    const response = await callGemini(prompt);
    return response;
  } catch (error) {
    console.error("Tutoring response failed:", error);
    // Fallback response
    return context.language === "hindi"
      ? "माफ़ करें, मैं अभी जवाब नहीं दे सकता। कृपया दोबारा कोशिश करें।"
      : "Sorry, I cannot answer right now. Please try again.";
  }
}

/**
 * Simple math expression evaluator (for quick calculations)
 * Use this for basic arithmetic before calling AI
 */
export function evaluateMathExpression(expression: string): number | null {
  try {
    // Sanitize input - allow only numbers, operators, parentheses, and spaces
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "");
    
    // Check for balanced parentheses
    let balance = 0;
    for (const char of sanitized) {
      if (char === "(") balance++;
      if (char === ")") balance--;
      if (balance < 0) return null;
    }
    if (balance !== 0) return null;

    // Evaluate using Function constructor (safer than eval)
    const result = new Function(`return ${sanitized}`)();
    
    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

export default {
  scoreLiteracyAssessment,
  generateQuizQuestions,
  checkQuizAnswer,
  getTutoringResponse,
  evaluateMathExpression,
};
