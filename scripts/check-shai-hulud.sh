#!/usr/bin/env bash
# Detects Shai-Hulud / Mini Shai-Hulud npm worm IOCs in this repo.
# Update scripts/shai-hulud-iocs.json when new IOCs are published.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOC_FILE="$ROOT/scripts/shai-hulud-iocs.json"

if [ ! -f "$IOC_FILE" ]; then
  echo "::error::IOC database missing at $IOC_FILE"
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "::error::jq is required (apt-get install jq)"
  exit 2
fi

FAIL=0
hit() { echo "::error::SHAI-HULUD: $*"; FAIL=1; }
ok()  { echo "  ✓ $*"; }
sec() { echo; echo "[$*]"; }

# Files we author ourselves and must not flag
SELF_EXCLUDE=(
  "$ROOT/scripts/shai-hulud-iocs.json"
  "$ROOT/scripts/check-shai-hulud.sh"
  "$ROOT/.github/workflows/shai-hulud.yml"
  "$ROOT/SECURITY.md"
)
is_self() {
  local f="$1" excl
  for excl in "${SELF_EXCLUDE[@]}"; do [ "$f" = "$excl" ] && return 0; done
  return 1
}

sec "Lockfile check"
LOCK="$ROOT/pnpm-lock.yaml"
if [ -f "$LOCK" ]; then
  while IFS= read -r pkg; do
    [ -z "$pkg" ] && continue
    if grep -F "$pkg" "$LOCK" >/dev/null 2>&1; then
      hit "compromised package version present in pnpm-lock.yaml: $pkg"
    fi
  done < <(jq -r '.compromised_packages[]' "$IOC_FILE")
  [ "$FAIL" -eq 0 ] && ok "no compromised package@version pairs in pnpm-lock.yaml"
else
  ok "no pnpm-lock.yaml at repo root"
fi

sec "File-name scan"
while IFS= read -r f; do
  [ -z "$f" ] && continue
  while IFS= read -r found; do
    [ -z "$found" ] && continue
    case "$found" in
      */node_modules/.cache/*|*/.git/*) continue ;;
    esac
    hit "suspicious file present: $found"
  done < <(find "$ROOT" -type f -name "$f" 2>/dev/null || true)
done < <(jq -r '.malicious_files[]' "$IOC_FILE")
[ "$FAIL" -eq 0 ] && ok "no IOC file names found"

sec "String scan"
STRING_HIT=0
while IFS= read -r s; do
  [ -z "$s" ] && continue
  while IFS= read -r match; do
    [ -z "$match" ] && continue
    file="${match%%:*}"
    if is_self "$file"; then continue; fi
    hit "IOC string '$s' found in $file"
    STRING_HIT=1
  done < <(grep -rnF \
      --exclude-dir=.git --exclude-dir=node_modules \
      --exclude-dir=android --exclude-dir=ios \
      -- "$s" "$ROOT" 2>/dev/null || true)
done < <(jq -r '.ioc_strings[]' "$IOC_FILE")
[ "$STRING_HIT" -eq 0 ] && ok "no IOC strings found in repo source"

sec "Hidden-payload scan (long whitespace runs in source files)"
WS_HIT=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if is_self "$f"; then continue; fi
  if grep -lE '[[:space:]]{200,}[[:graph:]]' "$f" >/dev/null 2>&1; then
    hit "long whitespace run followed by code in $f (hidden payload pattern)"
    WS_HIT=1
  fi
done < <(find "$ROOT" -type f \
  \( -name '*.js' -o -name '*.ts' -o -name '*.tsx' -o -name '*.jsx' -o -name '*.mjs' -o -name '*.cjs' -o -name '*.json' \) \
  -not -path '*/.git/*' -not -path '*/node_modules/*' \
  -not -path '*/android/*' -not -path '*/ios/*' 2>/dev/null)
[ "$WS_HIT" -eq 0 ] && ok "no hidden payloads found"

sec "Workflow file check"
if find "$ROOT/.github/workflows" -type f \( -iname '*shai*hulud*' -o -iname '*tanstack*runner*' -o -iname '*bun_environment*' \) 2>/dev/null | grep -v "/shai-hulud.yml$" | grep -q .; then
  hit "unexpected workflow file matching Shai-Hulud naming"
else
  ok "no unexpected workflow files"
fi

sec "Lifecycle script audit (advisory)"
if [ -f "$ROOT/package.json" ]; then
  scripts=$(jq -r '(.scripts // {}) | to_entries[] | select(.key | test("^(pre|post)?install$|^prepare$")) | "\(.key)=\(.value)"' "$ROOT/package.json")
  if [ -n "$scripts" ]; then
    echo "  ⚠ lifecycle scripts in package.json (review on dependency bumps):"
    echo "$scripts" | sed 's/^/    /'
  else
    ok "no install lifecycle scripts in root package.json"
  fi
fi

echo
if [ "$FAIL" -ne 0 ]; then
  REPO="${GITHUB_REPOSITORY:-hngprojects/clinical-mobile-new}"
  echo "::error::Shai-Hulud IOCs detected. See https://github.com/$REPO/blob/dev/SECURITY.md for response steps."
  exit 1
fi
echo "✓ Shai-Hulud scan clean"
