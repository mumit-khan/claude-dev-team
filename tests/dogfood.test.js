const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");

describe("dogfood install", () => {
  let target;

  beforeEach(() => {
    target = fs.mkdtempSync(path.join(os.tmpdir(), "claude-dogfood-"));
    fs.writeFileSync(path.join(target, "package.json"), JSON.stringify({
      scripts: {
        test: "node --test",
      },
    }, null, 2));
  });

  afterEach(() => {
    fs.rmSync(target, { recursive: true, force: true });
  });

  it("installs into a tiny app and validates a real requirements gate", () => {
    // Use bootstrap.js (Node) which copies scripts/, schemas/, templates/ + adds npm shims
    execFileSync(process.execPath, [path.join(ROOT, "scripts", "bootstrap.js"), target], {
      cwd: ROOT,
      encoding: "utf8",
    });

    const gate = {
      stage: "stage-01",
      status: "PASS",
      agent: "pm",
      track: "full",
      timestamp: "2026-04-29T12:00:00Z",
      blockers: [],
      warnings: [],
      acceptance_criteria_count: 1,
      out_of_scope_items: [],
      required_sections_complete: true,
    };

    fs.writeFileSync(
      path.join(target, "pipeline", "gates", "stage-01.json"),
      JSON.stringify(gate, null, 2),
    );

    const output = execFileSync(process.execPath, [path.join(target, "scripts", "gate-validator.js")], {
      cwd: target,
      encoding: "utf8",
    });
    assert.match(output, /PASS.*stage-01|stage-01.*PASS/);
  });

  it("runs a simulated full pipeline lifecycle in an installed app", () => {
    // Use bootstrap.js (Node) which copies scripts/, schemas/, templates/ + adds npm shims
    execFileSync(process.execPath, [path.join(ROOT, "scripts", "bootstrap.js"), target], {
      cwd: ROOT,
      encoding: "utf8",
    });

    const cli = path.join(target, "scripts", "claude-team.js");
    const scaffold = spawnSync(process.execPath, [cli, "pipeline:scaffold", "Add health endpoint"], {
      cwd: target,
      encoding: "utf8",
    });
    assert.equal(scaffold.status, 0);

    const gatesDir = path.join(target, "pipeline", "gates");
    const gateBase = {
      status: "PASS",
      track: "full",
      timestamp: "2026-04-29T12:00:00Z",
      blockers: [],
      warnings: [],
    };

    // Claude stage numbering:
    //   stage-01 = requirements, stage-02 = design, stage-03 = clarification
    //   stage-04 = build, stage-04a = pre-review
    //   stage-05-<area> = peer-review, stage-06 = qa/tests
    //   stage-07 = sign-off, stage-08 = deploy, stage-09 = retrospective
    const gates = {
      "stage-01.json": {
        ...gateBase,
        stage: "stage-01",
        agent: "pm",
        acceptance_criteria_count: 1,
        out_of_scope_items: [],
        required_sections_complete: true,
      },
      "stage-02.json": {
        ...gateBase,
        stage: "stage-02",
        agent: "principal",
        arch_approved: true,
        pm_approved: true,
        adr_count: 0,
      },
      "stage-03.json": {
        ...gateBase,
        stage: "stage-03",
        agent: "pm",
        open_questions_count: 0,
        answered_questions_count: 0,
        scope_changed: false,
      },
      "stage-04.json": {
        ...gateBase,
        stage: "stage-04",
        agent: "claude-team",
        workstreams: ["backend"],
        pr_summaries_written: ["pipeline/pr-backend.md"],
        local_verification: ["npm test"],
      },
      "stage-04a.json": {
        ...gateBase,
        stage: "stage-04a",
        agent: "platform",
        lint_passed: true,
        tests_passed: true,
        dependency_review_passed: true,
        security_review_required: false,
      },
      "stage-05-backend.json": {
        ...gateBase,
        stage: "stage-05-backend",
        agent: "claude-team",
        area: "backend",
        review_shape: "scoped",
        required_approvals: 1,
        approvals: ["qa"],
        changes_requested: [],
        escalated_to_principal: false,
      },
      "stage-06.json": {
        ...gateBase,
        stage: "stage-06",
        agent: "qa",
        all_acceptance_criteria_met: true,
        tests_total: 1,
        tests_passed: 1,
        tests_failed: 0,
        failing_tests: [],
        criterion_to_test_mapping_is_one_to_one: true,
      },
      "stage-07.json": {
        ...gateBase,
        stage: "stage-07",
        agent: "platform",
        pm_signoff: true,
        deploy_requested: false,
        runbook_referenced: true,
      },
      "stage-08.json": {
        ...gateBase,
        stage: "stage-08",
        agent: "platform",
        pm_signoff: true,
        deploy_requested: false,
        runbook_referenced: true,
      },
      "stage-09.json": {
        ...gateBase,
        stage: "stage-09",
        agent: "principal",
        severity: "green",
        lessons_promoted: [],
        patterns_harvested: 1,
        contributions_written: ["pipeline/summary.md"],
      },
    };

    for (const [name, gate] of Object.entries(gates)) {
      fs.writeFileSync(path.join(gatesDir, name), JSON.stringify(gate, null, 2));
    }

    fs.writeFileSync(path.join(target, "pipeline", "retrospective.md"), [
      "# Retrospective",
      "",
      "LESSON: Dogfood full scaffolds before changing pipeline contracts.",
      "",
    ].join("\n"));
    fs.mkdirSync(path.join(target, "docs", "audit"), { recursive: true });
    fs.writeFileSync(path.join(target, "docs", "audit", "10-roadmap.md"), [
      "# Improvement Roadmap",
      "",
      "| # | Item | Impact | Effort | Risk | Verification | Areas |",
      "|---|---|---|---|---|---|---|",
      "| 1 | Harden sample app | Medium | Small | Low | npm test | src/backend |",
      "",
    ].join("\n"));

    const validate = spawnSync(process.execPath, [cli, "validate"], {
      cwd: target,
      encoding: "utf8",
    });
    assert.equal(validate.status, 0, validate.stderr);

    const status = spawnSync(process.execPath, [cli, "status"], {
      cwd: target,
      encoding: "utf8",
    });
    assert.equal(status.status, 0);
    assert.match(status.stdout, /stage-09\.json: PASS/);

    const summary = spawnSync(process.execPath, [cli, "summary"], {
      cwd: target,
      encoding: "utf8",
    });
    assert.equal(summary.status, 0);
    const summaryText = fs.readFileSync(path.join(target, "pipeline", "summary.md"), "utf8");
    assert.match(summaryText, /Readiness: ready/);
    assert.match(summaryText, /stage-05-backend\.json/);

    const lessons = spawnSync(process.execPath, [cli, "lessons", "promote"], {
      cwd: target,
      encoding: "utf8",
    });
    assert.equal(lessons.status, 0);
    assert.match(fs.readFileSync(path.join(target, "pipeline", "lessons-learned.md"), "utf8"), /Dogfood full scaffolds/);

    const roadmap = spawnSync(process.execPath, [cli, "roadmap"], {
      cwd: target,
      encoding: "utf8",
    });
    assert.equal(roadmap.status, 0);
    assert.match(roadmap.stdout, /Remaining: 1/);
  });
});
