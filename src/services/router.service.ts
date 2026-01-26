import axios from "axios";
import _ from "lodash";

export class RouterService {
  private mapping: Record<string, string>;

  constructor() {
    const mappingStr = process.env.TARGET_MAPPING || "{}";
    try {
      this.mapping = JSON.parse(mappingStr);
    } catch (e) {
      console.error("Failed to parse TARGET_MAPPING env var", e);
      this.mapping = {};
    }
  }

  public getTargetUrl(notification: any): string | null {
    // Look for custom_field1
    // Depending on how it's sent, it might be at root or inside another object.
    // Usually in Snap, it's consistent.
    // User confirmed usage of 'custom_field1'

    const identifier = _.get(notification, "custom_field1");

    if (!identifier) {
      console.warn("No identifier found in custom_field1");
      return null;
    }

    const targetUrl = this.mapping[identifier];

    if (!targetUrl) {
      console.warn(`No target mapping found for identifier: ${identifier}`);
      return null;
    }

    return targetUrl;
  }

  public async forwardNotification(url: string, payload: any): Promise<any> {
    try {
      console.log(`Forwarding webhook to ${url}`);
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-By": "Midtrans-Proxy",
        },
        timeout: 10000, // 10s timeout
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error forwarding to ${url}:`, error.message);
      throw error;
    }
  }
}
