/**
 * Example: How to use embeddings for semantic search
 * This demonstrates the practical usage of the embedding system
 */

import { embedText, cosineSimilarity } from '../services/embed.js';

/**
 * Search for relevant content based on a user query
 * @param {string} query - User's question or search term
 * @param {object} embeddingsDb - The loaded embeddings database
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} - Top matching results with similarity scores
 */
export async function semanticSearch(query, embeddingsDb, topK = 5) {
  // Generate embedding for the user's query
  const queryEmbedding = await embedText(query);
  
  // Calculate similarity with all entries
  const results = embeddingsDb.embeddings.map(item => ({
    ...item,
    similarity: cosineSimilarity(queryEmbedding, item.embedding)
  }));
  
  // Sort by similarity (highest first) and return top K
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Find the most relevant chapter for a given topic
 * @param {string} topic - Topic or question
 * @param {object} embeddingsDb - The loaded embeddings database
 * @returns {Promise<object>} - Most relevant chapter
 */
export async function findRelevantChapter(topic, embeddingsDb) {
  const results = await semanticSearch(topic, embeddingsDb, 10);
  
  // Filter for chapter-type entries only
  const chapters = results.filter(r => r.type === 'chapter');
  
  return chapters[0]; // Return the top matching chapter
}

/**
 * Find similar questions to help with learning
 * @param {string} question - User's question
 * @param {object} embeddingsDb - The loaded embeddings database
 * @returns {Promise<Array>} - Similar questions from the database
 */
export async function findSimilarQuestions(question, embeddingsDb) {
  const results = await semanticSearch(question, embeddingsDb, 10);
  
  // Filter for question-type entries only
  const questions = results.filter(r => r.type === 'question');
  
  return questions.slice(0, 5);
}

/**
 * Get context for answering a student's question
 * This combines chapter context with relevant examples
 * @param {string} studentQuestion - What the student is asking
 * @param {object} embeddingsDb - The loaded embeddings database
 * @returns {Promise<object>} - Context for generating an answer
 */
export async function getAnswerContext(studentQuestion, embeddingsDb) {
  // Get top matches
  const results = await semanticSearch(studentQuestion, embeddingsDb, 10);
  
  // Get the best matching chapter
  const chapter = results.find(r => r.type === 'chapter');
  
  // Get relevant questions
  const relatedQuestions = results
    .filter(r => r.type === 'question')
    .slice(0, 3);
  
  return {
    chapter: chapter ? {
      title: chapter.chapter,
      summary: chapter.summary,
      englishExpl: chapter.englishExpl,
      hindiExpl: chapter.hindiExpl,
      examples: chapter.examples,
      similarity: chapter.similarity
    } : null,
    relatedQuestions: relatedQuestions.map(q => ({
      question: q.question,
      answer: q.answer,
      chapter: q.chapter,
      similarity: q.similarity
    })),
    confidence: results[0]?.similarity || 0
  };
}

// Example usage (commented out - use in your actual app)
/*
import embeddingsDb from '../embeddings/db.json';

// Example 1: Semantic Search
const results = await semanticSearch(
  "How do I add numbers?", 
  embeddingsDb, 
  3
);
console.log('Top 3 results:', results);

// Example 2: Find relevant chapter
const chapter = await findRelevantChapter(
  "What is zero?",
  embeddingsDb
);
console.log('Relevant chapter:', chapter.chapter);

// Example 3: Get context for answering
const context = await getAnswerContext(
  "How many fingers do I have?",
  embeddingsDb
);
console.log('Answer context:', context);

// Example 4: Multilingual search
const hindiResults = await semanticSearch(
  "संख्या क्या है?", // "What is a number?" in Hindi
  embeddingsDb,
  3
);
console.log('Hindi search results:', hindiResults);
*/
