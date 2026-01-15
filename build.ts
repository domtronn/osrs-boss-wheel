import { mkdir, cp } from "fs/promises";

// Validate required environment variables
const requiredEnvVars = [
  "DISCORD_WEBHOOK_ID",
  "DISCORD_WEBHOOK_TOKEN",
  "DISCORD_TOTP_SECRET",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("❌ Build failed: Missing required environment variables:");
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error("\nCreate a .env file in the project root with:");
  console.error("DISCORD_WEBHOOK_ID=YOUR_DISCORD_WEBHOOK_ID");
  console.error("DISCORD_WEBHOOK_TOKEN=YOUR_DISCORD_WEBHOOK_TOKEN");
  console.error("DISCORD_TOTP_SECRET=YOUR_BASE32_SECRET");
  process.exit(1);
}

console.log("✅ Environment variables validated");

// Build the TypeScript app
const result = await Bun.build({
  entrypoints: ["./src/app.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  minify: true,
  sourcemap: "external",
  define: {
    "process.env.DISCORD_WEBHOOK_ID": JSON.stringify(process.env.DISCORD_WEBHOOK_ID || ""),
    "process.env.DISCORD_WEBHOOK_TOKEN": JSON.stringify(process.env.DISCORD_WEBHOOK_TOKEN || ""),
    "process.env.DISCORD_TOTP_SECRET": JSON.stringify(process.env.DISCORD_TOTP_SECRET || ""),
  },
});

if (!result.success) {
  console.error("Build failed");
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

// Copy public folder
await mkdir("./dist", { recursive: true });
await cp("./public", "./dist", { recursive: true });

// Update HTML to use built JS file
const htmlContent = await Bun.file("./dist/index.html").text();
const updatedHtml = htmlContent.replace(
  '<script type="module" src="./src/app.ts"></script>',
  '<script type="module" src="./app.js"></script>'
);
await Bun.write("./dist/index.html", updatedHtml);

console.log("✅ Build complete! Output in ./dist");
