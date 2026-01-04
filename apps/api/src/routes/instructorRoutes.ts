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
    becomeInstructor,
    getInstructorProfile,
    updateInstructorProfile,
} from "../controllers/instructorController.js";
import { upload } from "../middlewares/upload.js";

const router: Router = express.Router();

router.post(
    "/create-course",
    upload.fields([{ name: "thumbnail", maxCount: 1 }]),
    createCourse
);
router.post("/:courseId/add-modules", addModules);
router.post(
    "/:moduleId/add-lessons",
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    addLessons
);
router.post(
    "/becomeInstructor",
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    becomeInstructor
);
router.post("/:courseId/publish-course", publishCourse);
router.put(
    "/update-profile",
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    updateInstructorProfile
);
router.put(
    "/update-course/:courseId",
    upload.fields([{ name: "thumbnail", maxCount: 1 }]),
    updateCourse
);
router.put(
    "/update-module/:moduleId",
    upload.fields([{ name: "thumbnail", maxCount: 1 }]),
    updateModule
);
router.put(
    "/update-lesson/lessonId",
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    updateLesson
);
router.delete("/:courseId/delete-course", deleteCourse);
router.delete("/:moduleId/delete-module", deleteModule);
router.delete("/:lessonId/delete-lesson", deleteLesson);
router.get("/instructor-courses", getInstructorCourses);
router.get("/instructor-earnings", getInstructorEarnings);
router.get("/getProfile", getInstructorProfile);

export default router;
