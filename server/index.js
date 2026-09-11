import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import { connectDB } from "./config/db.js";
import Router from "./routes/routes.js";
import cors from "cors";

dotenv.config();

dns.setServers([
    "1.1.1.1",
    "8.8.8.8",
]);

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());

app.use("/", Router);

app.get("/", (req, res) => {
    res.send("Hello from server");
});

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();