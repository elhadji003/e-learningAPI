const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const uplaodImg = require("./controllers/imageController")
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/storage", uplaodImg);

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 8765;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
