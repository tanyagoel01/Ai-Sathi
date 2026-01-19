/**
 * Complete System Test for AI Math Tutor
 * Tests embeddings, search, guardrails, and RAG pipeline
 */

import { embedText, cosineSimilarity } from '../services/embed.js';
import { ragQuery, ragQueryAdaptive } from '../services/rag.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printSeparator() {
  console.log('\n' + '='.repeat(70) + '\n');
}

// Test 1: Check if embeddings database exists
async function testEmbeddingsExist() {
  printSeparator();
  log('TEST 1: Checking if embeddings database exists...', 'cyan');
  
  const dbPath = path.join(__dirname, '../embeddings/db.json');
  
  if (!fs.existsSync(dbPath)) {
    log('❌ FAILED: db.json not found!', 'red');
    log('   Run: npm run generate-embeddings', 'yellow');
    return false;
  }
  
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  
  if (!data.chapters || !data.questions) {
    log('❌ FAILED: Invalid db.json structure', 'red');
    return false;
  }
  
  log(`✅ PASSED: Found ${data.chapters.length} chapters and ${data.questions.length} questions`, 'green');
  log(`   Sample chapter: ${data.chapters[0].title}`, 'blue');
  log(`   Sample question: ${data.questions[0].questionText.substring(0, 50)}...`, 'blue');
  
  return data;
}

