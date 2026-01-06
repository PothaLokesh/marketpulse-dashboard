import { Router } from "express";
import News from "../models/News";

const router = Router();

/**
 * GET /api/news?symbol=AAPL&limit=10
 * Used by frontend
 */
router.get("/news", async (req, res) => {
    try {
        const symbol = req.query.symbol as string;
        const limit = Number(req.query.limit) || 10;

        if (!symbol) {
            return res.status(400).json({ error: "Symbol is required" });
        }

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
