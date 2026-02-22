require('dotenv').config(); // זה טוען את הקובץ .env לתוך המערכת
const express = require('express');
const cors = require('cors');
const connectDB = require('./DB/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));