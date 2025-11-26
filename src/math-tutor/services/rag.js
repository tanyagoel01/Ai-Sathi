/**
 * RAG (Retrieval-Augmented Generation) Service
 * Combines semantic search with LLM generation for accurate, context-aware answers
 */

import { embedText, cosineSimilarity } from './embed.js';
import { generateResponse, generateResponseStream } from '../slm/model.js';

/**
 * Embed the user's question
 * @param {string} question - The user's question
 * @returns {Promise<number[]>} - The embedding vector
 */
async function embed(question) {
  return await embedText(question);
}

/**
 * Find nearest matching content from the database
 * @param {object} db - The embeddings database
 * @param {number[]} queryEmbedding - The query's embedding vector
 * @param {number} topK - Number of results to return (default: 2)
 * @returns {Array} - Top K nearest matches with similarity scores
 */
function findNearest(db, queryEmbedding, topK = 2) {
  // Combine chapters and questions into single searchable array
  const allEntries = [
    ...db.chapters.map(ch => ({ ...ch, type: 'chapter' })),
    ...db.questions.map(q => ({ ...q, type: 'question' }))
  ];

  // Calculate similarity for each entry
  const results = allEntries.map(entry => ({
    ...entry,
    similarity: cosineSimilarity(queryEmbedding, entry.embedding)
  }));

  // Sort by similarity (highest first) and return top K
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Build context text from retrieved chunks
 * @param {Array} matches - Array of matched entries
 * @returns {string} - Formatted context text
 */
function buildContext(matches) {
  const contextParts = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    
    if (match.type === 'chapter') {
      contextParts.push(`
📚 CHAPTER: ${match.title}

SUMMARY: ${match.summary}

ENGLISH EXPLANATION:
${match.englishExpl}

HINDI EXPLANATION:
${match.hindiExpl}

EXAMPLES:
${match.examples ? match.examples.map((ex, idx) => `${idx + 1}. ${ex}`).join('\n') : 'N/A'}

COMMON MISCONCEPTIONS:
${match.misconceptions || 'None noted'}
`.trim());
    } else if (match.type === 'question') {
      contextParts.push(`
💡 PRACTICE EXAMPLE:
Question: ${match.questionText}
Answer: ${match.answer}
Type: ${match.questionType}
From Chapter: ${match.chapter || 'N/A'}
`.trim());
    }
  }

  return contextParts.join('\n\n---\n\n');
}

/**
 * Create the final prompt for the LLM
 * @param {string} question - The user's question
 * @param {string} context - The retrieved context
 * @returns {object} - System prompt and user prompt
 */
function createPrompt(question, context) {
  const systemPrompt = `You are a friendly and patient Class 1 Math teacher for young children (ages 6-7).

TEACHING GUIDELINES:
- Use simple, age-appropriate language that 6-7 year olds can understand
- Keep tone warm, encouraging, and positive
- Break concepts into very small, easy steps
- Use everyday examples (toys, fruits, fingers, etc.)
- Avoid complex equations or advanced terminology
- Use emojis to make learning fun (✨ 🎯 🌟 ⭐ 📚)
- Encourage the child with phrases like "Great question!", "You can do it!"
- Explain in both English and Hindi when helpful
- Keep responses short and focused (2-3 simple paragraphs)

CONTENT RULES:
- ALWAYS use the provided context to answer
- Do NOT make up information not in the context
- If context doesn't fully answer, say "Let me help you with what I know..."
- Relate math to real life (counting toys, sharing snacks, etc.)
- For numbers, use relatable quantities (fingers, toes, fruits)

TONE EXAMPLES:
❌ Too Advanced: "To solve this equation, apply the commutative property..."
✅ Just Right: "When we add, it doesn't matter which number comes first! 2+3 is the same as 3+2. Try it with your fingers! 👍"

Remember: You're teaching a young child who is just beginning their math journey!`;

  const userPrompt = `CONTEXT FROM CURRICULUM:
${context}

STUDENT'S QUESTION:
${question}

Please answer the student's question using the context provided above. Keep your explanation simple, encouraging, and age-appropriate for a Class 1 student.`;

  return { systemPrompt, userPrompt };
}

/**
 * RAG Query: Complete pipeline from question to answer
 * @param {string} question - The user's question
 * @param {object} db - The embeddings database
 * @param {number} topK - Number of context chunks to retrieve (default: 2)
 * @returns {Promise<object>} - Answer with metadata
 */
