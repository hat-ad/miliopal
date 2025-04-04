const fs = require("fs");
const path = require("path");

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  const srcPath = path.resolve(__dirname, "src/templates/email/ejs");
  const destPath = path.resolve(__dirname, "dist/templates/email/ejs");
  copyRecursiveSync(srcPath, destPath);
  console.log("EJS templates copied successfully!");
} catch (error) {
  console.error("Error copying EJS templates:", error);
}