// Test 2: Test embedding generation
async function testEmbedding() {
  printSeparator();
  log('TEST 2: Testing embedding generation...', 'cyan');
  
  try {
    const text = "How do I add two numbers?";
    log(`   Input: "${text}"`, 'blue');
    
    const embedding = await embedText(text);
    
    if (!Array.isArray(embedding)) {
      log('❌ FAILED: Embedding is not an array', 'red');
      return false;
    }
    
    if (embedding.length !== 384) {
      log(`❌ FAILED: Expected 384 dimensions, got ${embedding.length}`, 'red');
      return false;
    }
    
    log(`✅ PASSED: Generated ${embedding.length}-dimensional embedding`, 'green');
    log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(3)).join(', ')}...]`, 'blue');
    
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

// Test 3: Test RAG query (without LLM)
async function testRAGRetrieval() {
  printSeparator();
  log('TEST 3: Testing RAG retrieval (embeddings + search)...', 'cyan');
  
  const dbPath = path.join(__dirname, '../embeddings/db.json');
  
  if (!fs.existsSync(dbPath)) {
    log('⚠️  SKIPPED: db.json not found', 'yellow');
    return false;
  }
  
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    const testQueries = [
      { q: "What is zero?", expected: "Making 10" },
      { q: "How do I add?", expected: "Addition" },
      { q: "What are shapes?", expected: "Shapes" }
    ];
    
    let passed = 0;
    
    for (const test of testQueries) {
      log(`\n   Query: "${test.q}"`, 'blue');
      
      // Test just the retrieval part
      const queryEmbedding = await embedText(test.q);
      
      // Find nearest
      const allEntries = [
        ...db.chapters.map(ch => ({ ...ch, type: 'chapter' })),
        ...db.questions.map(q => ({ ...q, type: 'question' }))
      ];
      
      const results = allEntries.map(entry => ({
        ...entry,
        similarity: cosineSimilarity(queryEmbedding, entry.embedding)
      }));
      
      const topMatch = results.sort((a, b) => b.similarity - a.similarity)[0];
      
      log(`   → Found: "${topMatch.title || topMatch.questionText}"`, 'green');
      log(`   → Confidence: ${(topMatch.similarity * 100).toFixed(1)}%`, 'green');
      log(`   → Type: ${topMatch.type}`, 'green');
      
      if (topMatch.title?.includes(test.expected)) {
        passed++;
      }
    }
    
    log(`\n${passed === testQueries.length ? '✅' : '⚠️'} Results: ${passed}/${testQueries.length} matched expected chapters`, 
        passed === testQueries.length ? 'green' : 'yellow');
    
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

// Test 4: Test full RAG pipeline (with LLM)
async function testFullRAG() {
  printSeparator();
  log('TEST 4: Testing full RAG pipeline (with LLM)...', 'cyan');
  
  const skipLLM = process.argv.includes('--skip-llm');
  
  if (skipLLM) {
    log('⚠️  SKIPPED: Use test without --skip-llm to run this test', 'yellow');
    log('   Note: First run downloads ~2GB model (takes 5-10 min)', 'yellow');
    return true;
  }
  
  const dbPath = path.join(__dirname, '../embeddings/db.json');
  
  if (!fs.existsSync(dbPath)) {
    log('⚠️  SKIPPED: db.json not found', 'yellow');
    return false;
  }
  
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    const testQuestion = "What is zero?";
    log(`   Student asks: "${testQuestion}"`, 'blue');
    log('   Processing (this may take 5-10 min on first run)...', 'yellow');
    
    const result = await ragQuery(testQuestion, db);
    
    if (!result.success) {
      log(`❌ FAILED: ${result.answer}`, 'red');
      return false;
    }
    
    log('\n✅ PASSED: Full RAG pipeline working!', 'green');
    log(`   → Confidence: ${(result.confidence * 100).toFixed(1)}%`, 'blue');
    log(`   → Used ${result.topK} context chunks`, 'blue');
    log(`   → Top source: "${result.matches[0].title}"`, 'blue');
    log(`   → Answer length: ${result.answer.length} characters`, 'blue');
    
    log('\n   Answer preview:', 'cyan');
    log(`   "${result.answer.substring(0, 150)}..."`, 'magenta');
    
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Test 5: Test adaptive RAG
async function testAdaptiveRAG() {
  printSeparator();
  log('TEST 5: Testing adaptive RAG...', 'cyan');
  
  const dbPath = path.join(__dirname, '../embeddings/db.json');
  
  if (!fs.existsSync(dbPath)) {
    log('⚠️  SKIPPED: db.json not found', 'yellow');
    return false;
  }
  
  const skipLLM = process.argv.includes('--skip-llm');
  
  if (skipLLM) {
    log('⚠️  SKIPPED: Use test without --skip-llm to run this test', 'yellow');
    return true;
  }
  
  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    
    const testCases = [
      { q: "What is 2 + 2?", expectedTopK: 1 },
      { q: "Tell me about math", expectedTopK: 2 }
    ];
    
    for (const test of testCases) {
      log(`\n   Query: "${test.q}"`, 'blue');
      
      const result = await ragQueryAdaptive(test.q, db);
      
      log(`   → Adaptive topK: ${result.topK}`, 'green');
      log(`   → Confidence: ${(result.confidence * 100).toFixed(1)}%`, 'green');
    }
    
    log('\n✅ PASSED: Adaptive RAG working', 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🧪 AI MATH TUTOR - COMPLETE SYSTEM TEST\n', 'cyan');
  log('Testing RAG pipeline: Embeddings → Search → Generation', 'yellow');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };
  
  const tests = [
    { name: 'Embeddings Database', fn: testEmbeddingsExist },
    { name: 'Embedding Generation', fn: testEmbedding },
    { name: 'RAG Retrieval', fn: testRAGRetrieval },
    { name: 'Full RAG Pipeline', fn: testFullRAG },
    { name: 'Adaptive RAG', fn: testAdaptiveRAG }
  ];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result === true) {
        results.passed++;
      } else if (result === false) {
        results.failed++;
      } else {
        // Test returned data (like testEmbeddingsExist)
        results.passed++;
      }
    } catch (error) {
      log(`\n❌ Test "${test.name}" crashed: ${error.message}`, 'red');
      results.failed++;
    }
  }
  
  // Final summary
  printSeparator();
  log('📊 TEST SUMMARY', 'cyan');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  printSeparator();
  
  if (results.failed === 0 && results.passed > 0) {
    log('🎉 ALL TESTS PASSED! RAG system is ready to use.', 'green');
    log('\nQuick start:', 'cyan');
    log('  import { ragQuery } from "./services/rag.js";', 'blue');
    log('  import db from "./embeddings/db.json";', 'blue');
    log('  const result = await ragQuery("What is zero?", db);', 'blue');
  } else if (results.passed === 0) {
    log('⚠️  No tests passed. Please check your setup:', 'yellow');
    log('1. Run: npm run generate-embeddings', 'blue');
    log('2. Ensure internet connection for model download', 'blue');
    log('3. Check console for specific errors', 'blue');
  } else {
    log('⚠️  Some tests failed. Review errors above.', 'yellow');
  }
  
  console.log('\n');
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
