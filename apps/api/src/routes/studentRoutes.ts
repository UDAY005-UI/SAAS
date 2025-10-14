import express, { Router } from "express";
import {
    getProfile,
    getPurchasedCourses,
    updateProfile,
} from "../controllers/studentController.js";

const router: Router = express.Router();

router.get("/student/profile", getProfile);
router.put("/student/update-profile", updateProfile);
router.get("/student/courses", getPurchasedCourses);

export default router;