export async function ragQuery(question, db, topK = 2) {
  try {
    console.log('🔍 RAG Query started...');
    
    // Step 1: Embed the question
    console.log('   → Embedding question...');
    const queryEmbedding = await embed(question);
    
    // Step 2: Find nearest matches
    console.log('   → Searching for relevant content...');
    const matches = findNearest(db, queryEmbedding, topK);
    
    if (matches.length === 0) {
      return {
        success: false,
        answer: "I couldn't find information about that in my Class 1 math curriculum. Can you try asking in a different way? 😊",
        matches: [],
        confidence: 0
      };
    }
    
    console.log(`   → Found ${matches.length} relevant matches`);
    console.log(`   → Top match: "${matches[0].title || matches[0].questionText}" (${(matches[0].similarity * 100).toFixed(1)}% similar)`);
    
    // Step 3: Build context from matches
    const context = buildContext(matches);
    
    // Step 4: Create prompts
    const { systemPrompt, userPrompt } = createPrompt(question, context);
    
    // Step 5: Generate answer using LLM
    console.log('   → Generating answer with LLM...');
    const answer = await generateResponse(systemPrompt, userPrompt, '');
    
    console.log('✅ RAG Query complete');
    
    return {
      success: true,
      answer: answer,
      matches: matches.map(m => ({
        type: m.type,
        title: m.title || m.questionText,
        similarity: m.similarity,
        chapter: m.type === 'chapter' ? m.title : m.chapter
      })),
      confidence: matches[0].similarity,
      topK: matches.length
    };
    
  } catch (error) {
    console.error('❌ RAG Query failed:', error);
    return {
      success: false,
      answer: "Sorry, I had trouble answering that question. Can you try again? 😊",
      error: error.message,
      matches: [],
      confidence: 0
    };
  }
}

/**
 * RAG Query with streaming for real-time responses
 * @param {string} question - The user's question
 * @param {object} db - The embeddings database
 * @param {Function} onChunk - Callback for each chunk of generated text
 * @param {number} topK - Number of context chunks to retrieve (default: 2)
 * @returns {Promise<object>} - Answer with metadata
 */
export async function ragQueryStream(question, db, onChunk, topK = 2) {
  try {
    // Step 1: Embed the question
    const queryEmbedding = await embed(question);
    
    // Step 2: Find nearest matches
    const matches = findNearest(db, queryEmbedding, topK);
    
    if (matches.length === 0) {
      const errorMsg = "I couldn't find information about that in my Class 1 math curriculum. Can you try asking in a different way? 😊";
      if (onChunk) onChunk(errorMsg);
      return {
        success: false,
        answer: errorMsg,
        matches: [],
        confidence: 0
      };
    }
    
    // Step 3: Build context
    const context = buildContext(matches);
    
    // Step 4: Create prompts
    const { systemPrompt, userPrompt } = createPrompt(question, context);
    
    // Step 5: Generate streaming answer
    const answer = await generateResponseStream(systemPrompt, userPrompt, '', onChunk);
    
    return {
      success: true,
      answer: answer,
      matches: matches.map(m => ({
        type: m.type,
        title: m.title || m.questionText,
        similarity: m.similarity,
        chapter: m.type === 'chapter' ? m.title : m.chapter
      })),
      confidence: matches[0].similarity,
      topK: matches.length
    };
    
  } catch (error) {
    console.error('❌ RAG Query Stream failed:', error);
    const errorMsg = "Sorry, I had trouble answering that question. Can you try again? 😊";
    if (onChunk) onChunk(errorMsg);
    return {
      success: false,
      answer: errorMsg,
      error: error.message,
      matches: [],
      confidence: 0
    };
  }
}

/**
 * Adjust topK based on confidence score
 * If first match is very confident, return fewer results
 * If uncertain, return more results for better context
 * @param {string} question - The user's question
 * @param {object} db - The embeddings database
 * @returns {Promise<object>} - Answer with metadata
 */
export async function ragQueryAdaptive(question, db) {
  try {
    // First, do a quick search to check confidence
    const queryEmbedding = await embed(question);
    const topMatch = findNearest(db, queryEmbedding, 1)[0];
    
    // Adjust topK based on confidence
    let topK;
    if (topMatch.similarity > 0.8) {
      topK = 1; // Very confident - use single best match
    } else if (topMatch.similarity > 0.6) {
      topK = 2; // Moderate confidence - use 2 matches
    } else {
      topK = 3; // Lower confidence - use more context
    }
    
    console.log(`📊 Adaptive RAG: Using topK=${topK} (confidence: ${(topMatch.similarity * 100).toFixed(1)}%)`);
    
    return await ragQuery(question, db, topK);
    
  } catch (error) {
    // Fallback to standard query
    return await ragQuery(question, db, 2);
  }
}

// Export individual functions for flexibility
export { embed, findNearest, buildContext, createPrompt };
