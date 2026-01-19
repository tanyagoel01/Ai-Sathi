/**
 * Small Language Model (SLM) Integration for Math Tutor
 * Uses WebLLM to run Phi-3 Mini locally in the browser
 */

import * as webllm from "@mlc-ai/web-llm";

let engine = null;
let isModelLoaded = false;

// Model configuration - using Phi-3 Mini for better math reasoning
const MODEL_ID = "Phi-3-mini-4k-instruct-q4f16_1-MLC";
// Alternative: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC"

/**
 * Initialize and load the language model
 * This is called automatically on first use
 */
async function loadModel(progressCallback) {
  if (isModelLoaded && engine) {
    return engine;
  }

  console.log('Loading language model...');
  
  // Initialize progress callback
  const initProgressCallback = (progress) => {
    console.log(`Loading: ${progress.text}`);
    if (progressCallback) {
      progressCallback(progress);
    }
  };

  // Create engine with model
  engine = await webllm.CreateMLCEngine(MODEL_ID, {
    initProgressCallback: initProgressCallback,
  });

  isModelLoaded = true;
  console.log('✓ Model loaded successfully');
  
  return engine;
}

/**
 * Guardrail: Check if the question is math-related
 * Returns true if the question is appropriate, false otherwise
 */
function isMathRelated(userPrompt) {
  const mathKeywords = [
    // Numbers and counting
    'number', 'count', 'digit', 'zero', 'one', 'two', 'three', 'four', 'five',
    'six', 'seven', 'eight', 'nine', 'ten', 'twenty', 'hundred',
    
    // Operations
    'add', 'subtract', 'multiply', 'divide', 'plus', 'minus', 'times', 'sum',
    'total', 'difference', 'product', 'altogether', 'left', 'more', 'less',
    
    // Concepts
    'shape', 'round', 'long', 'pattern', 'measurement', 'length', 'height',
    'weight', 'time', 'money', 'rupee', 'coin', 'note', 'morning', 'afternoon',
    'evening', 'night', 'season', 'data', 'group', 'sort',
    
    // Math terms
    'equal', 'compare', 'bigger', 'smaller', 'tallest', 'shortest', 'heavier',
    'lighter', 'capacity', 'before', 'after', 'inside', 'outside',
    
    // Hindi equivalents
    'संख्या', 'गिनती', 'जोड़', 'घटाव', 'गुणा', 'अधिक', 'कम', 'बराबर',
    'आकार', 'गोल', 'लंबा', 'पैटर्न', 'समय', 'पैसा', 'माप'
  ];

  // Convert to lowercase for case-insensitive matching
  const promptLower = userPrompt.toLowerCase();

  // Check if any math keywords are present
  const hasMathKeyword = mathKeywords.some(keyword => 
    promptLower.includes(keyword.toLowerCase())
  );

  // Check for question patterns that are clearly math-related
  const mathPatterns = [
    /\d+/,  // Contains numbers
    /how many/i,
    /how much/i,
    /कितन[ाेी]/i,  // Hindi: how many/much
    /what is \d/i,
    /calculate/i,
  ];

  const hasMathPattern = mathPatterns.some(pattern => 
    pattern.test(userPrompt)
  );

  return hasMathKeyword || hasMathPattern;
}

/**
 * Create a redirect response when question is not math-related
 */
function createRedirectResponse(userPrompt) {
  const redirectMessages = [
    "That's an interesting question! But I'm your math helper, so I can only answer questions about numbers, shapes, counting, addition, subtraction, and other math topics. 🧮\n\nCan you ask me a math question instead? For example:\n- How do I count to 10?\n- What is addition?\n- Can you help me with shapes?",
    
    "I love your curiosity! However, I'm specialized in helping with Class 1 math topics like numbers, counting, addition, subtraction, shapes, patterns, and measurement. 📊\n\nLet's talk about math! What would you like to learn today?",
    
    "That's a great question for someone else! I'm here to help you become a math champion! 🌟\n\nI can help you with:\n- Numbers and counting\n- Addition and subtraction\n- Shapes and patterns\n- Time and money\n- Measurement\n\nWhat math topic interests you?"
  ];

  // Randomly select a redirect message
  const message = redirectMessages[Math.floor(Math.random() * redirectMessages.length)];
  
  return message;
}

/**
 * Generate a response from the language model
 * @param {string} systemPrompt - Instructions for the AI's behavior
 * @param {string} userPrompt - The user's question
 * @param {string} contextText - Relevant context from embeddings (optional)
 * @returns {Promise<string>} - The AI's response
 */
export async function generateResponse(systemPrompt, userPrompt, contextText = '') {
  // GUARDRAIL: Check if question is math-related
  if (!isMathRelated(userPrompt)) {
    console.log('🛡️ Guardrail triggered: Non-math question detected');
    return createRedirectResponse(userPrompt);
  }

  try {
    // Load model if not already loaded
    const model = await loadModel();

    // Construct the full prompt
    let fullPrompt = systemPrompt + '\n\n';
    
    if (contextText && contextText.trim()) {
      fullPrompt += `CONTEXT (from curriculum):\n${contextText}\n\n`;
    }
    
    fullPrompt += `STUDENT QUESTION:\n${userPrompt}\n\n`;
    fullPrompt += `YOUR RESPONSE:`;

    // Generate response
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: contextText ? `Context: ${contextText}\n\nQuestion: ${userPrompt}` : userPrompt
      }
    ];

    const reply = await model.chat.completions.create({
      messages: messages,
      temperature: 0.7,
      max_tokens: 512,
    });

    const response = reply.choices[0].message.content;
    
    return response;

  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
}

/**
 * Generate a response with streaming (for real-time display)
 * @param {string} systemPrompt - Instructions for the AI's behavior
 * @param {string} userPrompt - The user's question
 * @param {string} contextText - Relevant context from embeddings
 * @param {Function} onChunk - Callback for each chunk of text
 * @returns {Promise<string>} - The complete response
 */
export async function generateResponseStream(systemPrompt, userPrompt, contextText = '', onChunk) {
  // GUARDRAIL: Check if question is math-related
  if (!isMathRelated(userPrompt)) {
    console.log('🛡️ Guardrail triggered: Non-math question detected');
    const redirectMsg = createRedirectResponse(userPrompt);
    if (onChunk) onChunk(redirectMsg);
    return redirectMsg;
  }

  try {
    // Load model if not already loaded
    const model = await loadModel();

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: contextText ? `Context: ${contextText}\n\nQuestion: ${userPrompt}` : userPrompt
      }
    ];

    const completion = await model.chat.completions.create({
      messages: messages,
      temperature: 0.7,
      max_tokens: 512,
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
      if (onChunk) {
        onChunk(content);
      }
    }

    return fullResponse;

  } catch (error) {
    console.error('Error generating streaming response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
}

/**
 * Check if the model is currently loaded
 * @returns {boolean}
 */
export function isLoaded() {
  return isModelLoaded && engine !== null;
}

/**
 * Get model loading progress
 * @param {Function} callback - Progress callback
 * @returns {Promise<void>}
 */
export async function initializeModel(callback) {
  if (!isModelLoaded) {
    await loadModel(callback);
  }
}

/**
 * Unload the model to free up memory
 */
export async function unloadModel() {
  if (engine) {
    console.log('Unloading model...');
    // WebLLM doesn't have explicit unload, but we can clear the reference
    engine = null;
    isModelLoaded = false;
    console.log('✓ Model unloaded');
  }
}

// Export model ID for reference
export { MODEL_ID };
