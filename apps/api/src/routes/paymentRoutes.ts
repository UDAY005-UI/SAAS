import express, { Router } from "express";
import {
    createOrder,
    captureOrder,
    sendPayout,
    verifyPayment,
} from "../controllers/paymentController.js";

const router: Router = express.Router();

router.post("/create-order", createOrder);
router.post("/capture-order", captureOrder);
router.post("/payout", sendPayout);
router.post("/verify-payment", verifyPayment);

export default router;
