import express, { Router } from "express";
import { createOrder, captureOrder } from "../controllers/paymentController.js";

const router: Router = express.Router();

router.post("/create-order/:courseId", createOrder);
router.post("/capture-order", captureOrder);

export default router;
