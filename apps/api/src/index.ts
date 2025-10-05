import express, { Express, Request, Response } from "express";
import cors from "cors";
import { requireAuth } from "@clerk/express";
import userRoutes from "./routes/userRoutes.js";

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

app.get("/api/protected", requireAuth(), (req: Request, res: Response) => {
    res.json({ message: "Authenticated route" });
});

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});

export default app;
