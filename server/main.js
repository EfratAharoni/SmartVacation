import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./DB/db.js";
import * as userController from "./controllers/User.js";
import * as attractionController from "./controllers/Attraction.js";
import * as dealController from "./controllers/Deal.js";
import * as destinationInfoController from "./controllers/DestinationInfo.js";
import * as orderController from "./controllers/Order.js";
import * as aiController from "./controllers/AI.js";
import authenticateToken from "./middleware/auth.js";
import adminOnly from "./middleware/adminOnly.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

const port = process.env.PORT || 5000;

const allowedOrigins = [
  "https://smartvacation.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: "10kb" }));

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "יותר מדי בקשות, נסה שוב בעוד 15 דקות" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "יותר מדי ניסיונות התחברות, נסה שוב בעוד 15 דקות" },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "יותר מדי בקשות AI, נסה שוב בעוד דקה" },
});

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "יותר מדי ניסיונות שינוי סיסמה, נסה שוב בעוד 15 דקות" },
});

app.use(generalLimiter);

// Users Routes
app.get("/api/users", authenticateToken, adminOnly, userController.getUsers);
app.get("/api/users/me", authenticateToken, userController.getMe);
app.post("/api/users/login", authLimiter, userController.login);
app.post("/api/users/add", authLimiter, userController.createUser);
app.post("/api/users/addMany", authenticateToken, adminOnly, userController.addManyUsers);
app.delete("/api/users/remove/:id", authenticateToken, adminOnly, userController.removeUser);
app.delete("/api/users/removeAll", authenticateToken, adminOnly, userController.removeAllUsers);
app.put("/api/users/update/:id", authenticateToken, adminOnly, userController.updateUser);
app.get("/api/users/:id", authenticateToken, adminOnly, userController.getUser);
app.put("/api/users/change-password", authenticateToken, passwordLimiter, userController.changePassword);

// Attraction Routes
app.get("/api/attractions", attractionController.getAttractions);
app.get("/api/attractions/:id", attractionController.getAttraction);
app.post("/api/attractions/add", authenticateToken, adminOnly, attractionController.createAttraction);
app.post("/api/attractions/addMany", authenticateToken, adminOnly, attractionController.addManyAttractions);
app.delete("/api/attractions/:id", authenticateToken, adminOnly, attractionController.removeAttraction);
app.put("/api/attractions/:id", authenticateToken, adminOnly, attractionController.updateAttraction);

// Destination Info Routes
app.get("/api/destination-info", destinationInfoController.getDestinationInfos);
app.post("/api/destination-info/add", authenticateToken, adminOnly, destinationInfoController.createDestinationInfo);
app.post("/api/destination-info/addMany", authenticateToken, adminOnly, destinationInfoController.addManyDestinationInfos);
app.put("/api/destination-info/:id", authenticateToken, adminOnly, destinationInfoController.updateDestinationInfo);
app.delete("/api/destination-info/:id", authenticateToken, adminOnly, destinationInfoController.removeDestinationInfo);

// Deals Routes
app.get("/api/deals", dealController.getDeals);
app.get("/api/deals/:id", dealController.getDeal);
app.post("/api/deals/add", authenticateToken, adminOnly, dealController.createDeal);
app.post("/api/deals/addMany", authenticateToken, adminOnly, dealController.addManyDeals);
app.put("/api/deals/:id", authenticateToken, adminOnly, dealController.updateDeal);
app.delete("/api/deals/:id", authenticateToken, adminOnly, dealController.removeDeal);

// Order Routes
app.post("/api/orders", authenticateToken, orderController.createOrder);
app.get("/api/orders/my", authenticateToken, orderController.getUserOrders);

// AI Routes — requires login + rate limit
app.post("/api/ai/search", authenticateToken, aiLimiter, aiController.aiSearch);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
  }
};

startServer();
