import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectToMongoDB from "./db/connectToMongoDB.mjs";
import authRoutes from "./routes/auth.routes.mjs";
import adminRoutes from "./routes/admin.routes.mjs";
import userRoutes from "./routes/user.routes.mjs";
import articleRoutes from "./routes/article.routes.mjs";
import messageRoutes from "./routes/message.routes.mjs";
import notificationRoutes from "./routes/notifications.routes.mjs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://localhost:5173", // local development
  "https://niyoghub-password-reset.vercel.app", // frontend for password reset
  
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps or CURL requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true); // allow the request if the origin is in the allowed list
      } else {
        callback(new Error("Not allowed by CORS")); // reject the request if not in the allowed list
      }
    },
    credentials: true,
  })
);

// Serve static files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server running on port ${PORT}`);
});
