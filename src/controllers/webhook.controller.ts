import { Request, Response } from "express";
import { MidtransService } from "../services/midtrans.service";
import { RouterService } from "../services/router.service";

export class WebhookController {
  private midtransService: MidtransService;
  private routerService: RouterService;

  constructor() {
    this.midtransService = new MidtransService();
    this.routerService = new RouterService();
  }

  public handleNotification = async (req: Request, res: Response) => {
    try {
      const notification = req.body;
      console.log(
        "Received notification:",
        JSON.stringify(notification, null, 2),
      );

      // 1. Verify Signature
      const isValid = await this.midtransService.verifySignature(notification);
      if (!isValid) {
        console.error("Invalid signature detected");
        // Return 200 OK to Midtrans even if invalid to stop retries?
        // Or 401 to indicate failure?
        // Usually best to return 4xx so you know something is wrong,
        // but if it's spam, maybe 200. Let's send 401 for security visibility.
        return res.status(401).json({ message: "Invalid signature" });
      }

      // 2. Determine Target
      const targetUrl = this.routerService.getTargetUrl(notification);
      if (!targetUrl) {
        console.error("No target URL found for this notification");
        // We received it but don't know where to send.
        // Return 200 to Midtrans to verify receipt, but log error internally.
        return res
          .status(200)
          .json({ message: "No route match, processed locally" });
      }

      // 3. Forward
      await this.routerService.forwardNotification(targetUrl, notification);
      console.log("Successfully forwarded notification");

      return res.status(200).json({ message: "Notification forwarded" });
    } catch (error) {
      console.error("Error in webhook handler:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
