//
//    Message.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 13.01.2025
//

import mongoose from "mongoose";

// Adding basic scheme for Message model in MongoDB database using "mongoose" package
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
