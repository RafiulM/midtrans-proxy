import "dotenv/config"; // Load env vars before anything else
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import webhookRoutes from "./routes/webhook.routes";

// dotenv.config() is now handled by the import above

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  morgan(
    "[:date[iso]] :method :url :status :res[content-length] - :response-time ms",
  ),
);
app.use(bodyParser.json());

// Routes
app.use("/webhook", webhookRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Midtrans Proxy is running");
});

// Mock Target for testing
app.post("/mock-target", (req, res) => {
  console.log("Mock Target Received:", JSON.stringify(req.body, null, 2));
  res
    .status(200)
    .json({ status: "success", message: "Mock target received notification" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
