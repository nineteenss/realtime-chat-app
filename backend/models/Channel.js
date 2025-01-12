//
//    Channel.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 10.01.2025
//

import mongoose from "mongoose";

// Adding basic scheme for Channel model in MongoDB database using "mongoose" package
const channelSchema = new mongoose.Schema({
    // Added 'minLength: 3', 'maxLength: 50' to the name field
    // To ensure that the name is at least 3 characters long and not more than 50 characters
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            content: { type: String, required: true }, // Added 'required: true'
            timestamp: { type: Date, default: Date.now },
        },
    ],
});

export default mongoose.model("Channel", channelSchema);
