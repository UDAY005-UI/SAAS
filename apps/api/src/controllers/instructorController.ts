import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import cloudinary from "../services/cloudinaryServices.js";
import fs from "fs";

export const createCourse = async (req: Request, res: Response) => {
    const { instructorId, title, description, price, category } = req.body;
    if (!instructorId || !title || !price || !category || !description)
        return res.status(400).json({ message: "Provide all the details" });

    try {
        const newCourse = await prisma.course.create({
            data: {
                title,
                description,
                price,
                category,
                instructorId,
            },
        });
        res.status(201).json({
            message: "Course created successfully",
            course: newCourse,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Couldn't create course" });
    }
};

export const addModules = async (req: Request, res: Response) => {
    const { courseId, title, description } = req.body;
    if (!courseId || !title)
        return res.status(401).json({ message: "Provide all the details" });

    const maxOrder = await prisma.module.aggregate({
        where: { courseId },
        _max: { order: true },
    });
    try {
        const newModule = await prisma.module.create({
            data: {
                title,
                description,
                order: (maxOrder._max.order ?? 0) + 1,
                courseId,
            },
        });
        res.status(200).json({ message: "module added", module: newModule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Couldn't add the module" });
    }
};

export const addLessons = async (req: Request, res: Response) => {
    const { moduleId, title, duration } = req.body;
    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    };

    const videoFile = files?.video?.[0];
    const thumbnailFile = files?.thumbnail?.[0];

    if (!moduleId || !title || !videoFile)
        return res.status(400).json({ message: "Missing required fields" });

    try {
        const videoUpload = await cloudinary.uploader.upload(videoFile.path, {
            resource_type: "video",
            folder: "lessons/videos",
        });

        let thumbnailUrl: string | null = null;

        if (thumbnailFile) {
            const thumbUpload = await cloudinary.uploader.upload(
                thumbnailFile.path,
                {
                    folder: "lessons/thumbnails",
                }
            );
            thumbnailUrl = thumbUpload.secure_url;
            fs.unlinkSync(thumbnailFile.path);
        } else {
            const thumbAuto = cloudinary.url(videoUpload.public_id + ".jpg", {
                resource_type: "video",
                format: "jpg",
                width: "300",
                height: 200,
                crop: "fill",
            });
            thumbnailUrl = thumbAuto;
        }

        fs.unlinkSync(videoFile.path);

        const maxOrder = await prisma.lesson.aggregate({
            where: { moduleId },
            _max: { order: true },
        });

        const lesson = await prisma.lesson.create({
            data: {
                moduleId,
                title,
                duration: parseInt(duration) || 0,
                order: (maxOrder._max.order ?? 0) + 1,
                contentUrl: videoUpload.secure_url,
                thumbnailUrl,
            },
        });

        return res.status(201).json({
            message: "Lesson added successfully",
            lesson,
        });
    } catch (err) {
        console.error("Error adding lesson", err);
        return res.status(500).json({ message: "Failed to add lesson" });
    }
};

export const publishCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.body;
        const user = await prisma.user.findUnique({
            where: { clerkId: req.auth.userId! },
        });
        const instructorId = user?.id;

        if (!courseId)
            return res.status(400).json({ message: "Course ID required" });

        const course = await prisma.course.findFirst({
            where: { id: courseId, instructorId },
            include: { modules: { include: { lessons: true } } },
        });

        if (!course)
            return res.status(404).json({ message: "Course not found" });

        const hasModules = course.modules.length > 0;
        const hasLessons = course.modules.some((m) => m.lessons.length > 0);
        const hasPrice = course.price != null && course.price.toNumber() >= 0;

        if (!hasModules || !hasLessons || !hasPrice) {
            return res
                .status(400)
                .json({
                    message:
                        "Course incomplete. Add modules, lessons, and price.",
                });
        }

        const publishedCourse = await prisma.course.update({
            where: { id: courseId },
            data: { published: true },
        });

        res.status(200).json(publishedCourse);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Couldn't publish the course" });
    }
};
