#!/usr/bin/env node
/**
 * Validación básica de trazabilidad:
 * - Verifica existencia de TRACEABILITY-MASTER.yml
 * - Verifica archivos referenciados con clave "file:"
 * - Emite reporte Markdown
 */
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const traceabilityFile = path.join(repoRoot, "orchestration", "trazabilidad", "TRACEABILITY-MASTER.yml");

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function extractReferencedFiles(yamlContent) {
  const lines = yamlContent.split(/\r?\n/);
  const refs = [];
  for (const line of lines) {
    const match = line.match(/file:\s*"([^"]+)"/);
    if (match) refs.push(match[1]);
  }
  return refs;
}

function toMarkdown(report) {
  const okRows = report.ok.map((f) => `- [x] \`${f}\``).join("\n") || "- [x] Ninguno";
  const missingRows =
    report.missing.map((f) => `- [ ] \`${f}\``).join("\n") || "- [x] Ninguno";

  return [
    "# Reporte de Validación de Trazabilidad",
    "",
    `**Fecha:** ${report.generated_at}`,
    "",
    "## Resumen",
    "",
    `- Total referencias: **${report.total}**`,
    `- Referencias válidas: **${report.ok.length}**`,
    `- Referencias faltantes: **${report.missing.length}**`,
    "",
    "## Referencias válidas",
    "",
    okRows,
    "",
    "## Referencias faltantes",
    "",
    missingRows,
    "",
  ].join("\n");
}

function main() {
  if (!fileExists(traceabilityFile)) {
    console.error("No existe orchestration/trazabilidad/TRACEABILITY-MASTER.yml");
    process.exit(1);
  }

  const raw = fs.readFileSync(traceabilityFile, "utf8");
  const refs = extractReferencedFiles(raw);

  const ok = [];
  const missing = [];
  for (const ref of refs) {
    const abs = path.join(repoRoot, ref);
    if (fileExists(abs)) ok.push(ref);
    else missing.push(ref);
  }

  const report = {
    generated_at: new Date().toISOString(),
    total: refs.length,
    ok,
    missing,
  };

  const outDir = path.join(repoRoot, "orchestration", "trazabilidad");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "VALIDATION-REPORT.md");
  fs.writeFileSync(outPath, toMarkdown(report), "utf8");

  console.log("Reporte generado:", outPath);
  if (missing.length > 0) {
    console.error(`Validación con faltantes: ${missing.length}`);
    process.exitCode = 2;
    return;
  }
  console.log("Validación OK");
}

main();
