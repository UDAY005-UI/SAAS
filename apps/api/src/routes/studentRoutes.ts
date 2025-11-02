import express, { Router } from "express";
import { requireAuth } from "@clerk/express";
import {
    getProfile,
    getPurchasedCourses,
    updateProfile,
} from "../controllers/studentController.js";

const router: Router = express.Router();

router.get("/profile", requireAuth(), getProfile);
router.put("/update-profile", requireAuth(), updateProfile);
router.get("/courses", requireAuth(), getPurchasedCourses);

export default router;
