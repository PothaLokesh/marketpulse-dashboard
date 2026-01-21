"use client";

import { useEffect, useRef } from "react";
import {
    createChart,
    CandlestickSeries,
    CandlestickData,
} from "lightweight-charts";

type Props = {
    symbol: string;
};

export default function ChartSection({ symbol }: Props) {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            height: 400,
            layout: {
                background: { color: "#020617" },
                textColor: "#e5e7eb",
            },
            grid: {
                vertLines: { color: "#1e293b" },
                horzLines: { color: "#1e293b" },
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
            borderVisible: false,
            wickUpColor: "#22c55e",
            wickDownColor: "#ef4444",
        });

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stock-data?symbol=${symbol}`)
            .then((res) => {
                if (!res.ok) {
                    console.warn(`Failed to fetch stock data: ${res.status} ${res.statusText}`);
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (!Array.isArray(data)) return;

                const formatted: CandlestickData[] = data.map((item: any) => ({
                    time: item.time as any, // Backend now returns Unix timestamp
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                }));

                candleSeries.setData(formatted);
            })
            .catch((err) => console.error("Chart data error:", err));

        return () => {
            chart.remove();
        };
    }, [symbol]);

    return <div ref={chartContainerRef} className="w-full" />;
}
