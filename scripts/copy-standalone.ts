import { cp } from "fs/promises";
import path from "path";

async function copyFolder(src: string, dest: string) {
  try {
    await cp(src, dest, { recursive: true, force: true });
    console.log(`Successfully copied ${src} to ${dest}`);
  } catch (err) {
    console.error(`Error copying ${src} to ${dest}:`, err);
  }
}

async function main() {
  const root = process.cwd();
  await copyFolder(
    path.join(root, ".next", "static"),
    path.join(root, ".next", "standalone", ".next", "static")
  );
  await copyFolder(
    path.join(root, "public"),
    path.join(root, ".next", "standalone", "public")
  );
}

main();
