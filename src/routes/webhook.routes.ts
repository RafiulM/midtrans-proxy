import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller";

const router = Router();
const webhookController = new WebhookController();

// Use bind to ensure 'this' context is preserved
router.post("/", webhookController.handleNotification.bind(webhookController));

export default router;
