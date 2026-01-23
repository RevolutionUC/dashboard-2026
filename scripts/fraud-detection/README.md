# Hackathon Fraud Detection

Detects rule violations in hackathon submissions. The core rule: **projects must be started after the hackathon begins**.

## Usage

```bash
# Install dependencies
npm install

# Run full analysis
npx tsx scripts/fraud-detection/index.ts --csv ./devpostfinalllll.csv --output ./fraud-report.json

# Quick mode (API only, no git cloning)
npx tsx scripts/fraud-detection/index.ts --csv ./devpostfinalllll.csv --quick
```

## Fraud Checks

### Critical (Score: 100) — Auto-Disqualify

| Check | What it Detects |
|-------|-----------------|
| **Pre-hackathon commits** | First commit timestamp is before hackathon start date |
| **Git history manipulation** | Author date differs significantly from committer date (indicates rebasing to fake timestamps) |

### High (Score: 30-40) — Manual Review Required

| Check | What it Detects |
|-------|-----------------|
| **Code dump commit** | Only 1-2 commits with >2000 lines of code (suggests code written elsewhere) |
| **No commits during hackathon** | All commits are before or after the hackathon window |
| **All commits at deadline** | 90%+ of commits in final 2 hours with no development history |
| **Private repository** | Cannot verify commit history |

### Medium (Score: 20-25) — Watch List

| Check | What it Detects |
|-------|-----------------|
| **Suspicious files** | Committed `.zip`, `.rar`, `.tar`, `.exe`, `.dll`, `.apk`, `.jar` files |
| **Suspicious commit messages** | Messages like "migrate", "port from", "re-upload", "restore backup" |
| **No repo for complex project** | Detailed description and tech stack but no source code link |

### Low (Score: 10) — Informational

| Check | What it Detects |
|-------|-----------------|
| **Multiple git authors** | More unique committers than registered team members |
| **Boundary commits** | Activity only at hackathon start/end, nothing in middle |

## Risk Levels

| Level | Score | Action |
|-------|-------|--------|
| **DISQUALIFY** | ≥70 | Auto-flag for disqualification |
| **REVIEW** | 40-69 | Requires manual review |
| **WATCH** | 20-39 | Minor concerns, check if needed |
| **PASS** | <20 | No significant issues |

## Output Files

- **Console** — Color-coded summary with flagged projects
- **fraud-report.json** — Full detailed analysis
- **fraud-report.csv** — Spreadsheet-friendly summary
