import express, { Router } from "express";
import {
    createCourse,
    addModules,
    addLessons,
    publishCourse,
    updateCourse,
    updateModule,
    updateLesson,
    deleteCourse,
    deleteLesson,
    deleteModule,
    getInstructorCourses,
    getInstructorEarnings,
} from "../controllers/instructorController.js";
import { upload } from "../middlewares/upload.js";

const router: Router = express.Router();

router.post("/create-course", createCourse);
router.post("/add-modules", addModules);
router.post(
    "/add-lessons",
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    addLessons
);
router.post("/publish-course", publishCourse);
router.put("/update-course", updateCourse);
router.put("/update-module", updateModule);
router.put("/update-lesson", updateLesson);
router.delete("/delete-course", deleteCourse);
router.delete("/delete-module", deleteModule);
router.delete("/delete-lesson", deleteLesson);
router.get("/instructor-courses", getInstructorCourses);
router.get("/instructor-earnings", getInstructorEarnings);

export default router;
