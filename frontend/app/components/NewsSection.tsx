"use client";

import { useEffect, useState } from "react";

type NewsItem = {
    _id: string;
    title: string;
    description?: string;
    url: string;
    image_url?: string;
    source: string;
    published_at: string;
};

type Props = {
    symbol: string;
};

export default function NewsSection({ symbol }: Props) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!symbol) return;

        setLoading(true);

        fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/news?symbol=${symbol}&limit=5`
        )
            .then((res) => res.json())
            .then((data) => setNews(data))
            .catch(() => setNews([]))
            .finally(() => setLoading(false));
    }, [symbol]);

    if (loading) {
        return <p className="text-slate-400">Loading news…</p>;
    }

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
                Latest News for {symbol}
            </h2>

            <div className="space-y-4">
                {news.length === 0 && (
                    <p className="text-slate-400">No news available.</p>
                )}

                {news.map((item) => (
                    <a
                        key={item._id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-4 p-4 bg-slate-800 rounded hover:bg-slate-700 transition"
                    >
                        {item.image_url && (
                            <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-24 h-24 object-cover rounded"
                            />
                        )}
                        <div className="flex-1">
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                {item.source} •{" "}
                                {new Date(item.published_at).toLocaleString()}
                            </p>
                            {item.description && (
                                <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
