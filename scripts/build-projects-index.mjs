import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, "content", "projects");
const OUT_FILE = path.join(ROOT, "content", "projects-index.json");

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function safeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

const files = fs
  .readdirSync(PROJECTS_DIR)
  .filter((f) => f.toLowerCase().endsWith(".json"));

const projects = files
  .map((filename) => {
    const full = path.join(PROJECTS_DIR, filename);
    const data = readJson(full);

    const title = data.title || "";
    const slugFromFile = path.basename(filename, ".json");
    const slug = safeSlug(data.slug || slugFromFile || title);

    return {
      slug,
      title,
      location: data.location || "",
      year: data.year || "",
      description: data.description || "",   // ✅ agregado
      coverImage: data.coverImage || "",
      order: Number.isFinite(Number(data.order)) ? Number(data.order) : 9999,
      featured: Boolean(data.featured), // si no existe, queda false
    };
  })
  .filter((p) => p.slug && p.title)
  .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

fs.writeFileSync(OUT_FILE, JSON.stringify({ projects }, null, 2), "utf8");

console.log(`ok: wrote ${projects.length} projects -> content/projects-index.json`);
