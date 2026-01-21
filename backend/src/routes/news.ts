import { Router } from "express";
import News from "../models/News";

const router = Router();

/**
 * GET /api/news?symbol=AAPL&limit=10
 * Used by frontend
 */
// Helper to delay for rate limits if needed (optional)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

router.get("/news", async (req, res) => {
    try {
        const symbol = req.query.symbol as string;
        const limit = Number(req.query.limit) || 5;

        if (!symbol) {
            return res.status(400).json({ error: "Symbol is required" });
        }

        // 1. Try fetching from MarketAux API (REAL-TIME)
        try {
            const apiToken = process.env.MARKETAUX_API_KEY;
            if (!apiToken) throw new Error("Missing MarketAux API Key");

            const apiUrl = `https://api.marketaux.com/v1/news/all?symbols=${symbol}&filter_entities=true&limit=${limit}&api_token=${apiToken}`;
            const apiRes = await fetch(apiUrl);

            if (apiRes.ok) {
                const data = await apiRes.json();
                const articles = data.data;

                // 2. Store/Update in DB
                for (const article of articles) {
                    const newsItem = {
                        id: article.uuid,
                        title: article.title,
                        description: article.description,
                        url: article.url,
                        image_url: article.image_url,
                        source: article.source,
                        published_at: article.published_at,
                        symbols: [symbol], // Simplified for now
                    };

                    await News.updateOne(
                        { id: newsItem.id },
                        { $setOnInsert: newsItem },
                        { upsert: true }
                    );
                }
            } else {
                console.warn(`MarketAux API Error: ${apiRes.status} ${apiRes.statusText}`);
            }
        } catch (apiError) {
            console.error("MarketAux Fetch Failed (using fallback):", apiError);
            // Continue to fetch from DB as fallback
        }

        // 3. Return from DB (ensures we return data even if API failed, or returns what we just saved)
        const news = await News.find({ symbols: symbol })
            .sort({ published_at: -1 })
            .limit(limit);

        res.json(news);
    } catch (error) {
        console.error("Fetch news error:", error);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

/**
 * POST /api/news
 * Used internally by Cloudflare Worker
 */
router.post("/news", async (req, res) => {
    try {
        // 🔐 Secure endpoint
        if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const articles = req.body;

        if (!Array.isArray(articles)) {
            return res.status(400).json({ error: "Invalid payload" });
        }

        for (const article of articles) {
            // Marketaux uses `uuid` but our model expects `id`
            // Also need to extract symbols from `entities` array if present
            const symbolList = article.entities
                ? article.entities.map((e: any) => e.symbol)
                : [];

            const newsItem = {
                id: article.uuid,
                title: article.title,
                description: article.description,
                url: article.url,
                image_url: article.image_url,
                source: article.source,
                published_at: article.published_at,
                symbols: symbolList,
            };

            await News.updateOne(
                { id: newsItem.id },
                { $setOnInsert: newsItem },
                { upsert: true }
            );
        }

        res.json({ success: true, inserted: articles.length });
    } catch (error) {
        console.error("Store news error:", error);
        res.status(500).json({ error: "Failed to store news" });
    }
});

export default router;
