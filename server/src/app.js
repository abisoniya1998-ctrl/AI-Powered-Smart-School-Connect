import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import homeworkRoutes from "./routes/homeworkRoutes.js";  
import messageRoutes from "./routes/messageRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Smart School Connect API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/homework", homeworkRoutes);

app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use(errorHandler);

export default app;