import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { verifyAccessToken } from "./utils/jwt.util.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO Setup
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST","PUT","DELETE"],
  },
});

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = verifyAccessToken(token);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role || "learner";
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(
    `User connected: ${socket.userId} (${socket.userRole}) - Socket ID: ${socket.id}`
  );

  // Join user-specific room
  const roomId = `user_${socket.userId}_${socket.userRole}`;
  socket.join(roomId);
  console.log(`User joined room: ${roomId}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId} - Socket ID: ${socket.id}`);
  });
});

// Make io accessible to controllers via req
app.set("io", io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: false, // Disable in development, enable in production
  }),
);
app.use(mongoSanitize());

// Rate Limiting
// const limiter = rateLimit({
//   windowMs: 30 * 60 * 1000,
//   max: 1000000, // Increased limit for development
//   message: "Too many requests from this IP, please try again later.",
// });
// app.use("/api/", limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      process.env.CLIENT_URL,
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import instituteRoutes from "./routes/institute.routes.js";
import employerRoutes from "./routes/employer.routes.js";
import LearnerRoutes from "./routes/learner.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/learner", LearnerRoutes);
app.use("/api/v1/institute", instituteRoutes);
app.use("/api/v1/employer", employerRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(
    `CORS enabled for: ${process.env.CLIENT_URL || "http://localhost:3000"}`,
  );
});

export { io };
