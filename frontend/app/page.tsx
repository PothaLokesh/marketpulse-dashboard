"use client";

import { useState } from "react";
import ChartSection from "@/app/components/ChartSection";
import NewsSection from "@/app/components/NewsSection";

export default function Home() {
  const [symbol, setSymbol] = useState("AAPL");

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">MarketPulse</h1>

      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Search symbol (AAPL, TSLA)"
        className="mb-6 p-2 bg-slate-800 rounded"
      />

      <ChartSection symbol={symbol} />
      <NewsSection symbol={symbol} />
    </main>
  );
}
