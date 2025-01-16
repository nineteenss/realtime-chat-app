# Real-time Chat App

A real-time chat application built with Nuxt.js (frontend), Express.js (backend), and Socket.IO under the hood for real-time communication.

![image](https://github.com/user-attachments/assets/ea99f884-f9fa-4d0a-8830-3d93ad5e83ae)

## Requirements

-   Node.js: `v23.6.0` or higher
-   NPM: `v10.9.2` or higher
-   MongoDB: Cloud or local instance

## Installation

1. Clone the repository:

    ```
    git clone https://github.com/username/realtime-chat-app.git
    cd realtime-chat-app
    ```

2. Install dependencies for both frontend and backend:

    - Navigate to the backend folder and install dependencies:
        ```
        cd backend
        npm install
        ```
    - Navigate to the frontend folder and install dependencies:
        ```
        cd frontend
        npm install
        ```

3. Set up MongoDB:

    - Create a MongoDB database (cloud or local). For testing, you can use a free cloud solution like MongoDB Atlas.
    - Update the .env file in the backend folder with your MongoDB connection string:

        ```
        # .env example
        PORT=4005
        FRONTEND_URL=http://localhost:3005
        MONGODB_URI=mongodb+srv://LOGIN:PASSWORD@cluster0.yhkcs.mongodb.net/rt-chat-app
        JWT_SECRET=9a020c06195a95b88d7364eb67c5f7919bd4ce72b0cc8c9cf6cb4ad3591506b8

        # Replace LOGIN and PASSWORD with your MongoDB credentials.
        ```

4. Run the backend:

    - Navigate to the backend folder:
      `cd backend`
    - Start the backend server:
      `node server.js`

5. Run the frontend:

    - Navigate to the frontend folder:
      `cd frontend`
    - Start the frontend development server:
      `npm run dev -- --port=3005`

6. Test the application:
    - Open your browser and navigate to `http://localhost:3005` in order to test the app.

## Dependencies

### Frontend

-   Nuxt.js: Nuxt 3 as a frontend framework.
-   Socket.IO Client: Real-time communication with the backend.
-   TailwindCSS: Grat styling framework.
-   Pinia: State management.
-   JWT Decode: For decoding JSON Web Tokens.

### Backend

-   Express.js: Famous backend framework.
-   Socket.IO: Real-time communication with the frontend.
-   Mongoose: MongoDB object modeling.
-   Bcrypt: Password hashing.
-   JSON Web Token (JWT): For authentication.

# Known issues

-   An arbitrary number of message copies are repeated when sent to the channel when there is no activity in the chat for a few minutes (Fixes on page reload);
    -   Probably can be fixed on app build, so no extra dev dependencies are required on a constant basis and there's no constant backend reloads due to file saves.
-   Fetch errors at user registration process (probably due to `http` protocol used in production environment) or `npm run dev` mode (Needs more time to investigate the issue);
-   Icons do not appear properly (colored squares) in production (currently a VPS server);
-   Sometimes `offline` status for user does not appear even when user have left the page (e.g. closed browser tab);
-   and some other little issues related to backend server strtucture.

# TBD

Here's a list of example improvements that need to be made to the app before pushing it to production release.

-   **DM** - Direct messaging (ability to make send direct messages from
    one registered member to another);
-   **Chat roles** - Admin & moderator roles for better chat interactivity;
-   **Replies** - Ability to make replies onto the picked message in channel
    or direct message;
-   **Emoji** - Emoji support for both DM and Channels;
-   **Various notifications** - New message, sounds, etc.;
-   **User restrictions** - E.g. private channels, mute notifications, mute chat member (Owner), etc.;
-   **File upload** - Ability to upload various file formats in chat e.g. - images, videos, documents, etc.;
-   **Voice messages** - Ability to send recorded voice messages;
-   **Improved registration** - Improved and more complex registration system in order to maintain better users
    security environment;
-   **Better code organisation and project file structure**;
-   **And many more...**

## License

This project available under the GPL-3.0 License.
