import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            content: String,
            timestamp: { type: Date, default: Date.now },
        },
    ],
});

export default mongoose.model("Channel", channelSchema);
