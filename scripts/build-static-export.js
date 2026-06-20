const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const apiPath = path.join(__dirname, "../src/app/api");
const apiBackupPath = path.join(__dirname, "../api-backup-temp");

try {
  // 1. Back up the api folder by renaming it
  if (fs.existsSync(apiPath)) {
    console.log("📦 Backing up API routes...");
    fs.renameSync(apiPath, apiBackupPath);
  }

  // 2. Run next build
  console.log("🚀 Running Next.js build...");
  execSync("npx next build", { stdio: "inherit" });

  console.log("✅ Build successful!");
} catch (error) {
  console.error("❌ Build failed:", error);
  process.exit(1);
} finally {
  // 3. Restore the api folder
  if (fs.existsSync(apiBackupPath)) {
    console.log("🔄 Restoring API routes...");
    if (fs.existsSync(apiPath)) {
      fs.rmSync(apiPath, { recursive: true, force: true });
    }
    fs.renameSync(apiBackupPath, apiPath);
  }
}
