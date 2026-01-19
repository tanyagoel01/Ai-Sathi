/**
 * Example usage of RAG service
 * Shows how to integrate RAG into your application
 */

import { ragQuery, ragQueryStream, ragQueryAdaptive } from '../services/rag.js';
import embeddingsDb from '../embeddings/db.json' assert { type: 'json' };

// ============================================================================
// EXAMPLE 1: Basic RAG Query
// ============================================================================

async function example1_BasicQuery() {
  console.log('\n📝 EXAMPLE 1: Basic RAG Query\n');
  
  const question = "What is zero?";
  console.log(`Student asks: "${question}"\n`);
  
  const result = await ragQuery(question, embeddingsDb);
  
  if (result.success) {
    console.log('✅ Answer generated!\n');
    console.log('ANSWER:');
    console.log(result.answer);
    console.log('\n📊 METADATA:');
    console.log(`- Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`- Used ${result.topK} context chunks`);
    console.log(`- Top source: "${result.matches[0].title}"`);
  } else {
    console.log('❌ Failed:', result.answer);
  }
}

// ============================================================================
// EXAMPLE 2: Streaming RAG Query (for real-time UI)
// ============================================================================

async function example2_StreamingQuery() {
  console.log('\n📝 EXAMPLE 2: Streaming RAG Query\n');
  
  const question = "How do I add two numbers?";
  console.log(`Student asks: "${question}"\n`);
  console.log('AI response (streaming):');
  console.log('─'.repeat(50));
  
  // Callback to handle each chunk
  const onChunk = (chunk) => {
    process.stdout.write(chunk); // Print without newline
  };
  
  const result = await ragQueryStream(question, embeddingsDb, onChunk);
  
  console.log('\n' + '─'.repeat(50));
  console.log(`\n✅ Streaming complete! (${result.answer.length} chars)`);
}

// ============================================================================
// EXAMPLE 3: Adaptive RAG (automatically adjusts context amount)
// ============================================================================

async function example3_AdaptiveQuery() {
  console.log('\n📝 EXAMPLE 3: Adaptive RAG Query\n');
  
  const questions = [
    "What is 2 + 2?",           // High confidence - will use 1 chunk
    "Tell me about shapes",     // Medium confidence - will use 2 chunks
    "How do patterns work?"     // Lower confidence - will use 3 chunks
  ];
  
  for (const question of questions) {
    console.log(`\nStudent asks: "${question}"`);
    
    const result = await ragQueryAdaptive(question, embeddingsDb);
    
    console.log(`→ Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`→ Used ${result.topK} context chunks`);
    console.log(`→ Answer preview: ${result.answer.substring(0, 100)}...`);
  }
}

// ============================================================================
// EXAMPLE 4: React Component Integration
// ============================================================================

/**
 * Example React hook for using RAG in your app
 * 
 * Usage:
 * const { answer, loading, error, askQuestion } = useMathTutor();
 * 
 * askQuestion("What is addition?");
 */
function exampleReactIntegration() {
  const code = `
import { useState } from 'react';
import { ragQuery } from './math-tutor/services/rag.js';
import embeddingsDb from './math-tutor/embeddings/db.json';

export function useMathTutor() {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const askQuestion = async (question) => {
    setLoading(true);
    setError(null);
    setAnswer('');

    try {
      const result = await ragQuery(question, embeddingsDb);
      
      if (result.success) {
        setAnswer(result.answer);
        setMetadata({
          confidence: result.confidence,
          sources: result.matches
        });
      } else {
        setError(result.answer);
      }
    } catch (err) {
      setError('Failed to get answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { answer, loading, error, metadata, askQuestion };
}

// In your component:
function MathChat() {
  const { answer, loading, askQuestion } = useMathTutor();
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    askQuestion(input);
    setInput('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a math question..."
        />
        <button type="submit">Ask</button>
      </form>
      
      {loading && <p>Thinking... 🤔</p>}
      {answer && <div className="answer">{answer}</div>}
    </div>
  );
}
`;
  
  console.log('\n📝 EXAMPLE 4: React Integration\n');
  console.log(code);
}

// ============================================================================
// EXAMPLE 5: Testing Multiple Questions
// ============================================================================

async function example5_MultipleQuestions() {
  console.log('\n📝 EXAMPLE 5: Testing Multiple Questions\n');
  
  const testQuestions = [
    "What is addition?",
    "संख्या क्या है?",  // Hindi: What is a number?
    "How many fingers do I have?",
    "What is a pattern?",
    "How do I measure things?"
  ];
  
  console.log('Testing RAG with various questions...\n');
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`[${i + 1}/${testQuestions.length}] "${question}"`);
    
    const result = await ragQuery(question, embeddingsDb, 1);
    
    if (result.success) {
      console.log(`   ✅ ${(result.confidence * 100).toFixed(0)}% confident`);
      console.log(`   📚 Source: ${result.matches[0].title}`);
    } else {
      console.log(`   ❌ No match found`);
    }
    console.log('');
  }
}

// ============================================================================
// Run Examples
// ============================================================================

async function runAllExamples() {
  console.log('\n🎓 RAG SERVICE EXAMPLES');
  console.log('='.repeat(70));
  
  // Uncomment the examples you want to run:
  
  await example1_BasicQuery();
  // await example2_StreamingQuery();
  // await example3_AdaptiveQuery();
  // exampleReactIntegration();
  // await example5_MultipleQuestions();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Examples complete!\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}

export { 
  example1_BasicQuery,
  example2_StreamingQuery,
  example3_AdaptiveQuery,
  exampleReactIntegration,
  example5_MultipleQuestions
};
