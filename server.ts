import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 3-Agent Consolidated Pipeline API Endpoint for Live NYC Restaurant Analysis
  app.post("/api/agents/analyze", async (req, res) => {
    try {
      const { restaurantName, neighborhood } = req.body;
      if (!restaurantName || typeof restaurantName !== "string") {
        res.status(400).json({ error: "Please provide an NYC restaurant name to analyze." });
        return;
      }

      const prompt = `Analyze the New York City restaurant "${restaurantName}" ${
        neighborhood ? `in ${neighborhood}` : "in NYC"
      } using the 3-Agent Sustainability Consolidation Pipeline:

Agent 1 (Multi-Source Harvester - Google, Resy, Beli):
- Gather realistic, accurate culinary, operational, and physical venue details for "${restaurantName}" in New York City (exact NYC coordinates lat/lng in Manhattan/Brooklyn/Queens, address, cuisine, price tier, Google star rating & review count, Resy rating & booking tags, Beli community score & rank notes).
- Extract specific evidence for the 4 core sustainability metrics:
  1. Waste Management / Waste Reduction (composting, trimmings reuse, packaging, food rescue)
  2. Operations (local farm sourcing, energy efficiency / induction, water conservation)
  3. Plant-Based Options (vegan/vegetarian menu depth, whole-plant dishes, low-carbon proteins)
  4. Accessibility (step-free entrance, ADA accessible bathroom, handicap seating space)

Agent 2 (Metric Scoring Engine):
- Score each of the 4 metrics out of 10 (floating point 1.0 to 10.0, e.g. 8.6 or 2.4).

Agent 3 (Display & Buzzword Formatter):
- Generate 4-5 punchy sustainability & accessibility buzzwords (e.g., "Farm-Fresh", "Hudson Valley Sourced", "Step-Free ADA", "Zero-Plastic Takeout", "Plant-Forward", "Compost Partner", "High Packaging Waste").
- Provide a concise 2-sentence editorial summary of its sustainability profile.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              neighborhood: { type: Type.STRING },
              borough: { type: Type.STRING },
              address: { type: Type.STRING },
              cuisine: { type: Type.STRING },
              priceLevel: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              googleRating: { type: Type.NUMBER },
              googleReviewCount: { type: Type.INTEGER },
              resyRating: { type: Type.NUMBER },
              beliScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              buzzwords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              agent1Sources: {
                type: Type.OBJECT,
                properties: {
                  googleSignal: { type: Type.STRING },
                  resySignal: { type: Type.STRING },
                  beliSignal: { type: Type.STRING },
                },
                required: ["googleSignal", "resySignal", "beliSignal"],
              },
              metrics: {
                type: Type.OBJECT,
                properties: {
                  wasteManagement: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.NUMBER },
                      composting: { type: Type.BOOLEAN },
                      zeroSingleUsePlastic: { type: Type.BOOLEAN },
                      foodRescuePartner: { type: Type.STRING },
                      evidence: { type: Type.STRING },
                    },
                    required: ["score", "composting", "zeroSingleUsePlastic", "foodRescuePartner", "evidence"],
                  },
                  operations: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.NUMBER },
                      localSourcingPct: { type: Type.INTEGER },
                      energyEfficiency: { type: Type.STRING },
                      waterUsageGrade: { type: Type.STRING },
                      evidence: { type: Type.STRING },
                    },
                    required: ["score", "localSourcingPct", "energyEfficiency", "waterUsageGrade", "evidence"],
                  },
                  plantBased: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.NUMBER },
                      plantMenuSharePct: { type: Type.INTEGER },
                      signaturePlantDish: { type: Type.STRING },
                      evidence: { type: Type.STRING },
                    },
                    required: ["score", "plantMenuSharePct", "signaturePlantDish", "evidence"],
                  },
                  accessibility: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.NUMBER },
                      stepFreeEntrance: { type: Type.BOOLEAN },
                      accessibleBathroom: { type: Type.BOOLEAN },
                      handicapSeating: { type: Type.BOOLEAN },
                      evidence: { type: Type.STRING },
                    },
                    required: ["score", "stepFreeEntrance", "accessibleBathroom", "handicapSeating", "evidence"],
                  },
                },
                required: ["wasteManagement", "operations", "plantBased", "accessibility"],
              },
            },
            required: [
              "name",
              "neighborhood",
              "borough",
              "address",
              "cuisine",
              "priceLevel",
              "lat",
              "lng",
              "googleRating",
              "googleReviewCount",
              "resyRating",
              "beliScore",
              "summary",
              "buzzwords",
              "agent1Sources",
              "metrics",
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error("Empty response from Gemini Agent pipeline.");
      }

      const parsed = JSON.parse(rawText.trim());
      res.json({ restaurant: parsed });
    } catch (error: any) {
      console.error("Agent pipeline error:", error);
      res.status(500).json({
        error: error?.message || "Failed to execute 3-Agent analysis pipeline.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Verdant NYC Server running on http://localhost:${PORT}`);
  });
}

startServer();
