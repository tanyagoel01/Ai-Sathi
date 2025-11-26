# Math Tutor Embeddings

## Why Are Embeddings Needed?

Embeddings are crucial for creating an intelligent, context-aware math tutoring system. Here's why:

### 1. **Semantic Search**
Traditional keyword search looks for exact word matches. If a student asks "how to count to ten", it won't match content about "numbers 1 to 10" unless both use identical words.

**Embeddings solve this** by converting text into numerical vectors that capture *meaning*. Similar concepts have similar vectors, even with different words:
- "How do I count?" → matches "Numbers 1 to 9" chapter
- "What time is morning?" → matches "Time" chapter
- "Tell me about money" → matches "Money" chapter

### 2. **Context-Aware Question Answering**
When a student asks a question, the system can:
1. Convert the question to an embedding
2. Find the most similar embeddings in the database
3. Retrieve relevant chapters/questions/explanations
4. Generate a contextual answer using that content

### 3. **Multilingual Support**
The MiniLM model understands semantic relationships across languages, helping match:
- Hindi questions → English content
- English questions → Hindi explanations
- Mixed language queries → appropriate responses

### 4. **Better Learning Experience**
Instead of rigid menu navigation, students can:
- Ask questions naturally ("How do I add numbers?")
- Get relevant examples automatically
- Receive explanations in their preferred language
- See related concepts and questions

## How the Embedding System Works

```
Student Question → Embed → Compare with DB → Find Top Matches → Generate Answer
     ↓                          ↓
 "What is zero?"         [0.23, -0.41, ...]
                              ↓
                    Cosine Similarity Search
                              ↓
                    "Making 10 (Numbers 10-20)"
                    Chapter explains zero concept
                              ↓
                    AI generates contextual response
```

## Structure

```
math-tutor/
├── data/
│   └── class1.json          # Source content
├── embeddings/
│   └── db.json              # Generated embeddings database
├── scripts/
│   └── generateEmbeddings.js # This script
└── services/
    └── embed.js             # Runtime embedding functions
```

## Usage

### Generate Embeddings (One-time setup)

```bash
# From the project root
cd src/math-tutor/scripts
node generateEmbeddings.js
```

This will:
1. Load all chapters from `class1.json`
2. Generate embeddings for each chapter and question
3. Save to `embeddings/db.json`

**Note:** This is a one-time process. Run it again only when content changes.

### Runtime Usage (In your app)

```javascript
import { embedText, cosineSimilarity } from '../services/embed.js';
import embeddingsDb from '../embeddings/db.json';

// 1. User asks a question
const userQuestion = "How do I add two numbers?";

// 2. Generate embedding for the question
const questionEmbedding = await embedText(userQuestion);

// 3. Find most similar content
const results = embeddingsDb.embeddings.map(item => ({
  ...item,
  similarity: cosineSimilarity(questionEmbedding, item.embedding)
}));

// 4. Sort by similarity and get top results
const topResults = results
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 3);

// 5. Use top results to answer the question
console.log('Most relevant:', topResults[0].chapter);
```

## Database Schema

The generated `db.json` contains:

```json
{
  "metadata": {
    "generatedAt": "ISO timestamp",
    "model": "Xenova/all-MiniLM-L6-v2",
    "embeddingDimension": 384,
    "totalEntries": 500+,
    "chapters": 14
  },
  "embeddings": [
    {
      "id": "chapter_1",
      "type": "chapter",
      "chapterIndex": 0,
      "chapter": "Chapter title",
      "summary": "...",
      "englishExpl": "...",
      "hindiExpl": "...",
      "embedding": [0.23, -0.41, ...], // 384-dimensional vector
      "searchableText": "..."
    },
    {
      "id": "chapter_1_q_1",
      "type": "question",
      "chapterIndex": 0,
      "chapter": "Chapter title",
      "question": "...",
      "answer": "...",
      "embedding": [...],
      "searchableText": "..."
    }
  ]
}
```

## Technical Details

- **Model:** all-MiniLM-L6-v2 (384-dimensional embeddings)
- **Similarity Metric:** Cosine similarity (0 to 1, higher = more similar)
- **Performance:** ~0.5s per embedding on CPU
- **Database Size:** ~10-20 MB for Class 1 content

## Future Enhancements

1. Add embeddings for other classes (2-5)
2. Create subject-specific embeddings (Math, Science, Language)
3. Add visual content embeddings (diagrams, charts)
4. Implement caching for frequently asked questions
5. Add feedback loop to improve relevance over time
