//
//    Channel.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 10.01.2025
//

import mongoose from "mongoose";

// Adding basic scheme for Channel model in MongoDB database using "mongoose" package
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
