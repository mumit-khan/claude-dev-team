#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const SOURCE = path.resolve(__dirname, "..");
const TARGET = path.resolve(process.argv[2] || process.cwd());

const PACKAGE_SCRIPTS = {
  help: "node scripts/claude-team.js help",
  status: "node scripts/claude-team.js status",
  next: "node scripts/claude-team.js next",
  summary: "node scripts/claude-team.js summary",
  roadmap: "node scripts/claude-team.js roadmap",
  validate: "node scripts/claude-team.js validate",
  doctor: "node scripts/claude-team.js doctor",
  "pipeline:check": "node scripts/consistency.js",
  pipeline: "node scripts/claude-team.js pipeline",
  quick: "node scripts/claude-team.js quick",
  nano: "node scripts/claude-team.js nano",
  "config-only": "node scripts/claude-team.js config-only",
  "dep-update": "node scripts/claude-team.js dep-update",
  hotfix: "node scripts/claude-team.js hotfix",
  "pipeline:scaffold": "node scripts/claude-team.js pipeline:scaffold",
  "pipeline:brief": "node scripts/claude-team.js pipeline-brief",
  "pipeline:review": "node scripts/claude-team.js pipeline-review",
  "pipeline:context": "node scripts/claude-team.js pipeline-context",
  design: "node scripts/claude-team.js design",
  retrospective: "node scripts/claude-team.js retrospective",
  "ask-pm": "node scripts/claude-team.js ask-pm",
  "principal-ruling": "node scripts/claude-team.js principal-ruling",
  adr: "node scripts/claude-team.js adr",
  resume: "node scripts/claude-team.js resume",
  stage: "node scripts/claude-team.js stage",
  prompt: "node scripts/claude-team.js prompt",
  role: "node scripts/claude-team.js role",
  audit: "node scripts/claude-team.js audit",
  "audit:quick": "node scripts/claude-team.js audit-quick",
  "health-check": "node scripts/claude-team.js health-check",
  "review:derive": "node scripts/approval-derivation.js",
  "security:check": "node scripts/security-heuristic.js",
  "runbook:check": "node scripts/runbook-check.js",
  autofold: "node scripts/claude-team.js autofold",
  lessons: "node scripts/claude-team.js lessons",
  "pr:pack": "node scripts/pr-pack.js",
  "parity:check": "node scripts/parity-check.js",
  "gate:check:all": "node scripts/gate-validator.js --all",
};

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === "config.local.yml" || entry.name.includes(".local.")) {
      continue;
    }
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function copyFileIfMissing(src, dest) {
  if (!fs.existsSync(dest)) fs.copyFileSync(src, dest);
}

function appendGitignore(target) {
  const gitignore = path.join(target, ".gitignore");
  if (!fs.existsSync(gitignore)) fs.writeFileSync(gitignore, "");
  const content = fs.readFileSync(gitignore, "utf8");
  if (content.includes("pipeline/gates/")) return;
  fs.appendFileSync(gitignore, `

# Claude Dev Team runtime artifacts
pipeline/brief.md
pipeline/design-spec.md
pipeline/hotfix-spec.md
pipeline/design-review-notes.md
pipeline/pr-*.md
pipeline/code-review/
pipeline/test-report.md
pipeline/deploy-log.md
pipeline/gates/
pipeline/adr/

# Claude Dev Team local overrides
.claude/**/*.local.*
.claude/config.local.yml
CLAUDE.local.md
`);
}

function addPackageScripts(target) {
  const packagePath = path.join(target, "package.json");
  if (!fs.existsSync(packagePath)) return;

  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  pkg.scripts = pkg.scripts || {};
  let changed = false;
  for (const [name, command] of Object.entries(PACKAGE_SCRIPTS)) {
    if (!pkg.scripts[name]) {
      pkg.scripts[name] = command;
      changed = true;
    }
  }

  if (changed) fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
}

function main() {
  if (!fs.existsSync(TARGET) || !fs.statSync(TARGET).isDirectory()) {
    console.error(`Target directory does not exist: ${TARGET}`);
    process.exit(1);
  }

  copyDir(path.join(SOURCE, ".claude"), path.join(TARGET, ".claude"));
  copyDir(path.join(SOURCE, "scripts"), path.join(TARGET, "scripts"));
  copyDir(path.join(SOURCE, "schemas"), path.join(TARGET, "schemas"));
  copyDir(path.join(SOURCE, "templates"), path.join(TARGET, "templates"));
  // Copy docs sub-directories that are framework references, not project-specific outputs
  for (const docsSubdir of ["parity", "migration"]) {
    const src = path.join(SOURCE, "docs", docsSubdir);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(TARGET, "docs", docsSubdir));
    }
  }

  copyFileIfMissing(path.join(SOURCE, "CLAUDE.md"), path.join(TARGET, "CLAUDE.md"));
  copyFileIfMissing(path.join(SOURCE, "AGENTS.md"), path.join(TARGET, "AGENTS.md"));
  fs.mkdirSync(path.join(TARGET, "pipeline"), { recursive: true });
  copyFileIfMissing(path.join(SOURCE, "pipeline", "context.md"), path.join(TARGET, "pipeline", "context.md"));

  const lessonsSource = path.join(SOURCE, "pipeline", "lessons-learned.md");
  const lessonsDest = path.join(TARGET, "pipeline", "lessons-learned.md");
  if (fs.existsSync(lessonsSource)) copyFileIfMissing(lessonsSource, lessonsDest);

  fs.mkdirSync(path.join(TARGET, "pipeline", "gates"), { recursive: true });
  fs.mkdirSync(path.join(TARGET, "pipeline", "adr"), { recursive: true });
  fs.mkdirSync(path.join(TARGET, "pipeline", "code-review"), { recursive: true });
  fs.mkdirSync(path.join(TARGET, "src", "backend"), { recursive: true });
  fs.mkdirSync(path.join(TARGET, "src", "frontend"), { recursive: true });
  fs.mkdirSync(path.join(TARGET, "src", "infra"), { recursive: true });
  fs.mkdirSync(path.join(TARGET, "src", "tests"), { recursive: true });

  fs.copyFileSync(path.join(SOURCE, "VERSION"), path.join(TARGET, ".claude", "VERSION"));
  appendGitignore(TARGET);
  addPackageScripts(TARGET);

  console.log(`Claude Dev Team installed into ${TARGET}`);
}

if (require.main === module) {
  main();
}

module.exports = { PACKAGE_SCRIPTS };
