import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();

// CORS - Allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Mock analysis for testing without API credits
function getMockAnalysis(text) {
  const lowerText = text.toLowerCase();
  let credibilityScore = 60;
  let verdict = "UNCERTAIN";
  let emotionalTone = "NEUTRAL";
  let redFlags = [];
  let positives = [];
  let claimsCount = 0;

  // Check for sensational language
  const sensationalWords = ["breaking", "exclusive", "shocking", "unbelievable", "you won't believe"];
  const sensational = sensationalWords.some(word => lowerText.includes(word));
  if (sensational) {
    credibilityScore -= 15;
    emotionalTone = "ALARMIST";
    redFlags.push("Sensational headlines designed to grab attention");
  }

  // Check for absolutist language
  const absoluteWords = ["all", "always", "never", "every single", "100%", "guaranteed"];
  const hasAbsolute = absoluteWords.some(word => lowerText.includes(word));
  if (hasAbsolute) {
    credibilityScore -= 20;
    redFlags.push("Uses absolute language without nuance");
  }

  // Check for health/miracle claims
  if (lowerText.includes("cure") || lowerText.includes("miracle") || lowerText.includes("heals") || lowerText.includes("secret")) {
    credibilityScore -= 30;
    verdict = "LIKELY_MISLEADING";
    emotionalTone = "SENSATIONAL";
    redFlags.push("Unverified health/miracle claims - common misinformation tactic");
  }

  // Check for scientific credibility
  const scienceWords = ["study", "research", "scientist", "university", "clinical trial", "peer-reviewed", "data"];
  const scientificRef = scienceWords.filter(word => lowerText.includes(word)).length;
  if (scientificRef > 0) {
    credibilityScore += 15;
    positives.push("References to scientific research and studies");
  }

  // Check for numbers and statistics
  if (/\d+(%|percent|million|billion|thousand)/.test(lowerText) || lowerText.includes("data")) {
    credibilityScore += 10;
    positives.push("Includes specific statistics and numerical data");
  }

  // Check for balance and nuance
  if (lowerText.includes("may") || lowerText.includes("could") || lowerText.includes("suggests") || lowerText.includes("might")) {
    credibilityScore += 5;
    positives.push("Uses cautious language indicating uncertainty");
  }

  // Check for controversial topics
  if (lowerText.includes("celebrity") || lowerText.includes("scandal") || lowerText.includes("drama")) {
    credibilityScore -= 10;
    emotionalTone = "SENSATIONAL";
    redFlags.push("Entertainment/celebrity content often lacks verification");
  }

  // Check for political content
  const politicalWords = ["trump", "biden", "congress", "senate", "democrat", "republican", "liberal", "conservative", "politician"];
  const isPolitical = politicalWords.some(word => lowerText.includes(word));
  if (isPolitical) {
    // Political content needs more scrutiny
    credibilityScore -= 5;
    redFlags.push("Political claims require careful fact-checking");
  }

  // Check for vague sources
  if (lowerText.includes("sources say") || lowerText.includes("allegedly") || lowerText.includes("rumors")) {
    credibilityScore -= 15;
    redFlags.push("Vague or unattributed sources");
  }

  // Check for emotional language
  const emotionalWords = ["devastating", "horrific", "disgusting", "outrageous", "infuriating"];
  const emotionalCount = emotionalWords.filter(word => lowerText.includes(word)).length;
  if (emotionalCount > 0) {
    credibilityScore -= emotionalCount * 5;
    emotionalTone = "FEARFUL";
    redFlags.push("Heavy use of emotional language to manipulate reader sentiment");
  }

  // Check for fear-mongering
  if (lowerText.includes("danger") || lowerText.includes("threat") || lowerText.includes("danger") || lowerText.includes("warning")) {
    credibilityScore -= 10;
    if (emotionalTone === "NEUTRAL") emotionalTone = "FEARFUL";
    redFlags.push("Fear-based framing without balanced context");
  }

  // Determine verdict based on final score
  credibilityScore = Math.max(0, Math.min(100, credibilityScore));
  
  if (credibilityScore >= 80) {
    verdict = "CREDIBLE";
  } else if (credibilityScore >= 65) {
    verdict = "LIKELY_CREDIBLE";
  } else if (credibilityScore >= 45) {
    verdict = "UNCERTAIN";
  } else if (credibilityScore >= 25) {
    verdict = "LIKELY_MISLEADING";
  } else {
    verdict = "MISLEADING";
  }

  // Bias detection
  let biasRating = "CENTER";
  const leftWords = ["progressive", "liberal", "socialist", "left-wing"];
  const rightWords = ["conservative", "right-wing", "traditional", "nationalist"];
  const farLeftWords = ["communist", "marxist"];
  const farRightWords = ["fascist", "extremist"];

  if (farLeftWords.some(w => lowerText.includes(w))) {
    biasRating = "FAR_LEFT";
  } else if (farRightWords.some(w => lowerText.includes(w))) {
    biasRating = "FAR_RIGHT";
  } else if (leftWords.some(w => lowerText.includes(w))) {
    biasRating = "LEFT";
  } else if (rightWords.some(w => lowerText.includes(w))) {
    biasRating = "RIGHT";
  }

  // Add default red flags and positives if empty
  if (redFlags.length === 0) {
    redFlags = ["Limited source attribution", "Requires independent verification"];
  }
  if (positives.length === 0) {
    positives = ["Clear headline structure", "Topic is identifiable"];
  }

  const verdictLabels = {
    CREDIBLE: "Credible",
    LIKELY_CREDIBLE: "Likely Credible",
    UNCERTAIN: "Uncertain",
    LIKELY_MISLEADING: "Likely Misleading",
    MISLEADING: "Misleading"
  };

  return {
    credibilityScore,
    verdict,
    verdictLabel: verdictLabels[verdict],
    biasRating,
    emotionalTone,
    claimsBreakdown: [
      {
        claim: text.substring(0, 60) + (text.length > 60 ? "..." : ""),
        assessment: credibilityScore < 50 ? "UNVERIFIED" : "PARTIALLY_VERIFIED",
        explanation: credibilityScore < 50 ? "Main claim lacks proper source attribution." : "Claim appears to have some supporting evidence."
      }
    ],
    redFlags: redFlags.slice(0, 3),
    positives: positives.slice(0, 3),
    summary: `This ${emotionalTone.toLowerCase()} article shows a credibility score of ${credibilityScore}. ${verdict === "MISLEADING" || verdict === "LIKELY_MISLEADING" ? "The content contains multiple warning signs and should not be shared without verification." : verdict === "CREDIBLE" ? "The content appears well-sourced and balanced." : "Additional verification is recommended before sharing."}`,
    recommendedAction: verdict === "MISLEADING" || verdict === "LIKELY_MISLEADING" ? "Check with fact-checkers like Snopes, FactCheck.org, or PolitiFact before sharing" : "Verify key claims with Reuters, AP News, or BBC",
    writingTechniques: emotionalCount > 0 ? ["Emotional manipulation", "Fear-mongering"] : sensational ? ["Sensationalism", "Clickbait"] : ["Standard presentation"]
  };
}

