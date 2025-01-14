//
//    auth.js
//    realtime-chat-app
//
//    Created by Sergey Smetannikov on 13.01.2025
//

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to authenticate requests using JWT
const authenticate = async (req, res, next) => {
    try {
        // Get the token from the request headers
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ error: "Authentication required." });
        }

        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user associated with the token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "User not found." });
        }

        // Attach the user and token to the request object
        req.user = user;
        req.token = token;
        next(); // Call next() to proceed to the next middleware/route handler
    } catch (error) {
        res.status(401).json({ error: "Invalid token." });
    }
};

export default authenticate;
