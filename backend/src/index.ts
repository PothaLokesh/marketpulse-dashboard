import "dotenv/config";
import express from "express";
import cors from "cors";
import stockRoutes from "./routes/stock";
import { connectDB } from "./db";
import newsRoutes from "./routes/news";

const app = express();

// Connect DB (safe for serverless)
connectDB();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "Backend is running 🚀" });
});

app.use("/api", stockRoutes);
app.use("/api", newsRoutes);

// ❌ REMOVE app.listen()
// ✅ EXPORT app for Vercel
export default app;

// 🚀 Start server locally if not in production/vercel
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
