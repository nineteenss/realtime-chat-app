//
//    User.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 10.01.2025
//

import mongoose from "mongoose";

// Adding basic scheme for User model in MongoDB database using "mongoose" package
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }],
});

export default mongoose.model("User", userSchema);
