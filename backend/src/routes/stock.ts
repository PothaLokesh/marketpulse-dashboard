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

        const result = await yahooFinance.chart(symbol, {
            period1: new Date("2024-01-01"),
            period2: new Date(),
            interval: "1d",
            return: "object",
        });

        const chart = result;

        if (!chart || !chart.timestamp || !chart.indicators?.quote?.[0]) {
            return res.status(500).json({ error: "Invalid chart data returned" });
        }

        const candles = chart.indicators.quote[0];
        const timestamps: number[] = chart.timestamp;

        const formatted = timestamps.map((time: number, i: number) => {
            const open = candles.open[i];
            const close = candles.close[i];

            let signal: "LONG" | "SHORT" | "NEUTRAL" = "NEUTRAL";

            // ✅ FULL type narrowing (null + undefined safe)
            if (typeof open === "number" && typeof close === "number") {
                signal = getSignal(open, close);
            }

            return {
                date: new Date(time * 1000),
                open,
                high: candles.high[i],
                low: candles.low[i],
                close,
                volume: candles.volume[i],
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
