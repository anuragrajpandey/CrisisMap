const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const responderRoutes = require("./routes/responderRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/responders", responderRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "CrisisMap Backend is running"
    });
});

// MongoDB Connection
const startServer = () => {
    const port = process.env.PORT || 5000;

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crisismap";

mongoose.connect(mongoUri)
    .then(() => {
        console.log("MongoDB Connected");
        startServer();
    })
    .catch((error) => {
        console.warn("MongoDB Connection Error:", error.message);
        console.warn("Starting server without MongoDB connection. Database-backed routes will not work until MongoDB is available.");
        startServer();
    });