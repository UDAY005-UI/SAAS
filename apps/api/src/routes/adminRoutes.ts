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
    "/api/admin/users",
    requireAuth(),
    requireRole(["ADMIN"]),
    getAllUserHandler
);
router.delete(
    "api/admin/delete-user/:id",
    requireAuth(),
    requireRole(["ADMIN"]),
    deleteUserHandler
);
router.put(
    "/api/admin/update-user/:id",
    requireAuth(),
    requireRole(["ADMIN"]),
    updateUserHandler
);

export default router;
