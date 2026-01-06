import { Router } from "express";
import YahooFinance from "yahoo-finance2";
import { getSignal } from "../utils/signals";

const router = Router();
const yahooFinance = new YahooFinance();

router.get("/stock-data", async (req, res) => {
    try {
        const symbol = req.query.symbol as string;

        if (!symbol) {
            return res.status(400).json({ error: "Symbol is required" });
        }

        const result = await yahooFinance.historical(symbol, {
            period1: "2024-01-01",
            period2: new Date(),
            interval: "1d",
        });

        const formatted = result.map((item) => {
            let signal: "LONG" | "SHORT" | "NEUTRAL" = "NEUTRAL";

            // Signal calculation
            if (typeof item.open === "number" && typeof item.close === "number") {
                signal = getSignal(item.open, item.close);
            }

            return {
                date: item.date, // already a Date object
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.volume,
                signal,
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error("Yahoo Finance chart error:", error);
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
});


export default router;