app.get("/", (req, res) => {
  res.json({ message: "TruthLens Backend is Running!", version: "1.0", status: "operational" });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: "Please provide meaningful text to analyze." });
    }

    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `You are TruthLens, an expert misinformation analyst. Analyze the following news headline or article text for credibility, bias, and potential misinformation.

TEXT TO ANALYZE:
"${text}"

Respond ONLY with a valid JSON object (no markdown, no extra text) with exactly this structure:
{
  "credibilityScore": <number 0-100>,
  "verdict": "<one of: CREDIBLE | LIKELY_CREDIBLE | UNCERTAIN | LIKELY_MISLEADING | MISLEADING>",
  "verdictLabel": "<short human label like 'Mostly Credible' or 'Likely Misleading'>",
  "biasRating": "<one of: FAR_LEFT | LEFT | CENTER_LEFT | CENTER | CENTER_RIGHT | RIGHT | FAR_RIGHT | UNKNOWN>",
  "emotionalTone": "<one of: NEUTRAL | ALARMIST | SENSATIONAL | FEARFUL | ANGRY | HOPEFUL | SATIRICAL>",
  "claimsBreakdown": [
    { "claim": "<specific claim extracted>", "assessment": "<VERIFIED|UNVERIFIED|FALSE|MISLEADING|OPINION>", "explanation": "<1 sentence>" }
  ],
  "redFlags": ["<red flag 1>", "<red flag 2>"],
  "positives": ["<positive signal 1>", "<positive signal 2>"],
  "summary": "<2-3 sentence overall analysis>",
  "recommendedAction": "<what the reader should do>",
  "writingTechniques": ["<manipulation technique used>", "<technique 2>"]
}`
          }
        ]
      });

      const raw = message.content[0].text.trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      const result = JSON.parse(jsonMatch[0]);
      return res.json(result);
    } catch (apiErr) {
      console.error("Anthropic API Error:", apiErr.message);
      // Fallback to mock analysis
      return res.json(getMockAnalysis(text));
    }
  } catch (err) {
    console.error("Analysis endpoint error:", err);
    return res - return JSON
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: "Endpoint not found", 
    path: req.path,
    method: req.method,
    availableEndpoints: ['/api/analyze', '/api/health', '/']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ TruthLens Backend Running`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔗 Base URL: http://localhost:${PORT}`);
  console.log(`📝 Analyze: http://localhost:${PORT}/api/analyze (POST)`);
  console.log(`💓 Health: http://localhost:${PORT}/api/health (GET)`);
}
// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ TruthLens backend running on port ${PORT}`));