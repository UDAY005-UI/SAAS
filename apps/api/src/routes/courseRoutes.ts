import express, { Router } from "express";
import {
    getAvailableCourses,
    getUnpublishedCourses,
    getModule,
    getLesson,
} from "../controllers/courseController.js";

const router: Router = express.Router();

router.get("/getCourses", getAvailableCourses);
router.get("/get-unpublished-courses", getUnpublishedCourses);
router.get("/:courseId/modules", getModule);
router.get("/:moduleId/lessons", getLesson);

export default router;
