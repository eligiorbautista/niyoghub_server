import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectToMongoDB from "./db/connectToMongoDB.mjs";
import authRoutes from "./routes/auth.routes.mjs";
import adminRoutes from "./routes/admin.routes.mjs";
import userRoutes from "./routes/user.routes.mjs";
import announcementRoutes from "./routes/announcement.routes.mjs";
import articleRoutes from "./routes/article.routes.mjs";
import messageRoutes from "./routes/message.routes.mjs";
import notificationRoutes from "./routes/notifications.routes.mjs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = ["https://niyoghub-password-reset.vercel.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware to make 'io' accessible in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

io.on("connection", (socket) => {
  console.log("A user connected");
  // Handle sending a message
  socket.on("sendMessage", (data) => {
    io.emit("newMessage", data); // Broadcast the new message to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server running on port ${PORT}`);
});
