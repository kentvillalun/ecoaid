import express from "express";
import { config } from "dotenv"
import "dotenv/config";
import { connectDB, disconnectDB } from './config/db.js'
import cors from "cors";
import cookieParser from "cookie-parser";


import authRoute from "./routes/auth.route.js"
import dashboardRoute from "./routes/dashboard.route.js"
import pickupRequestRoute from "./routes/pickup-request.route.js"
import redemptionRoute from "./routes/redemption.route.js"
import residentRoute from "./routes/resident.route.js"
import materialRoute from "./routes/material.route.js"

config();
connectDB();

const app = express();



// API routes
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // keep this only if you use cookies/sessions
}));

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use("/auth", authRoute)
app.use("/dashboard", dashboardRoute)
app.use("/pickup-requests", pickupRequestRoute)
app.use("/redemption", redemptionRoute)
app.use("/resident", residentRoute)
app.use("/material", materialRoute)




const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log("Server running on " + PORT)
})


// Handle unhandled promise rejections (e.g., databse connection errors)
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

// Handle uncaught exceptions 
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exceptions:", err);
    await disconnectDB();
    process.exit(1);
});

// Graceful shutdown 
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});