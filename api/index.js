const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();
const cors = require('cors');
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const multer = require("multer");
const path = require("path");

// Load environment variables from .env file
dotenv.config();

// Database connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
});

// Serve static files from public/images directory
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images"); // Destination folder for file uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname); // Unique filename
    },
});

// Multer middleware for file upload
const upload = multer({ storage });

// Handle file upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        return res.status(200).json(req.file.filename);
    } catch (err) {
        console.error("File upload error:", err);
        return res.status(500).json({ error: "File upload failed" });
    }
});

// Other routes
app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);

// Start the server
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
