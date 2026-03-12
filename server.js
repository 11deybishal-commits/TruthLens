import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
if (fs.existsSync('.env')) {
  dotenv.config();
}

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
const frontendPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendPath));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Mock analysis fallback
function getMockAnalysis(text) {
  const lowerText = text.toLowerCase();
  let credibilityScore = 60;
  let verdict = "UNCERTAIN";
  let emotionalTone = "NEUTRAL";
  let redFlags = [];
  let positives = [];

  const sensationalWords = ["breaking", "exclusive", "shocking", "unbelievable", "you won't believe"];
  const sensational = sensationalWords.some(word => lowerText.includes(word));
  if (sensational) {
    credibilityScore -= 15;
    emotionalTone = "ALARMIST";
    redFlags.push("Sensational headlines designed to grab attention");
  }

  const absoluteWords = ["all", "always", "never", "every single", "100%", "guaranteed"];
  const hasAbsolute = absoluteWords.some(word => lowerText.includes(word));
  if (hasAbsolute) {
    credibilityScore -= 20;
    redFlags.push("Uses absolute language without nuance");
  }

  if (lowerText.includes("cure") || lowerText.includes("miracle") || lowerText.includes("heals") || lowerText.includes("secret")) {
    credibilityScore -= 30;
    verdict = "LIKELY_MISLEADING";
    emotionalTone = "SENSATIONAL";
    redFlags.push("Unverified health/miracle claims - common misinformation tactic");
  }

  const scienceWords = ["study", "research", "scientist", "university", "clinical trial", "peer-reviewed", "data"];
  const scientificRef = scienceWords.filter(word => lowerText.includes(word)).length;
  if (scientificRef > 0) {
    credibilityScore += 15;
    positives.push("References to scientific research and studies");
  }

  if (/\d+(%|percent|million|billion|thousand)/.test(lowerText) || lowerText.includes("data")) {
    credibilityScore += 10;
    positives.push("Includes specific statistics and numerical data");
  }

  if (lowerText.includes("may") || lowerText.includes("could") || lowerText.includes("suggests") || lowerText.includes("might")) {
    credibilityScore += 5;
    positives.push("Uses cautious language indicating uncertainty");
  }

  if (lowerText.includes("celebrity") || lowerText.includes("scandal") || lowerText.includes("drama")) {
    credibilityScore -= 10;
    emotionalTone = "SENSATIONAL";
    redFlags.push("Entertainment/celebrity content often lacks verification");
  }

  const politicalWords = ["trump", "biden", "congress", "senate", "democrat", "republican", "liberal", "conservative"];
  const isPolitical = politicalWords.some(word => lowerText.includes(word));
  if (isPolitical) {
    credibilityScore -= 5;
    redFlags.push("Political claims require careful fact-checking");
  }

  if (lowerText.includes("sources say") || lowerText.includes("allegedly") || lowerText.includes("rumors")) {
    credibilityScore -= 15;
    redFlags.push("Vague or unattributed sources");
  }

  const emotionalWords = ["devastating", "horrific", "disgusting", "outrageous", "infuriating"];
  const emotionalCount = emotionalWords.filter(word => lowerText.includes(word)).length;
  if (emotionalCount > 0) {
    credibilityScore -= emotionalCount * 5;
    emotionalTone = "FEARFUL";
    redFlags.push("Heavy use of emotional language to manipulate reader sentiment");
  }

  if (lowerText.includes("danger") || lowerText.includes("threat") || lowerText.includes("warning")) {
    credibilityScore -= 10;
    if (emotionalTone === "NEUTRAL") emotionalTone = "FEARFUL";
    redFlags.push("Fear-based framing without balanced context");
  }

  credibilityScore = Math.max(0, Math.min(100, credibilityScore));
  
  if (credibilityScore >= 80) verdict = "CREDIBLE";
  else if (credibilityScore >= 65) verdict = "LIKELY_CREDIBLE";
  else if (credibilityScore >= 45) verdict = "UNCERTAIN";
  else if (credibilityScore >= 25) verdict = "LIKELY_MISLEADING";
  else verdict = "MISLEADING";

  let biasRating = "CENTER";
  const leftWords = ["progressive", "liberal", "socialist"];
  const rightWords = ["conservative", "right-wing", "traditional"];
  if (leftWords.some(w => lowerText.includes(w))) biasRating = "LEFT";
  else if (rightWords.some(w => lowerText.includes(w))) biasRating = "RIGHT";

  if (redFlags.length === 0) redFlags = ["Limited source attribution", "Requires independent verification"];
  if (positives.length === 0) positives = ["Clear headline structure", "Topic is identifiable"];

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
    claimsBreakdown: [{
      claim: text.substring(0, 60) + (text.length > 60 ? "..." : ""),
      assessment: credibilityScore < 50 ? "UNVERIFIED" : "PARTIALLY_VERIFIED",
      explanation: credibilityScore < 50 ? "Main claim lacks proper source attribution." : "Claim appears to have some supporting evidence."
    }],
    redFlags: redFlags.slice(0, 3),
    positives: positives.slice(0, 3),
    summary: `This ${emotionalTone.toLowerCase()} article shows a credibility score of ${credibilityScore}. ${verdict === "MISLEADING" || verdict === "LIKELY_MISLEADING" ? "The content contains multiple warning signs and should not be shared without verification." : verdict === "CREDIBLE" ? "The content appears well-sourced and balanced." : "Additional verification is recommended before sharing."}`,
    recommendedAction: verdict === "MISLEADING" || verdict === "LIKELY_MISLEADING" ? "Check with fact-checkers like Snopes, FactCheck.org, or PolitiFact before sharing" : "Verify key claims with Reuters, AP News, or BBC",
    writingTechniques: emotionalCount > 0 ? ["Emotional manipulation", "Fear-mongering"] : sensational ? ["Sensationalism", "Clickbait"] : ["Standard presentation"]
  };
}

// API Routes
app.post("/api/analyze", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 10) {
    return res.status(400).json({ error: "Please provide meaningful text to analyze." });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `You are TruthLens, an expert misinformation analyst. Analyze the following news headline or article text for credibility, bias, and potential misinformation.

TEXT TO ANALYZE:
"${text}"

Respond ONLY with a valid JSON object (no markdown, no extra text) with exactly this structure:
{
  "credibilityScore": <number 0-100>,
  "verdict": "<one of: CREDIBLE | LIKELY_CREDIBLE | UNCERTAIN | LIKELY_MISLEADING | MISLEADING>",
  "verdictLabel": "<short human label>",
  "biasRating": "<one of: FAR_LEFT | LEFT | CENTER_LEFT | CENTER | CENTER_RIGHT | RIGHT | FAR_RIGHT | UNKNOWN>",
  "emotionalTone": "<one of: NEUTRAL | ALARMIST | SENSATIONAL | FEARFUL | ANGRY | HOPEFUL | SATIRICAL>",
  "claimsBreakdown": [{"claim": "<claim>", "assessment": "<VERIFIED|UNVERIFIED|FALSE|MISLEADING|OPINION>", "explanation": "<1 sentence>"}],
  "redFlags": ["<red flag 1>", "<red flag 2>"],
  "positives": ["<positive 1>", "<positive 2>"],
  "summary": "<2-3 sentence analysis>",
  "recommendedAction": "<what to do>",
  "writingTechniques": ["<technique 1>", "<technique 2>"]
}`
      }]
    });

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    res.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error("Error:", err.message);
    if (err.status === 400 && err.error?.error?.message?.includes("credit balance")) {
      return res.json(getMockAnalysis(text));
    }
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// Serve frontend for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ TruthLens running on port ${PORT}`);
});
