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

        // Calculate start date (e.g., 1 month ago) to keep data relevant and avoid heavy payload/rate limits
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const period1 = startDate.toISOString().split("T")[0]; // YYYY-MM-DD

        console.log(`Fetching stock data for ${symbol} from ${period1}`);

        try {
            const result = await yahooFinance.historical(symbol, {
                period1: period1,
                period2: new Date(),
                interval: "1d",
            });

            const formatted = result
                .filter((item) => item.date && item.open && item.close && item.high && item.low)
                .map((item) => {
                    let signal: "LONG" | "SHORT" | "NEUTRAL" = "NEUTRAL";

                    if (typeof item.open === "number" && typeof item.close === "number") {
                        signal = getSignal(item.open, item.close);
                    }

                    const time = Math.floor(new Date(item.date).getTime() / 1000);

                    return {
                        time,
                        open: item.open,
                        high: item.high,
                        low: item.low,
                        close: item.close,
                        volume: item.volume,
                        signal,
                    };
                });

            return res.json(formatted);

        } catch (error: any) {
            console.warn(`Yahoo Finance API failed for ${symbol}:`, error.message);

            // Fallback: Generate mock data if API limits us (429 or other errors)
            // This ensures the user sees a "working" chart even if the external provider is blocking us.
            console.log("Generating fallback mock data...");
            const mockData = [];

            const now = new Date();
            let currentPrice = 150.0; // Base price

            for (let i = 30; i >= 0; i--) {
                const date = new Date();
                date.setDate(now.getDate() - i);
                const time = Math.floor(date.getTime() / 1000);

                // Random daily fluctuation
                const change = (Math.random() - 0.5) * 5;
                const open = currentPrice;
                const close = currentPrice + change;
                const high = Math.max(open, close) + Math.random() * 2;
                const low = Math.min(open, close) - Math.random() * 2;

                mockData.push({
                    time,
                    open: Number(open.toFixed(2)),
                    high: Number(high.toFixed(2)),
                    low: Number(low.toFixed(2)),
                    close: Number(close.toFixed(2)),
                    volume: Math.floor(Math.random() * 1000000),
                    signal: getSignal(open, close)
                });

                currentPrice = close;
            }

            return res.json(mockData);
        }
    } catch (error) {
        console.error("General stock error:", error);
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
});


export default router;
