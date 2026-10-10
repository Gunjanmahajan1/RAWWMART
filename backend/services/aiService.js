// ─────────────────────────────────────────
//  RAWWMART - AI Assistant Service
// ─────────────────────────────────────────

const { calculateRecommendations, normalizeDishName, RECIPES, MIN_SERVINGS } = require('./recipeEngine');
const AIChatSession = require('../models/AIChatSession');

/**
 * Sanitize prompt to protect against injection
 */
function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '') // remove HTML
    .replace(/[{}]/g, '')     // strip object brackets
    .trim();
}

/**
 * Deterministic Natural Language Parser for fallback when LLM API key is not set
 */
function parseIntentDeterministic(promptText) {
  const clean = promptText.toLowerCase();

  // 1. Dish extraction
  const detectedDish = normalizeDishName(clean);

  // 2. Budget extraction (e.g. "budget of ₹3,000", "under 3000 rs", "in 2500 rupees", "₹3,000")
  let budget = null;
  const budgetMatch = clean.match(/(?:budget|budget of|under|in|for|max|cost|around)?\s*(?:₹|rs\.?|rupees)\s*([\d,]+)/i) ||
                      clean.match(/(?:budget|budget of)\s*(?:of|is|:)?\s*(?:₹|rs\.?|rupees)?\s*([\d,]+)/i);
  if (budgetMatch) {
    const val = parseInt(budgetMatch[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) budget = val;
  }

  // 3. Servings extraction (e.g. "100 plates", "50 servings", "for 200 people", "100 pax")
  let servings = null;
  const servingMatches = clean.match(/([\d,]+)\s*(plates|plate|servings|serving|people|pax|persons|vada|bhaji|samosa|dosa|puri|plates of)/i) ||
                         clean.match(/(?:for|prepare|make|need|want)\s*([\d,]+)/i);
  if (servingMatches) {
    const num = parseInt(servingMatches[1].replace(/,/g, ''));
    if (!isNaN(num) && num > 0) servings = num;
  }
  
  if (!servings) {
    // If no explicit keyword, find number that isn't the budget
    const nums = [...clean.matchAll(/\b(\d{1,4})\b/g)].map(m => parseInt(m[1]));
    for (const n of nums) {
      if (n !== budget && n > 0 && n < 5000) {
        servings = n;
        break;
      }
    }
  }

  // 4. Date / Time extraction
  let date = 'Tomorrow';
  if (clean.includes('today')) date = 'Today';
  else if (clean.includes('tomorrow')) date = 'Tomorrow';
  else if (clean.includes('day after')) date = 'Day after tomorrow';
  else if (clean.includes('weekend') || clean.includes('sunday')) date = 'Upcoming weekend';

  return {
    dish: detectedDish,
    servings,
    budget,
    date,
    constraints: []
  };
}

/**
 * Call Gemini LLM API if key is present in environment
 */
async function parseIntentWithGemini(promptText, apiKey) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const systemPrompt = `You are the AI Raw Material Assistant for RAWWMART. Extract cooking request parameters in JSON format.
Output strictly JSON matching this structure:
{
  "dish": "pav bhaji" | "vada pav" | "pani puri" | "samosa" | "dosa" | "poha" | "chole bhature" | null,
  "servings": number or null,
  "budget": number or null,
  "date": string or "Tomorrow",
  "constraints": string[],
  "clarificationNeeded": boolean,
  "conversationalReply": string
}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\nUser prompt: "${promptText}"` }]
        }]
      })
    });

    if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);
    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON string from markdown codeblock if present
    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return {
        dish: normalizeDishName(parsed.dish),
        servings: parsed.servings ? parseInt(parsed.servings) : null,
        budget: parsed.budget ? parseFloat(parsed.budget) : null,
        date: parsed.date || 'Tomorrow',
        constraints: parsed.constraints || [],
        conversationalReply: parsed.conversationalReply
      };
    }
  } catch (err) {
    console.warn('⚠️ Gemini API call failed. Using deterministic parser fallback:', err.message);
  }
  return null;
}

/**
 * Process a user message in an AI chat session
 */
