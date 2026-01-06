export default {
	async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
		console.log("⏰ Cron triggered");

		const symbols = ["AAPL", "TSLA", "NVDA", "MSFT"];

		for (const symbol of symbols) {
			try {
				const res = await fetch(
					`https://api.marketaux.com/v1/news/all?symbols=${symbol}&api_token=${env.MARKETAUX_API_KEY}`
				);

				if (!res.ok) continue;

				const json = (await res.json()) as { data: any[] };

				await fetch(`${env.BACKEND_API_URL}/api/news`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-cron-secret": env.CRON_SECRET
					},
					body: JSON.stringify(json.data)
				});

				console.log(`✅ News pushed for ${symbol}`);
			} catch (err) {
				console.log(`❌ Error for ${symbol}`, err);
			}
		}
	}
};
