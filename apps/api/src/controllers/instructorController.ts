import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import cloudinary from "../services/cloudinaryServices.js";
import fs from "fs";

export const createCourse = async (req: Request, res: Response) => {
    const { title, description, price, category } = req.body;
    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    };
    const thumbnailFile = files?.thumbnail?.[0];

    const user = await prisma.user.findUnique({
        where: { clerkId: req.auth.userId! },
    });
    const instructorId = user?.id;

    if (!instructorId || !title || !price || !category || !description)
        return res.status(400).json({ message: "Provide all the details" });

    try {
        let thumbnailUrl: string | null = null;

        if (thumbnailFile) {
            const thumbUpload = await cloudinary.uploader.upload(
                thumbnailFile.path,
                {
                    folder: "course/thumbnails",
                }
            );
            thumbnailUrl = thumbUpload.secure_url;
            fs.unlinkSync(thumbnailFile.path);
        }

        const newCourse = await prisma.course.create({
            data: {
                title,
                description,
                price,
                category,
                instructorId,
                thumbnailUrl,
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
            return res.status(400).json({
                message: "Course incomplete. Add modules, lessons, and price.",
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

export const updateCourse = async (req: Request, res: Response) => {
    const { courseId, title, description, price, category } = req.body;
    const user = await prisma.user.findUnique({
        where: { clerkId: req.auth.userId! },
    });
    const instructorId = user?.id;

    if (!instructorId || !courseId)
        return res
            .status(400)
            .json({ message: "Instructor and course ID must be provided" });

    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (course?.instructorId === instructorId) {
            const updatedCourse = await prisma.course.update({
                where: { id: courseId },
                data: {
                    title,
                    description,
                    price,
                    category,
                },
            });
            return res.status(200).json({
                message: "course updated successfully",
                course: updatedCourse,
            });
        } else {
            return res.status(404).json({ message: "Wrong instructor id" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Couldn't update your course" });
    }
};

export const updateModule = async (req: Request, res: Response) => {
    const { courseId, moduleId, title, description } = req.body;

    if (!moduleId || !courseId)
        return res.status(404).json({ message: "all fields are required" });

    try {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
        });

        if (module?.courseId === courseId) {
            const updatedModule = await prisma.module.update({
                where: { id: moduleId },
                data: {
                    title,
                    description,
                },
            });
            return res.status(200).json({
                message: "Module successfully updated",
                module: updatedModule,
            });
        } else {
            return res.status(404).json({ message: "Couldn't update module" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateLesson = async (req: Request, res: Response) => {
    const { moduleId, lessonId, title, duration } = req.body;
    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    };

    const videoFile = files?.video?.[0];
    const thumbnailFile = files.thumbnail?.[0];

    if (!moduleId || !lessonId)
        return res.status(400).json({ message: "Missing required fields" });

    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson)
            return res.status(404).json({ message: "Lesson not found" });

        let contentUrl: string | null = null;
        let thumbnailUrl: string | null = null;

        if (lesson.moduleId !== moduleId)
            return res
                .status(404)
                .json({ message: "You cannot update this lesson" });

        const data: any = {
            title,
            duration: parseInt(duration) || 0,
        };

        if (videoFile) {
            const videoUpload = await cloudinary.uploader.upload(
                videoFile?.path,
                {
                    resource_type: "video",
                    folder: "lessons/videos",
                }
            );
            data.contentUrl = videoUpload.secure_url;
            await fs.promises.unlink(videoFile.path);
        }
        if (thumbnailFile) {
            const thumbUpload = await cloudinary.uploader.upload(
                thumbnailFile.path,
                {
                    folder: "lessons/thumbnails",
                }
            );
            data.thumbnailUrl = thumbUpload.secure_url;
            fs.promises.unlink(thumbnailFile.path);
        }

        const updatedLesson = await prisma.lesson.update({
            where: { id: lessonId },
            data,
        });
        return res.status(200).json({
            message: "Lesson updated successfully",
            lesson: updatedLesson,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteCourse = async (req: Request, res: Response) => {
    const { courseId } = req.body;
    const user = await prisma.user.findUnique({
        where: { clerkId: req.auth.userId! },
    });
    const instructorId = user?.id;
    if (!instructorId || !courseId)
        return res.status(400).json({ message: "all fields are required" });

    try {
        const course = await prisma.course.findUnique({ where: courseId });
        if (!course)
            return res.status(400).json({ message: "Course not found" });

        if (course.instructorId !== instructorId)
            return res
                .status(403)
                .json({ message: "You cannot delete this course" });

        const modules = await prisma.module.findMany({ where: { courseId } });
        for (const mod of modules) {
            await prisma.lesson.deleteMany({ where: { moduleId: mod.id } });
        }

        await prisma.module.deleteMany({ where: { courseId } });

        await prisma.course.delete({ where: { id: courseId } });

        return res.status(200).json({
            message: "Course and all related modules/lessons have been deleted",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteModule = async (req: Request, res: Response) => {
    const { moduleId } = req.body;
    const user = await prisma.user.findUnique({
        where: { clerkId: req.auth.userId! },
    });
    const instructorId = user?.id;

    if (!instructorId || !moduleId)
        return res.status(400).json({ message: "all fields are required" });

    try {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
        });
        if (!module)
            return res.status(404).json({ message: "Module not found" });

        const course = await prisma.course.findUnique({
            where: { id: module.courseId },
        });
        if (!course || course.instructorId !== instructorId)
            return res
                .status(403)
                .json({ message: "You cannot delete this module" });

        await prisma.lesson.deleteMany({ where: { moduleId } });

        await prisma.module.delete({ where: { id: moduleId } });

        return res.status(200).json({ message: "Module deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteLesson = async (req: Request, res: Response) => {
    const { lessonId } = req.body;
    const user = await prisma.user.findUnique({
        where: { clerkId: req.auth.userId! },
    });
    const instructorId = user?.id;

    if (!instructorId || !lessonId)
        return res.status(400).json({ message: "All fields are required" });

    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });
        if (!lesson)
            return res.status(404).json({ message: "Lesson not found" });

        const module = await prisma.module.findUnique({
            where: { id: lesson.moduleId },
        });
        if (!module)
            return res.status(404).json({ message: "Module not found" });

        const course = await prisma.course.findUnique({
            where: { id: module.courseId },
        });
        if (!course || course.instructorId !== instructorId)
            return res
                .status(403)
                .json({ message: "You cannot delete this lesson" });

        await prisma.lesson.delete({ where: { id: lessonId } });

        res.status(200).json({ message: "Lesson delete successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getInstructorCourses = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { clerkId: req.auth.userId! },
    });
    const instructorId = user?.id;

    if (!instructorId)
        return res.status(400).json({ message: "Instructor not found" });

    try {
        const courses = await prisma.course.findMany({
            where: { instructorId },
            include: {
                modules: {
                    include: { lessons: true },
                },
            },
        });

        const response = courses.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category,
            price: c.price.toNumber(),
            published: c.published,
            modulesCount: c.modules.length,
            lessonsCount: c.modules.reduce(
                (acc, m) => acc + m.lessons.length,
                0
            ),
        }));

        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getInstructorEarnings = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { clerkId: req.auth.userId! },
    });
    const instructorId = user?.id;
    if (!instructorId)
        return res.status(400).json({ message: "Instructor not found" });

    try {
        const earnings = await prisma.payment.aggregate({
            where: { course: { instructorId } },
            _sum: { amount: true },
        });

        res.status(200).json({ earnings: earnings._sum.amount ?? 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
