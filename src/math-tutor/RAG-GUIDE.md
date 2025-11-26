# RAG System - Quick Reference

## What is RAG?

**RAG (Retrieval-Augmented Generation)** combines:
1. **Retrieval** - Finding relevant content from your curriculum
2. **Generation** - Using AI to create age-appropriate answers

This ensures answers are:
- ✅ Accurate (based on actual curriculum)
- ✅ Age-appropriate (Class 1 level)
- ✅ Contextual (uses real examples from textbook)

## Basic Usage

```javascript
import { ragQuery } from './services/rag.js';
import db from './embeddings/db.json';

// Ask a question
const result = await ragQuery("What is zero?", db);

console.log(result.answer);
// "Zero means nothing! 🌟 It's a special number..."

console.log(result.confidence); 
// 0.87 (87% match confidence)

console.log(result.matches[0].title);
// "Making 10 (Numbers 10 to 20)"
```

## API Reference

### `ragQuery(question, db, topK = 2)`

Complete RAG pipeline: retrieval + generation

**Parameters:**
- `question` (string) - Student's question
- `db` (object) - Embeddings database
- `topK` (number) - How many context chunks to use (default: 2)

**Returns:**
```javascript
{
  success: true,
  answer: "AI-generated answer...",
  matches: [
    {
      type: "chapter",
      title: "Chapter name",
      similarity: 0.87,
      chapter: "Chapter name"
    }
  ],
  confidence: 0.87,
  topK: 2
}
```

### `ragQueryStream(question, db, onChunk, topK = 2)`

Streaming version for real-time display

**Example:**
```javascript
await ragQueryStream(
  "What is addition?",
  db,
  (chunk) => {
    // Update UI with each chunk
    console.log(chunk);
  },
  2
);
```

### `ragQueryAdaptive(question, db)`

Automatically adjusts context amount based on confidence

**Logic:**
- High confidence (>80%) → Use 1 chunk
- Medium confidence (60-80%) → Use 2 chunks  
- Lower confidence (<60%) → Use 3 chunks

## RAG Pipeline Flow

```
User Question
     ↓
1. embed(question) → [0.12, -0.45, ...] (384D vector)
     ↓
2. findNearest(db, embedding) → Top 2 matches
     ↓
3. buildContext(matches) → Formatted text with:
   - Chapter summary
   - English & Hindi explanations
   - Examples
   - Practice questions
     ↓
4. createPrompt(question, context) → System + User prompts
     ↓
5. generateResponse(prompts) → LLM generates answer
     ↓
Final Answer (age-appropriate, curriculum-based)
```

## Prompt Template

The system uses this prompt structure:

```
SYSTEM:
You are a friendly Class 1 Math teacher.
Use simple language for 6-7 year olds.
Keep tone encouraging. Use emojis.
ALWAYS base answers on provided context.
Keep responses short (2-3 paragraphs).

CONTEXT:
[Retrieved from curriculum]
Chapter: Making 10
Summary: Introduces zero and number pairs...
Examples: 1. Zero means nothing...

QUESTION:
What is zero?

ANSWER:
[LLM generates response]
```

## Integration Examples

### React Hook

```javascript
import { useState } from 'react';
import { ragQuery } from './math-tutor/services/rag.js';
import db from './math-tutor/embeddings/db.json';

export function useMathTutor() {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (question) => {
    setLoading(true);
    const result = await ragQuery(question, db);
    setAnswer(result.answer);
    setLoading(false);
  };

  return { answer, loading, ask };
}

// Usage in component
function ChatUI() {
  const { answer, loading, ask } = useMathTutor();
  
  return (
    <div>
      <button onClick={() => ask("What is zero?")}>
        Ask Question
      </button>
      {loading ? <p>Thinking...</p> : <p>{answer}</p>}
    </div>
  );
}
```

### Express API Endpoint

```javascript
import express from 'express';
import { ragQuery } from './math-tutor/services/rag.js';
import db from './math-tutor/embeddings/db.json';

const app = express();
app.use(express.json());

app.post('/api/math/ask', async (req, res) => {
  const { question } = req.body;
  
  try {
    const result = await ragQuery(question, db);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

## Configuration

### Adjust Context Amount

```javascript
// Use more context for complex questions
await ragQuery(question, db, 3);  // Use 3 chunks instead of 2

// Use less for simple questions
await ragQuery(question, db, 1);  // Just 1 chunk
```

### Custom Prompt

Modify `createPrompt()` in `rag.js`:

```javascript
const systemPrompt = `You are a Class 1 Math teacher.
[Your custom instructions here]`;
```

### Temperature (in model.js)

```javascript
// In model.js, generateResponse():
const reply = await model.chat.completions.create({
  messages: messages,
  temperature: 0.7,  // Adjust: 0.0 = deterministic, 1.0 = creative
  max_tokens: 512,
});
```

## Performance Tips

### 1. Preload Database
```javascript
// Load once at startup
const db = await import('./embeddings/db.json');

// Reuse for all queries
await ragQuery(q1, db);
await ragQuery(q2, db);
```

### 2. Cache Embeddings
```javascript
const embeddingCache = new Map();

async function cachedEmbed(text) {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text);
  }
  const embedding = await embedText(text);
  embeddingCache.set(text, embedding);
  return embedding;
}
```

### 3. Parallel Loading
```javascript
// Load model and database in parallel
const [model, db] = await Promise.all([
  initializeModel(),
  import('./embeddings/db.json')
]);
```

## Troubleshooting

### "Model loading failed"
- Check internet connection
- Try again (HuggingFace can be slow)
- Increase timeout

### "Low confidence scores"
- Generate more embeddings (add content)
- Rephrase question
- Use adaptive RAG

### "Out of memory"
- Close other applications
- Use smaller model (TinyLlama)
- Reduce topK value

### "Slow responses"
- First run downloads model (~2GB)
- Subsequent runs use cache (faster)
- Consider using streaming for better UX

## Testing

```bash
# Quick test (skip LLM)
npm run test:quick

# Full test (include LLM generation)
npm run test:full

# Run examples
node examples/ragExamples.js
```

## Next Steps

1. ✅ Generate embeddings: `npm run generate-embeddings`
2. ✅ Test system: `npm run test:quick`
3. ✅ Integrate into your app
4. 📊 Monitor response quality
5. 🔄 Iterate and improve prompts

## Support

For questions or issues:
1. Check test output for specific errors
2. Review console logs
3. Verify embeddings database exists
4. Ensure models are downloaded
