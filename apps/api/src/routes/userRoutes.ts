import express, { Router } from "express";
import {
    createProfile,
    createUser,
    setRole,
} from "../controllers/userController.js";
import { requireRole } from "../middlewares/requireRole.js";
import { requireAuth } from "@clerk/express";

const router: Router = express.Router();

router.post("/create", createUser);
router.post("/set-role", setRole);
router.post("/assign-role", requireAuth(), requireRole(["ADMIN"]), setRole);
router.post("/create-profile", createProfile);

export default router;
