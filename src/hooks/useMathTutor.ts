/**
 * Custom React hook for RAG-based math tutoring
 * Integrates embeddings search with LLM generation
 */

import { useState, useCallback, useRef } from 'react';

// Import RAG service and embeddings database
// Note: These will be loaded dynamically to avoid bundling issues
let ragQuery: unknown = null;
let ragQueryStream: unknown = null;
let embeddingsDb: unknown = null;
let isGeneratingEmbeddings = false;

// Generate embeddings on the fly
async function generateEmbeddingsOnDemand(onProgress?: (progress: string) => void) {
  if (isGeneratingEmbeddings) {
    throw new Error('Embeddings are already being generated');
  }

  try {
    isGeneratingEmbeddings = true;
    onProgress?.('Loading embedding model...');

    // Import necessary modules
    const embedModule = await import('../math-tutor/services/embed.js');
    const class1Data = await import('../math-tutor/data/class1.json');
    
    const { embedText } = embedModule;
    const chapters = (class1Data as { default: unknown }).default || class1Data;

    onProgress?.('Processing chapters...');

    // Generate embeddings for chapters
    const chapterEmbeddings = [];
    const questionEmbeddings = [];

    for (let i = 0; i < (chapters as Array<{
      chapter: string;
      summary: string;
      englishExpl: string;
      hindiExpl: string;
      examples?: string[];
      questions?: Array<{ q: string; a: string }>;
    }>).length; i++) {
      const chapter = (chapters as Array<{
        chapter: string;
        summary: string;
        englishExpl: string;
        hindiExpl: string;
        examples?: string[];
        questions?: Array<{ q: string; a: string }>;
      }>)[i];
      
      onProgress?.(`Processing chapter ${i + 1}/${(chapters as Array<unknown>).length}: ${chapter.chapter.substring(0, 30)}...`);

      // Create searchable text
      const searchableText = `
        Chapter: ${chapter.chapter}
        Summary: ${chapter.summary}
        English: ${chapter.englishExpl}
        Hindi: ${chapter.hindiExpl}
        Examples: ${chapter.examples?.join(' ') || ''}
      `.trim();

      const embedding = await embedText(searchableText);

      chapterEmbeddings.push({
        id: `chapter_${i + 1}`,
        title: chapter.chapter,
        summary: chapter.summary,
        englishExpl: chapter.englishExpl,
        hindiExpl: chapter.hindiExpl,
        examples: chapter.examples || [],
        embedding
      });

      // Process questions
      if (chapter.questions) {
        for (let j = 0; j < chapter.questions.length; j++) {
          const q = chapter.questions[j];
          const questionText = `Question: ${q.q}\nAnswer: ${q.a}\nChapter: ${chapter.chapter}`;
          const qEmbedding = await embedText(questionText);

          questionEmbeddings.push({
            id: `chapter_${i + 1}_q_${j + 1}`,
            questionText: q.q,
            answer: q.a,
            questionType: 'Practice',
            chapter: chapter.chapter,
            embedding: qEmbedding
          });
        }
      }
    }

    onProgress?.('Embeddings generated successfully!');

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'Xenova/all-MiniLM-L6-v2',
        embeddingDimension: 384,
        totalEntries: chapterEmbeddings.length + questionEmbeddings.length,
        chapters: chapterEmbeddings.length,
        status: 'READY'
      },
      chapters: chapterEmbeddings,
      questions: questionEmbeddings
    };
  } finally {
    isGeneratingEmbeddings = false;
  }
}

// Lazy load the RAG module
async function loadRAGModule(onProgress?: (progress: string) => void) {
  if (!ragQuery || !ragQueryStream) {
    const ragModule = await import('../math-tutor/services/rag.js');
    ragQuery = ragModule.ragQuery;
    ragQueryStream = ragModule.ragQueryStream;
  }
  
  if (!embeddingsDb) {
    try {
      // Try to load the embeddings database
      const dbModule = await import('../math-tutor/embeddings/db.json');
      const db = dbModule.default || dbModule;
      
      // Check if it's a placeholder (needs generation)
      if ((db as { metadata?: { status?: string } }).metadata?.status === 'PLACEHOLDER') {
        onProgress?.('First-time setup: Generating embeddings...');
        embeddingsDb = await generateEmbeddingsOnDemand(onProgress);
      } else {
        embeddingsDb = db;
      }
    } catch (error) {
      console.error('Failed to load embeddings, generating on demand:', error);
      onProgress?.('Generating embeddings...');
      embeddingsDb = await generateEmbeddingsOnDemand(onProgress);
    }
  }
  
  return { ragQuery, ragQueryStream, embeddingsDb };
}

