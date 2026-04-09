import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./DB/db.js";
import * as userController from "./controllers/User.js";
import * as attractionController from "./controllers/Attraction.js";
import * as dealController from "./controllers/Deal.js";
import * as destinationInfoController from "./controllers/DestinationInfo.js";
import * as orderController from "./controllers/Order.js";
import authenticateToken from "./middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, ".env") });
}

const app = express();

const port = process.env.PORT || 5000;

const allowedOrigins = [
  "https://smartvacation.onrender.com",
  "http://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

// Users Routes
app.get("/api/users", userController.getUsers);
app.get("/api/users/:id", userController.getUser);
app.post("/api/users/add", userController.createUser);
app.post("/api/users/addMany", userController.addManyUsers);
app.delete("/api/users/remove/:id", userController.removeUser);
app.delete("/api/users/removeAll", userController.removeAllUsers);
app.put("/api/users/update/:id", userController.updateUser);
app.post("/api/users/login", userController.login);
app.get("/api/users/me", authenticateToken, userController.getMe);
app.put("/api/users/change-password", userController.changePassword);

// Attraction Routes
app.get("/api/attractions", attractionController.getAttractions);
app.get("/api/attractions/:id", attractionController.getAttraction);
app.post("/api/attractions/add", attractionController.createAttraction);
app.post("/api/attractions/addMany", attractionController.addManyAttractions);
app.delete("/api/attractions/:id", attractionController.removeAttraction);
app.put("/api/attractions/:id", attractionController.updateAttraction);

// Destination Info Routes
app.get("/api/destination-info", destinationInfoController.getDestinationInfos);
app.post("/api/destination-info/add", destinationInfoController.createDestinationInfo);
app.post("/api/destination-info/addMany", destinationInfoController.addManyDestinationInfos);
app.put("/api/destination-info/:id", destinationInfoController.updateDestinationInfo);
app.delete("/api/destination-info/:id", destinationInfoController.removeDestinationInfo);

// Deals Routes
app.get("/api/deals", dealController.getDeals);
app.get("/api/deals/:id", dealController.getDeal);
app.post("/api/deals/add", dealController.createDeal);
app.post("/api/deals/addMany", dealController.addManyDeals);
app.put("/api/deals/:id", dealController.updateDeal);
app.delete("/api/deals/:id", dealController.removeDeal);

// Order Routes
app.post("/api/orders", authenticateToken, orderController.createOrder);
app.get("/api/orders/my", authenticateToken, orderController.getUserOrders);

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