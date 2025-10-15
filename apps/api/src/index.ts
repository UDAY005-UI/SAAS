import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { requireAuth } from "@clerk/express";
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

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use("/api/Users", userRoutes);
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
