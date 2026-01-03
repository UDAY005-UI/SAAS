import express, { Router } from "express";
import { requireAuth } from "@clerk/express";
import {
    getProfile,
    getPurchasedCourses,
    updateProfile,
} from "../controllers/studentController.js";
import { upload } from "../middlewares/upload.js";

const router: Router = express.Router();

router.get("/profile", requireAuth(), getProfile);
router.put(
    "/update-profile",
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    updateProfile
);
router.get("/courses", requireAuth(), getPurchasedCourses);

export default router;
