import QRCode from "qrcode";

const PORT = 3001;

// Read TOTP secret from environment variable
const totpSecret = process.env.DISCORD_TOTP_SECRET;

if (!totpSecret) {
  console.error("❌ Error: DISCORD_TOTP_SECRET environment variable is not set");
  console.error("\nCreate a .env file in the project root with:");
  console.error("DISCORD_TOTP_SECRET=YOUR_BASE32_SECRET");
  process.exit(1);
}

// Generate otpauth URI for TOTP
const otpauthUri = `otpauth://totp/OSRS%20Boss%20Wheel?secret=${totpSecret}&issuer=OSRS%20Boss%20Wheel&algorithm=SHA1&digits=6&period=30`;

console.log(`\n🔐 TOTP Setup Server\n`);
console.log(`Starting server on http://localhost:${PORT}`);
console.log(`Open this URL in your browser to see the QR code\n`);

Bun.serve({
  port: PORT,
  async fetch(req) {
    try {
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri, {
        width: 400,
        margin: 2,
      });

      // Serve HTML page with QR code
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OSRS Boss Wheel - TOTP Setup</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container {
      background: #333;
      border-radius: 12px;
      padding: 3rem;
      max-width: 600px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    h1 {
      color: #FFFF00;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }
    .subtitle {
      color: #aaa;
      margin-bottom: 2rem;
      font-size: 1rem;
    }
    .qr-container {
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 2rem;
    }
    .qr-container img {
      display: block;
      margin: 0 auto;
    }
    .instructions {
      background: #2a2a2a;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    .instructions h2 {
      color: #FFFF00;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    .instructions ol {
      margin-left: 1.5rem;
      line-height: 1.8;
    }
    .instructions li {
      margin-bottom: 0.5rem;
    }
    .secret-box {
      background: #2a2a2a;
      padding: 1rem;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      word-break: break-all;
      border: 2px dashed #555;
    }
    .secret-label {
      color: #FFFF00;
      font-weight: bold;
      margin-bottom: 0.5rem;
      display: block;
    }
    .secret-value {
      color: #0f0;
      font-size: 1.2rem;
      letter-spacing: 2px;
    }
    .warning {
      background: #443300;
      border: 2px solid #FFFF00;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 2rem;
    }
    .warning strong {
      color: #FFFF00;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 TOTP Setup</h1>
    <p class="subtitle">OSRS Boss Wheel - Discord Integration</p>

    <div class="qr-container">
      <img src="${qrCodeDataUrl}" alt="TOTP QR Code" />
    </div>

    <div class="instructions">
      <h2>📱 Setup Instructions</h2>
      <ol>
        <li>Open <strong>1Password</strong>, <strong>Google Authenticator</strong>, or any TOTP app</li>
        <li>Select "Add New Item" or "Scan QR Code"</li>
        <li>Scan the QR code above with your phone's camera</li>
        <li>The app will now generate rotating 6-digit codes every 30 seconds</li>
        <li>Use these codes when posting to Discord from the wheel</li>
      </ol>
    </div>

    <div class="secret-box">
      <span class="secret-label">Manual Entry Secret:</span>
      <div class="secret-value">${totpSecret}</div>
    </div>

    <div class="warning">
      <strong>⚠️ Security Note:</strong> Keep this secret private! Anyone with this secret can generate valid codes.
      This page is only accessible on localhost (your computer).
    </div>
  </div>
</body>
</html>
      `;

      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      return new Response("Error generating QR code", { status: 500 });
    }
  },
});

console.log(`✅ Server running! Press Ctrl+C to stop.\n`);
