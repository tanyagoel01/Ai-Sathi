/**
 * Example: Complete Math Tutor Flow
 * Combines embeddings search with LLM response generation
 */

import { generateResponse, generateResponseStream } from '../slm/model.js';
import { getAnswerContext } from '../services/searchService.js';
import embeddingsDb from '../embeddings/db.json';

/**
 * System prompt for the math tutor
 */
const MATH_TUTOR_SYSTEM_PROMPT = `You are a friendly and encouraging math tutor for Class 1 students (ages 6-7).

GUIDELINES:
- Use simple, age-appropriate language
- Be encouraging and positive
- Break down concepts into small steps
- Use examples from everyday life
- Explain in both English and Hindi when helpful
- Use emojis to make learning fun ✨
- Always base your answers on the provided curriculum context
- Keep responses concise (2-3 short paragraphs)

TOPICS YOU TEACH:
- Numbers (1-100), counting, place value
- Addition and subtraction (up to 20)
- Shapes and patterns
- Measurement (length, weight, capacity, time)
- Money (coins and notes)
- Data handling basics

Remember: You're helping young children learn, so be patient and make math enjoyable! 🎯`;

/**
 * Complete flow: Search + Generate response
 * @param {string} studentQuestion - What the student is asking
 * @returns {Promise<object>} - Response with context and answer
 */
export async function answerMathQuestion(studentQuestion) {
  try {
    console.log('📚 Searching for relevant content...');
    
    // Step 1: Get relevant context from embeddings
    const context = await getAnswerContext(studentQuestion, embeddingsDb);
    
    if (!context.chapter) {
      return {
        success: false,
        message: "I couldn't find information about that topic. Can you try asking in a different way?",
        confidence: 0
      };
    }

    console.log(`✓ Found relevant chapter: ${context.chapter.title}`);
    console.log(`✓ Confidence: ${(context.confidence * 100).toFixed(1)}%`);

    // Step 2: Build context text for the LLM
    const contextText = `
CHAPTER: ${context.chapter.title}

SUMMARY: ${context.chapter.summary}

EXPLANATION (English): ${context.chapter.englishExpl}

EXPLANATION (Hindi): ${context.chapter.hindiExpl}

EXAMPLES:
${context.chapter.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

${context.relatedQuestions.length > 0 ? `
RELATED PRACTICE QUESTIONS:
${context.relatedQuestions.map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}`).join('\n\n')}
` : ''}
`.trim();

    console.log('🤖 Generating AI response...');

    // Step 3: Generate response using LLM
    const aiResponse = await generateResponse(
      MATH_TUTOR_SYSTEM_PROMPT,
      studentQuestion,
      contextText
    );

    console.log('✓ Response generated');

    return {
      success: true,
      answer: aiResponse,
      context: {
        chapter: context.chapter.title,
        relatedQuestions: context.relatedQuestions,
        confidence: context.confidence
      }
    };

  } catch (error) {
    console.error('Error answering question:', error);
    return {
      success: false,
      message: "Sorry, I had trouble answering that. Can you try again? 😊",
      error: error.message
    };
  }
}

/**
 * Streaming version for real-time responses
 * @param {string} studentQuestion - What the student is asking
 * @param {Function} onChunk - Callback for each chunk of text
 * @returns {Promise<object>} - Response with context
 */
export async function answerMathQuestionStream(studentQuestion, onChunk) {
  try {
    // Step 1: Get relevant context
    const context = await getAnswerContext(studentQuestion, embeddingsDb);
    
    if (!context.chapter) {
      const errorMsg = "I couldn't find information about that topic. Can you try asking in a different way?";
      if (onChunk) onChunk(errorMsg);
      return { success: false, message: errorMsg };
    }

    // Step 2: Build context text
    const contextText = `
CHAPTER: ${context.chapter.title}
SUMMARY: ${context.chapter.summary}
EXPLANATION (English): ${context.chapter.englishExpl}
EXPLANATION (Hindi): ${context.chapter.hindiExpl}
EXAMPLES: ${context.chapter.examples.join(', ')}
`.trim();

    // Step 3: Generate streaming response
    const fullResponse = await generateResponseStream(
      MATH_TUTOR_SYSTEM_PROMPT,
      studentQuestion,
      contextText,
      onChunk
    );

    return {
      success: true,
      answer: fullResponse,
      context: {
        chapter: context.chapter.title,
        relatedQuestions: context.relatedQuestions,
        confidence: context.confidence
      }
    };

  } catch (error) {
    console.error('Error in streaming answer:', error);
    const errorMsg = "Sorry, I had trouble answering that. Can you try again? 😊";
    if (onChunk) onChunk(errorMsg);
    return { success: false, message: errorMsg, error: error.message };
  }
}

// Example usage (commented out)
/*
// Basic usage
const result = await answerMathQuestion("What is addition?");
console.log(result.answer);

// Streaming usage (for real-time UI updates)
await answerMathQuestionStream(
  "How do I count to 10?",
  (chunk) => {
    // Update UI with each chunk
    console.log(chunk);
  }
);

// Non-math question (triggers guardrail)
const offTopic = await answerMathQuestion("What is a dinosaur?");
console.log(offTopic.answer); // Will get redirect message

// Hindi question (works with embeddings)
const hindiResult = await answerMathQuestion("संख्या क्या है?");
console.log(hindiResult.answer);
*/
