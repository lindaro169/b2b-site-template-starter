#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const forbiddenTrackedFiles = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
  ".dev.vars",
]);

const allowedExampleFiles = new Set([
  ".env.example",
  ".dev.vars.example",
]);

const suspiciousRules = [
  {
    name: "Resend API key",
    pattern: /\bre_[A-Za-z0-9]{16,}\b/g,
  },
  {
    name: "GitHub token",
    pattern: /\b(?:ghp|gho|github_pat)_[A-Za-z0-9_]{20,}\b/g,
  },
  {
    name: "Google API key",
    pattern: /\bAIza[0-9A-Za-z\-_]{20,}\b/g,
  },
  {
    name: "Slack token",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
  },
  {
    name: "Stripe secret key",
    pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
  },
  {
    name: "Secret assignment",
    pattern:
      /\b(?:BETTER_AUTH_SECRET|CLOUDFLARE_TURNSTILE_SECRET_KEY|GOOGLE_CLIENT_SECRET|RESEND_API_KEY|JWT_SECRET|CLOUDFLARE_API_TOKEN|CLOUDFLARE_D1_TOKEN|GOOGLE_ADS_FEED_PASSWORD|ADMIN_SECRET_KEY)\s*=\s*(?!mock|template|placeholder|example|your-|replace-with|re_mock)[^\s#]+/gi,
  },
];

const ignoredPathPatterns = [
  /^pnpm-lock\.yaml$/,
  /^package-lock\.json$/,
  /^yarn\.lock$/,
];

function getTrackedFiles() {
  const output = execFileSync("git", ["ls-files"], {
    encoding: "utf8",
  });

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function readFileFromGit(filePath) {
  return execFileSync("git", ["show", `HEAD:${filePath}`], {
    encoding: "utf8",
  });
}

function shouldIgnorePath(filePath) {
  return ignoredPathPatterns.some((pattern) => pattern.test(filePath));
}

function collectForbiddenFiles(trackedFiles) {
  return trackedFiles.filter((filePath) => forbiddenTrackedFiles.has(filePath));
}

function collectSuspiciousMatches(trackedFiles) {
  const findings = [];

  for (const filePath of trackedFiles) {
    if (allowedExampleFiles.has(filePath) || shouldIgnorePath(filePath)) {
      continue;
    }

    let content = "";

    try {
      content = readFileFromGit(filePath);
    } catch {
      continue;
    }

    const lines = content.split(/\r?\n/);

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];

      if (!line || /^\s*#/.test(line)) {
        continue;
      }

      for (const rule of suspiciousRules) {
        rule.pattern.lastIndex = 0;

        if (rule.pattern.test(line)) {
          findings.push({
            filePath,
            lineNumber: index + 1,
            rule: rule.name,
            sample: line.slice(0, 160),
          });
        }
      }
    }
  }

  return findings;
}

function main() {
  const trackedFiles = getTrackedFiles();
  const forbiddenFiles = collectForbiddenFiles(trackedFiles);
  const findings = collectSuspiciousMatches(trackedFiles);

  if (forbiddenFiles.length === 0 && findings.length === 0) {
    console.log("repo-safety:ok");
    process.exit(0);
  }

  if (forbiddenFiles.length > 0) {
    console.error("禁止提交以下本地私有环境文件：");
    for (const filePath of forbiddenFiles) {
      console.error(`- ${filePath}`);
    }
  }

  if (findings.length > 0) {
    console.error("检测到疑似真实 secret，请改为平台 secret 或本地私有文件：");
    for (const finding of findings) {
      console.error(
        `- ${finding.filePath}:${finding.lineNumber} [${finding.rule}] ${finding.sample}`
      );
    }
  }

  process.exit(1);
}

main();
