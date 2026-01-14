import { mkdir, cp } from "fs/promises";

// Build the TypeScript app
const result = await Bun.build({
  entrypoints: ["./src/app.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  minify: true,
  sourcemap: "external",
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
  '<script type="module" src="/src/app.ts"></script>',
  '<script type="module" src="/app.js"></script>'
);
await Bun.write("./dist/index.html", updatedHtml);

console.log("✅ Build complete! Output in ./dist");