async function processChatMessage({ userId, sessionId, messageText }) {
  const cleanPrompt = sanitizeInput(messageText);
  if (!cleanPrompt) {
    throw new Error('Message cannot be empty.');
  }

  // Load or create chat session
  let session = null;
  if (sessionId) {
    session = await AIChatSession.findOne({ _id: sessionId, user: userId });
  }
  if (!session) {
    session = await AIChatSession.create({
      user: userId,
      title: cleanPrompt.length > 30 ? cleanPrompt.substring(0, 30) + '...' : cleanPrompt,
      messages: []
    });
  }

  // Add user message to session
  session.messages.push({
    sender: 'user',
    text: cleanPrompt,
    timestamp: new Date()
  });

  // Extract previous context from session if user is providing a follow-up (e.g. "100 plates")
  let prevDish = null;
  let prevServings = null;
  let prevBudget = null;

  for (let i = session.messages.length - 2; i >= 0; i--) {
    const msg = session.messages[i];
    if (msg.metadata) {
      if (msg.metadata.dish && !prevDish) prevDish = msg.metadata.dish;
      if (msg.metadata.servings && !prevServings) prevServings = msg.metadata.servings;
      if (msg.metadata.budget && !prevBudget) prevBudget = msg.metadata.budget;
    }
  }

  // Check LLM API key
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  let extracted = null;

  if (apiKey) {
    extracted = await parseIntentWithGemini(cleanPrompt, apiKey);
  }

  if (!extracted) {
    extracted = parseIntentDeterministic(cleanPrompt);
  }

  // Merge with previous context if user provided follow-up answer
  const dish = extracted.dish || prevDish;
  const servings = extracted.servings || prevServings;
  const budget = extracted.budget || prevBudget;
  const date = extracted.date || 'Tomorrow';

  let assistantText = '';
  let recommendationData = null;

  const cleanLower = cleanPrompt.toLowerCase();
  const isMinServingQuery = cleanLower.includes('min serving') || cleanLower.includes('minimum serving') || cleanLower.includes('min order') || cleanLower.includes('minimum plate');

  // Decision logic: Do we have dish and servings?
  if (isMinServingQuery && !dish) {
    assistantText = `The minimum serving size we provide for commercial bulk raw material calculations on RAWWMART is **${MIN_SERVINGS || 10} servings**. (Wholesale commercial packs like 5 kg bags, 5L cans, or 25 kg bags are packaged for bulk food preparation). Which dish would you like to prepare for 10 or more servings?`;
  } else if (!dish) {
    assistantText = `I can help calculate exact raw material requirements! Which dish would you like to prepare? (Supported: Pav Bhaji, Vada Pav, Pani Puri, Samosa, Dosa, Poha, Chole Bhature).`;
  } else if (!servings && !isMinServingQuery) {
    const dishDisplayName = RECIPES[dish] ? RECIPES[dish].name : dish;
    assistantText = `Great choice! How many plates or servings of ${dishDisplayName} are you planning to prepare? (e.g. 100 plates, minimum ${MIN_SERVINGS || 10} servings)`;
  } else {
    // Generate recommendation calculation
    recommendationData = await calculateRecommendations({
      dishName: dish,
      servings: servings || MIN_SERVINGS,
      budget
    });

    if (recommendationData.error) {
      assistantText = recommendationData.message;
      recommendationData = null;
    } else {
      const budgetText = budget ? ` with a target budget of ₹${budget.toLocaleString('en-IN')}` : '';
      if (recommendationData.isBelowMinServings) {
        assistantText = `⚠️ **Minimum Wholesale Serving Notice:** You requested **${recommendationData.requestedServings} serving(s)**. RAWWMART provides commercial wholesale raw materials with a minimum threshold of **${MIN_SERVINGS || 10} servings**. (Buying full wholesale packs like 5 kg or 25 kg for 1 serving results in large excess stock). Here is your raw material plan calculated for our minimum threshold of **${recommendationData.servings} plates of ${recommendationData.dish}**${budgetText} for ${date}:`;
      } else {
        assistantText = `Here is your customized raw material plan for **${recommendationData.servings} plates of ${recommendationData.dish}**${budgetText} for ${date}:`;
      }
    }
  }

  // Save assistant message to session
  const assistantMsg = {
    sender: 'assistant',
    text: assistantText,
    timestamp: new Date(),
    metadata: {
      dish,
      servings,
      budget,
      date,
      constraints: extracted.constraints || [],
      recommendation: recommendationData
    }
  };

  session.messages.push(assistantMsg);
  await session.save();

  return {
    sessionId: session._id,
    message: assistantMsg,
    recommendation: recommendationData,
    history: session.messages
  };
}

module.exports = {
  sanitizeInput,
  parseIntentDeterministic,
  processChatMessage
};
