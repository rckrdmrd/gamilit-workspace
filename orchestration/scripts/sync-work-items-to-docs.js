#!/usr/bin/env node
/**
 * Sync checker: work-items (orchestration) vs docs requirements.
 * Non-destructive: only reports potential desalignments.
 */
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const workItemsEpicsDir = path.join(repoRoot, "orchestration", "work-items", "epics");
const docsEpicsDir = path.join(repoRoot, "docs", "10-requirements", "epics");

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function walkDirectoriesRecursive(dirPath) {
  const result = [];
  if (!fileExists(dirPath)) return result;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(dirPath, entry.name);
    result.push(fullPath);
    result.push(...walkDirectoriesRecursive(fullPath));
  }
  return result;
}

function collectDocsEpics() {
  const dirs = walkDirectoriesRecursive(docsEpicsDir);
  const epicNames = dirs
    .map((absPath) => path.basename(absPath))
    .filter((name) => name.startsWith("EPIC-"));
  return [...new Set(epicNames)].sort();
}

function collectWorkItemEpics() {
  if (!fileExists(workItemsEpicsDir)) return [];
  const entries = fs.readdirSync(workItemsEpicsDir, { withFileTypes: true });
  const epicFiles = entries
    .filter((entry) => entry.isFile() && /^EPIC-.*\.yml$/i.test(entry.name))
    .map((entry) => entry.name.replace(/\.yml$/i, ""));
  return [...new Set(epicFiles)].sort();
}

function main() {
  if (!fileExists(workItemsEpicsDir)) {
    console.error("No se encontró orchestration/work-items/epics/");
    process.exit(1);
  }

  const workItemEpics = collectWorkItemEpics();
  const docsEpics = collectDocsEpics();

  const missingInDocs = workItemEpics.filter((epic) => !docsEpics.includes(epic));
  const missingInWorkItems = docsEpics.filter((epic) => !workItemEpics.includes(epic));

  const report = {
    generated_at: new Date().toISOString(),
    total_work_items_epics: workItemEpics.length,
    total_docs_epics: docsEpics.length,
    missing_in_docs: missingInDocs,
    missing_in_work_items: missingInWorkItems,
  };

  const reportDir = path.join(repoRoot, "orchestration", "trazabilidad");
  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, "SYNC-WORKITEMS-DOCS-REPORT.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("Reporte generado:", reportPath);
  console.log(JSON.stringify(report, null, 2));
}

main();
