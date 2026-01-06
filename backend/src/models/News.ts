import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
    {
        id: { type: String, unique: true },
        title: String,
        description: String,
        url: String,
        image_url: String,
        source: String,
        published_at: Date,
        symbols: [String],
    },
    { timestamps: true }
);

export default mongoose.models.News ||
    mongoose.model("News", NewsSchema);