interface RAGResponse {
  success: boolean;
  answer: string;
  matches?: Array<{
    type: string;
    title: string;
    similarity: number;
    chapter: string;
  }>;
  confidence?: number;
  topK?: number;
  error?: string;
}

interface UseMathTutorReturn {
  answer: string;
  loading: boolean;
  error: string | null;
  metadata: {
    confidence: number;
    sources: Array<{ chapter: string }>;
  } | null;
  askQuestion: (question: string) => Promise<void>;
  askQuestionStream: (question: string, onChunk: (chunk: string) => void) => Promise<void>;
  reset: () => void;
  isReady: boolean;
  setupProgress: string | null;
  isSettingUp: boolean;
}

export function useMathTutor(): UseMathTutorReturn {
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    confidence: number;
    sources: Array<{ chapter: string }>;
  } | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [setupProgress, setSetupProgress] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState<boolean>(false);
  const ragModuleRef = useRef<{
    ragQuery: unknown;
    ragQueryStream: unknown;
    embeddingsDb: unknown;
  } | null>(null);

  // Initialize RAG module
  const initializeRAG = useCallback(async () => {
    if (ragModuleRef.current) return ragModuleRef.current;
    
    try {
      setIsSettingUp(true);
      const module = await loadRAGModule((progress) => {
        setSetupProgress(progress);
      });
      ragModuleRef.current = module;
      setIsReady(true);
      setIsSettingUp(false);
      setSetupProgress(null);
      return module;
    } catch (err) {
      console.error('Failed to load RAG module:', err);
      setError('Failed to initialize AI tutor');
      setIsSettingUp(false);
      setSetupProgress(null);
      return null;
    }
  }, []);

  // Ask a question and get complete response
  const askQuestion = useCallback(async (question: string) => {
    setLoading(true);
    setError(null);
    setAnswer('');
    setMetadata(null);

    try {
      const module = await initializeRAG();
      if (!module) {
        throw new Error('RAG module not initialized');
      }

      const { ragQuery, embeddingsDb } = module;

      const result: RAGResponse = await (ragQuery as (q: string, db: unknown) => Promise<RAGResponse>)(question, embeddingsDb);

      if (result.success) {
        setAnswer(result.answer);
        setMetadata({
          confidence: result.confidence || 0,
          sources: result.matches || [],
        });
      } else {
        setError(result.answer || 'Failed to get answer');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error asking question:', error);
      setError(error.message || 'Something went wrong. Please try again!');
    } finally {
      setLoading(false);
    }
  }, [initializeRAG]);

  // Ask a question with streaming response
  const askQuestionStream = useCallback(async (
    question: string,
    onChunk: (chunk: string) => void
  ) => {
    setLoading(true);
    setError(null);
    setAnswer('');
    setMetadata(null);

    try {
      const module = await initializeRAG();
      if (!module) {
        throw new Error('RAG module not initialized');
      }

      const { ragQueryStream, embeddingsDb } = module;

      const result: RAGResponse = await (ragQueryStream as (q: string, db: unknown, onChunk: (chunk: string) => void) => Promise<RAGResponse>)(
        question,
        embeddingsDb,
        onChunk
      );

      if (result.success) {
        setAnswer(result.answer);
        setMetadata({
          confidence: result.confidence || 0,
          sources: result.matches || [],
        });
      } else {
        setError(result.answer || 'Failed to get answer');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error in streaming question:', error);
      setError(error.message || 'Something went wrong. Please try again!');
    } finally {
      setLoading(false);
    }
  }, [initializeRAG]);

  // Reset state
  const reset = useCallback(() => {
    setAnswer('');
    setLoading(false);
    setError(null);
    setMetadata(null);
  }, []);

  return {
    answer,
    loading,
    error,
    metadata,
    askQuestion,
    askQuestionStream,
    reset,
    isReady,
    setupProgress,
    isSettingUp,
  };
}
