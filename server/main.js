import "dotenv/config"; // טוען את המשתנים מקובץ ה-.env לסביבת העבודה
import express from "express";
import cors from "cors";
import connectDB from "./DB/db.js";
import * as userController from "./controllers/User.js";
import * as attractionController from "./controllers/Attraction.js";

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Users Routes
app.get("/users", userController.getUsers);
app.get("/users/:id", userController.getUser);
app.post("/users/add", userController.createUser);
app.post("/users/addMany", userController.addManyUsers);
app.delete("/users/remove/:id", userController.removeUser);
app.delete("/users/removeAll", userController.removeAllUsers);
app.put("/users/update/:id", userController.updateUser);
app.post("/users/login", userController.login);
app.put("/users/change-password", userController.changePassword);

//attraction 
app.get("/attractions", attractionController.getAttractions);
app.get("/attractions/:id", attractionController.getAttraction);
app.post("/attractions/add", attractionController.createAttraction);
app.post("/attractions/addMany", attractionController.addManyAttractions);
app.delete("/attractions/:id", attractionController.removeAttraction);
app.put("/attractions/:id", attractionController.updateAttraction);

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