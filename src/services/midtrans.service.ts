import { Snap } from "midtrans-client";
import crypto from "crypto";

export class MidtransService {
  private snap: any;
  private serverKey: string;

  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    this.snap = new Snap({
      isProduction: isProduction,
      serverKey: this.serverKey,
      clientKey: "client-key",
    });
  }

  /**
   * Verifies the notification signature.
   * For Snap Webhooks, the signature is SHA512(order_id+status_code+gross_amount+ServerKey)
   */
  public async verifySignature(notification: any): Promise<boolean> {
    try {
      const { signature_key, order_id, status_code, gross_amount } =
        notification;

      if (!signature_key || !order_id || !status_code || !gross_amount) {
        console.error("Missing required fields for signature verification");
        return false;
      }

      // Ensure we use the latest env var or constructor key
      const serverKey = this.serverKey || process.env.MIDTRANS_SERVER_KEY || "";
      const rawString = `${order_id}${status_code}${gross_amount}${serverKey}`;

      const expectedSignature = crypto
        .createHash("sha512")
        .update(rawString)
        .digest("hex");

      return signature_key === expectedSignature;
    } catch (error) {
      console.error("Error verifying signature:", error);
      return false;
    }
  }
}
