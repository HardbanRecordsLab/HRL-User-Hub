#!/usr/bin/env node
/**
 * Static security scan for Supabase SQL migrations.
 * Fails CI when new RLS / policy / SECURITY DEFINER problems are introduced.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = "supabase/migrations";
const FUNCTIONS_DIR = "supabase/functions";
const issues = [];

const add = (file, rule, message) => issues.push({ file, rule, message });

function scanMigration(file, sql) {
  const stripped = sql.replace(/--.*$/gm, "");
  const lower = stripped.toLowerCase();

  // 1. Every new public table needs GRANT + RLS
  const tableRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi;
  let m;
  while ((m = tableRe.exec(stripped)) !== null) {
    const table = m[1];
    const t = table.toLowerCase();
    if (!new RegExp(`grant[\\s\\S]{0,200}on\\s+(table\\s+)?public\\.${t}\\b`, "i").test(stripped)) {
      add(file, "missing-grant", `Table public.${table} created without GRANT statements.`);
    }
    if (!new RegExp(`alter\\s+table\\s+public\\.${t}\\s+enable\\s+row\\s+level\\s+security`, "i").test(stripped)) {
      add(file, "missing-rls", `Table public.${table} created without ENABLE ROW LEVEL SECURITY.`);
    }
    if (!new RegExp(`create\\s+policy[\\s\\S]{0,400}on\\s+public\\.${t}\\b`, "i").test(stripped)) {
      add(file, "missing-policy", `Table public.${table} has RLS but no policy defined in this migration.`);
    }
  }

  // 2. Unconditional policies
  const policyRe = /create\s+policy[\s\S]{0,800}?;/gi;
  while ((m = policyRe.exec(stripped)) !== null) {
    const body = m[0];
    if (/(using|with\s+check)\s*\(\s*true\s*\)/i.test(body) && !/to\s+service_role/i.test(body)) {
      add(file, "permissive-policy", `Policy with USING/WITH CHECK (true): ${body.slice(0, 90).replace(/\s+/g, " ")}...`);
    }
  }

  // 3. SECURITY DEFINER hygiene
  const fnRe = /create\s+(or\s+replace\s+)?function\s+public\.([a-z0-9_]+)[\s\S]*?(?=create\s+(or\s+replace\s+)?function|$)/gi;
  while ((m = fnRe.exec(stripped)) !== null) {
    const block = m[0];
    const name = m[2];
    if (/security\s+definer/i.test(block) && !/set\s+search_path/i.test(block)) {
      add(file, "definer-search-path", `SECURITY DEFINER function public.${name} has no fixed search_path.`);
    }
  }

  // 4. Roles must not live on profiles
  if (/alter\s+table\s+public\.profiles[\s\S]{0,120}add\s+column[\s\S]{0,60}\brole\b/i.test(stripped)) {
    add(file, "role-on-profiles", "Roles must be stored in user_roles, never on profiles.");
  }

  // 5. Disabling RLS
  if (/disable\s+row\s+level\s+security/i.test(lower)) {
    add(file, "rls-disabled", "Migration disables Row Level Security.");
  }
}

function scanEdgeFunctions() {
  if (!existsSync(FUNCTIONS_DIR)) return;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith(".ts")) {
        const src = readFileSync(p, "utf8");
        if (/SUPABASE_SERVICE_ROLE_KEY/.test(src) && !/Authorization/.test(src)) {
          add(p, "service-role-unguarded", "Service role key used without an Authorization check.");
        }
        if (/execute_sql|rpc\(\s*["'`]execute/i.test(src)) {
          add(p, "raw-sql", "Raw SQL execution from an edge function is forbidden.");
        }
      }
    }
  };
  walk(FUNCTIONS_DIR);
}

const BASELINE_FILE = "scripts/security-scan-baseline.json";
const baseline = new Set(
  existsSync(BASELINE_FILE)
    ? JSON.parse(readFileSync(BASELINE_FILE, "utf8")).baselinedMigrations ?? []
    : [],
);

if (existsSync(MIGRATIONS_DIR)) {
  for (const f of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql"))) {
    if (baseline.has(f)) continue; // legacy migrations already superseded by later fixes
    const path = join(MIGRATIONS_DIR, f);
    scanMigration(path, readFileSync(path, "utf8"));
  }
} else {
  console.log(`ℹ️  No ${MIGRATIONS_DIR} directory found — skipping SQL scan.`);
}

scanEdgeFunctions();

if (issues.length === 0) {
  console.log("✅ Security scan passed — no RLS/policy/SECURITY DEFINER issues found.");
  process.exit(0);
}

console.error(`❌ Security scan found ${issues.length} issue(s):\n`);
for (const i of issues) console.error(`  [${i.rule}] ${i.file}\n      ${i.message}`);
console.error("\nFix these before deploying.");
process.exit(1);
