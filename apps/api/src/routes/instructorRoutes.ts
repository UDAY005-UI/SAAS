import express, { Router } from "express";
import {
    createCourse,
    addModules,
    addLessons,
    publishCourse,
} from "../controllers/instructorController.js";
import { upload } from "../middlewares/upload.js";

const router: Router = express.Router();

router.post("/create-course", createCourse);
router.post("add-modules", addModules);
router.post(
    "add-lessons",
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    addLessons
);
router.post("publish-course", publishCourse);

export default router;
