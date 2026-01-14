Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // Serve index.html for root
    if (path === "/") {
      return new Response(Bun.file("./public/index.html"), {
        headers: { "Content-Type": "text/html" }
      });
    }

    // Handle TypeScript files - transpile them
    if (path.endsWith(".ts") || path.endsWith(".tsx")) {
      try {
        const filePath = `.${path}`;
        const result = await Bun.build({
          entrypoints: [filePath],
          target: "browser",
          format: "esm",
        });

        if (result.outputs.length > 0) {
          return new Response(result.outputs[0], {
            headers: { "Content-Type": "application/javascript" }
          });
        }
      } catch (error) {
        console.error("Build error:", error);
        return new Response("Build error", { status: 500 });
      }
    }

    // Serve static files from public folder
    let filePath = `./public${path}`;
    let file = Bun.file(filePath);

    // If not in public, try root (for src files)
    if (!(await file.exists())) {
      filePath = `.${path}`;
      file = Bun.file(filePath);
    }

    // Determine content type
    let contentType = "text/plain";
    if (path.endsWith(".html")) contentType = "text/html";
    else if (path.endsWith(".css")) contentType = "text/css";
    else if (path.endsWith(".js")) contentType = "application/javascript";
    else if (path.endsWith(".json")) contentType = "application/json";
    else if (path.endsWith(".ttf")) contentType = "font/ttf";
    else if (path.endsWith(".woff")) contentType = "font/woff";
    else if (path.endsWith(".woff2")) contentType = "font/woff2";
    else if (path.endsWith(".ico")) return new Response(null, { status: 404 });

    return new Response(file, {
      headers: { "Content-Type": contentType }
    });
  },
});

console.log("🎡 Wheel app running at http://localhost:3000");
