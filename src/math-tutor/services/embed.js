import { pipeline } from '@xenova/transformers';

let embedder = null;

/**
 * Initialize the embedding model
 * Uses all-MiniLM-L6-v2 for generating sentence embeddings
 */
async function loadEmbedder() {
  if (!embedder) {
    console.log('Loading MiniLM embedding model...');
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    console.log('Embedding model loaded successfully');
  }
  return embedder;
}

/**
 * Generate embeddings for the given text
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} - The embedding vector
 */
export async function embedText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Text must be a non-empty string');
  }

  const model = await loadEmbedder();
  
  // Generate embedding
  const output = await model(text, {
    pooling: 'mean',
    normalize: true,
  });

  // Convert to regular array
  const embedding = Array.from(output.data);
  
  return embedding;
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function embedTexts(texts) {
  if (!Array.isArray(texts)) {
    throw new Error('Texts must be an array');
  }

  const embeddings = await Promise.all(
    texts.map(text => embedText(text))
  );

  return embeddings;
}

/**
 * Calculate cosine similarity between two embedding vectors
 * @param {number[]} embedding1 - First embedding vector
 * @param {number[]} embedding2 - Second embedding vector
 * @returns {number} - Similarity score between 0 and 1
 */
export function cosineSimilarity(embedding1, embedding2) {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
