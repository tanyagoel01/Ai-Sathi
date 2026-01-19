# 🚀 Quick Start: AI Math Tutor

## ⚠️ Important: One-Time Setup Required

Before using the AI Math Tutor features, you need to generate the embeddings database.

### Generate Embeddings (Takes 1-2 minutes)

```bash
cd src/math-tutor
npm run generate-embeddings
```

**What this does:**
- Processes 14 Class 1 math chapters
- Creates embeddings for semantic search
- Generates `/src/math-tutor/embeddings/db.json`

**Expected output:**
```
Loading MiniLM embedding model...
✓ Model loaded successfully

Processing 14 chapters...
[1/14] Processing: Finding the Furry Cat!
[2/14] Processing: What is Long? What is Round?
...
✓ Saved to embeddings/db.json

Total embeddings: 200+
✓ Embedding generation complete!
```

### Test the System (Optional)

```bash
npm run test:quick
```

### Start the App

```bash
cd ../..  # Back to project root
npm run dev
```

## 📍 Where to Find the Features

1. Navigate: **Home → Select Class → Maths**
2. You'll see two new cards:
   - **"Ask AI Tutor"** (Blue) - RAG-powered chat
   - **"Practice Mode"** (Green) - Interactive quiz

## 🔧 Troubleshooting

### "Failed to resolve import db.json"
**Solution:** Run `cd src/math-tutor && npm run generate-embeddings`

### Takes too long
**First run:** Downloads ~200MB model (one-time)
**Subsequent runs:** Uses cached model (~2 minutes)

### Out of memory
Close other applications. Needs ~2GB RAM.

## 📚 Full Documentation

See `/src/math-tutor/INTEGRATION.md` for complete guide.

---

**Once setup is complete, the AI Math Tutor will:**
✅ Answer student questions using curriculum
✅ Provide practice quizzes
✅ Support voice input/output
✅ Show confidence scores and sources
✅ Work offline after first-time model download
