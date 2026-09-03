import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import http from "http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";

import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { errorHandler, notFound, requestLogger } from "./middleware/errorMiddleware.js";
import { swaggerDocument } from "./swagger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL,
  "http://localhost:5173",
].filter(Boolean);

function checkOrigin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  callback(new Error("Origine non consentita"));
}

export const app = express();
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: checkOrigin, credentials: true },
});

app.set("trust proxy", 1);
app.set("io", io);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
      },
    },
  }),
);
app.use(cors({ origin: checkOrigin, credentials: true }));
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
app.use(requestLogger);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Troppi tentativi. Riprova tra qualche minuto" },
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/api-docs.json", (req, res) => res.json(swaggerDocument));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/reports", reportRoutes);

// In produzione Express serve anche la build React: frontend e API hanno la stessa origine.
const frontendPath = path.join(__dirname, "../frontend/dist");
if (process.env.NODE_ENV === "production" && existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(frontendPath, "index.html"));
    }
    next();
  });
}

app.use(notFound);
app.use(errorHandler);

function readCookie(cookieHeader, cookieName) {
  const item = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));

  if (!item) return null;
  return decodeURIComponent(item.slice(cookieName.length + 1));
}

// Anche il collegamento Socket.IO accetta soltanto utenti con un cookie JWT valido.
io.use(async (socket, next) => {
  try {
    const token = readCookie(socket.handshake.headers.cookie || "", "token");
    if (!token) return next(new Error("Non autenticato"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name role");
    if (!user) return next(new Error("Utente non trovato"));

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Sessione socket non valida"));
  }
});

io.on("connection", (socket) => {
  socket.emit("socket:ready", { message: "Aggiornamenti real-time attivi" });
});

export async function start() {
  if (!process.env.MONGO_URI) throw new Error("Manca MONGO_URI nel file .env");
  if (!process.env.JWT_SECRET) throw new Error("Manca JWT_SECRET nel file .env");

  mongoose.set("sanitizeFilter", true);
  await mongoose.connect(process.env.MONGO_URI);

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`AulaFix avviato su http://localhost:${port}`);
    console.log(`Swagger su http://localhost:${port}/api-docs`);
  });
}

if (process.argv[1] === __filename) {
  start().catch((error) => {
    console.error("Avvio non riuscito:", error.message);
    process.exit(1);
  });
}
