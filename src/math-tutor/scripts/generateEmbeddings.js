/**
 * Script to generate embeddings for Class 1 math content
 * 
 * This script processes the class1.json data and creates embeddings for semantic search.
 * Run this script using Node.js to generate the embeddings database.
 * 
 * Usage: node generateEmbeddings.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pipeline } from '@xenova/transformers';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const dataPath = join(__dirname, '../data/class1.json');
const outputDir = join(__dirname, '../embeddings');
const outputPath = join(outputDir, 'db.json');

/**
 * Load and initialize the embedding model
 */
async function loadEmbedder() {
  console.log('Loading MiniLM embedding model...');
  const embedder = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  );
  console.log('✓ Model loaded successfully\n');
  return embedder;
}

/**
 * Generate embedding for a single text
 */
async function generateEmbedding(embedder, text) {
  const output = await embedder(text, {
    pooling: 'mean',
    normalize: true,
  });
  return Array.from(output.data);
}

/**
 * Create searchable text from chapter data
 */
function createSearchableText(chapter) {
  const parts = [
    `Chapter: ${chapter.chapter}`,
    `Summary: ${chapter.summary}`,
    `English Explanation: ${chapter.englishExpl}`,
    `Hindi Explanation: ${chapter.hindiExpl}`,
  ];
  
  // Add examples
  if (chapter.examples && chapter.examples.length > 0) {
    parts.push(`Examples: ${chapter.examples.join(' ')}`);
  }
  
  return parts.join('\n');
}

/**
 * Main function to generate embeddings
 */
async function generateEmbeddings() {
  try {
    console.log('=== Math Content Embedding Generator ===\n');
    
    // Load the class1.json data
    console.log('Loading class1.json...');
    const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
    console.log(`✓ Loaded ${data.length} chapters\n`);
    
    // Load the embedding model
    const embedder = await loadEmbedder();
    
    // Generate embeddings for each chapter
    console.log('Generating embeddings...');
    const embeddingsDb = [];
    
    for (let i = 0; i < data.length; i++) {
      const chapter = data[i];
      const chapterNum = i + 1;
      
      console.log(`[${chapterNum}/${data.length}] Processing: ${chapter.chapter}`);
      
      // Create searchable text combining multiple fields
      const searchableText = createSearchableText(chapter);
      
      // Generate embedding for the chapter overview
      const chapterEmbedding = await generateEmbedding(embedder, searchableText);
      
      // Store chapter with embedding
      embeddingsDb.push({
        id: `chapter_${chapterNum}`,
        type: 'chapter',
        chapterIndex: i,
        chapter: chapter.chapter,
        summary: chapter.summary,
        englishExpl: chapter.englishExpl,
        hindiExpl: chapter.hindiExpl,
        examples: chapter.examples,
        misconceptions: chapter.misconceptions,
        embedding: chapterEmbedding,
        searchableText: searchableText.substring(0, 200) + '...' // Store preview
      });
      
      // Also create embeddings for individual questions
      if (chapter.questions && chapter.questions.length > 0) {
        console.log(`  → Processing ${chapter.questions.length} questions...`);
        
        for (let j = 0; j < chapter.questions.length; j++) {
          const question = chapter.questions[j];
          const questionText = `Question: ${question.q}\nAnswer: ${question.a}\nChapter: ${chapter.chapter}`;
          const questionEmbedding = await generateEmbedding(embedder, questionText);
          
          embeddingsDb.push({
            id: `chapter_${chapterNum}_q_${j + 1}`,
            type: 'question',
            chapterIndex: i,
            chapter: chapter.chapter,
            question: question.q,
            answer: question.a,
            embedding: questionEmbedding,
            searchableText: questionText
          });
        }
      }
      
      console.log(`  ✓ Completed chapter ${chapterNum}\n`);
    }
    
    // Create output directory if it doesn't exist
    mkdirSync(outputDir, { recursive: true });
    
    // Save embeddings database
    console.log('Saving embeddings database...');
    const dbContent = {
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'Xenova/all-MiniLM-L6-v2',
        embeddingDimension: embeddingsDb[0].embedding.length,
        totalEntries: embeddingsDb.length,
        chapters: data.length
      },
      embeddings: embeddingsDb
    };
    
    writeFileSync(outputPath, JSON.stringify(dbContent, null, 2), 'utf-8');
    console.log(`✓ Saved to ${outputPath}\n`);
    
    // Print summary
    console.log('=== Summary ===');
    console.log(`Total chapters: ${data.length}`);
    console.log(`Total embeddings: ${embeddingsDb.length}`);
    console.log(`Embedding dimension: ${embeddingsDb[0].embedding.length}`);
    console.log(`Database size: ${(JSON.stringify(dbContent).length / 1024 / 1024).toFixed(2)} MB`);
    console.log('\n✓ Embedding generation complete!');
    
  } catch (error) {
    console.error('Error generating embeddings:', error);
    process.exit(1);
  }
}

// Run the script
generateEmbeddings();
