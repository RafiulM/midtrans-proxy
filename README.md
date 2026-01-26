# Midtrans Webhook Proxy

A secure proxy for Midtrans webhooks that validates signatures and routes notifications to downstream applications based on a custom identifier.

## Features

- **Secure Verification**: Validates the `signature_key` from Midtrans (SHA512 of `order_id` + `status_code` + `gross_amount` + `server_key`) before processing.
- **Dynamic Routing**: Inspects the incoming webhook payload for a matching identifier (default: `custom_field1`) and forwards the request to the mapped destination.
- **Detailed Logging**: Logs incoming requests, verification status, and forwarding results with timestamps and response times.

## Prerequisites

- Node.js (v14 or higher)
- A Midtrans Account (Sandbox or Production)

## Installation

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    cd midtrans-proxy
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

1.  Copy the example environment file:

    ```bash
    cp .env.example .env
    ```

2.  Edit `.env` and configure the following variables:

    | Variable                 | Description                                                             | Example                                                       |
    | ------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------- |
    | `PORT`                   | Port for the proxy server to listen on.                                 | `5556`                                                        |
    | `MIDTRANS_SERVER_KEY`    | Your Midtrans Server Key (found in Dashboard > Settings > Access Keys). | `SB-Mid-server-xxxxxxxxx`                                     |
    | `MIDTRANS_IS_PRODUCTION` | Set to `true` for Production, `false` for Sandbox.                      | `false`                                                       |
    | `TARGET_MAPPING`         | JSON object mapping identifiers to target Webhook URLs.                 | `{"rekaskill": "https://api.rekaskill.com/midtrans/webhook"}` |

## Midtrans Dashboard Setup

To receive webhooks, you must configure the Notification URL in your Midtrans Dashboard.

1.  Login to [Midtrans Dashboard](https://dashboard.midtrans.com) (Sandbox or Production).
2.  Go to **Settings** > **Configuration**.
3.  Locate **Notification Configuration**.
4.  Add your proxy's URL to the **Notification URL** field:
    ```
    https://<your-proxy-domain.com>/webhook
    ```
    _Note: If testing locally, use a service like ngrok to expose your localhost (e.g., `https://xxxx.ngrok.io/webhook`)._

## How it Works

1.  **Transaction Creation**: When creating a Snap transaction in your app, send a custom identifier in `custom_field1` (or whichever field you configured logic for, currently `custom_field1` is hardcoded).
    ```json
    {
      "transaction_details": {
        "order_id": "order-101",
        "gross_amount": 10000
      },
      "custom_field1": "rekaskill"
    }
    ```
2.  **Notification**: Midtrans sends a POST request to this proxy at `/webhook`.
3.  **Verification**: The proxy calculates the SHA512 signature and compares it with the `signature_key` in the payload.
4.  **Routing**:
    - The proxy reads `custom_field1` from the payload (e.g., "rekaskill").
    - It checks `TARGET_MAPPING` in `.env` for the URL associated with "rekaskill".
5.  **Forwarding**: If a match is found, the verified payload is forwarded to the target URL.

## Development

- Start in development mode (auto-reload):
  ```bash
  npm run dev
  ```
- Build and start for production:
  ```bash
  npm run build
  npm start
  ```
