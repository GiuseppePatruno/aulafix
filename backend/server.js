import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import path from "path";
import { existsSync } from "fs";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { swaggerDocument } from "./swagger.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("io", io);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

const frontendPath = path.resolve("../frontend/dist");
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

async function start() {
  if (!process.env.MONGO_URI) throw new Error("Manca MONGO_URI nel file .env");
  if (!process.env.JWT_SECRET) throw new Error("Manca JWT_SECRET nel file .env");

  await mongoose.connect(process.env.MONGO_URI);

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`AulaFix avviato su http://localhost:${port}`);
    console.log(`Swagger su http://localhost:${port}/api-docs`);
  });
}

start().catch((error) => {
  console.error("Avvio non riuscito:", error.message);
  process.exit(1);
});
