import "dotenv/config";
import express from "express";
import cors from "cors";
import stockRoutes from "./routes/stock";
import { connectDB } from "./db";
import newsRoutes from "./routes/news";



const app = express();

connectDB();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "Backend is running 🚀" });
});

app.use("/api", stockRoutes);
app.use("/api", newsRoutes);

app.listen(8001, () => {
    console.log("Backend running on http://localhost:8001");
});
