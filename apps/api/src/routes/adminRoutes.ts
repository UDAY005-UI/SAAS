import express, { Router } from "express";
import { requireAuth } from "@clerk/express";
import { requireRole } from "../middlewares/requireRole.js";
import {
    getAllUserHandler,
    deleteUserHandler,
    updateUserHandler,
} from "../controllers/adminController.js";

const router: Router = express.Router();

router.get(
    "/admin/users",
    requireAuth(),
    requireRole(["ADMIN"]),
    getAllUserHandler
);
router.delete(
    "/admin/delete-user/:id",
    requireAuth(),
    requireRole(["ADMIN"]),
    deleteUserHandler
);
router.put(
    "/admin/update-user/:id",
    requireAuth(),
    requireRole(["ADMIN"]),
    updateUserHandler
);

export default router;
