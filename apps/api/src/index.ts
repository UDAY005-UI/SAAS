import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
dotenv.config();

const PORT = 5500;
const app: Express = express();

app.use(express.json());

const allowedOrigins = ["http://localhost:3000", process.env.FRONTEND_URL];

const corsOptions = {
    origin: (origin: string | undefined, callback: Function) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, origin);
        }

        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/instructors", instructorRoutes);

app.get("/api/protected", requireAuth(), (req: Request, res: Response) => {
    res.json({ message: "Authenticated route" });
});

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});

export default app;
