import express, { Router } from "express";
import { getAvailableCourses } from "../controllers/courseController.js";

const router: Router = express.Router();

router.get("/courses", getAvailableCourses);

export default router;
