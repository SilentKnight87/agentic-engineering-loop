#!/usr/bin/env bash
set -euo pipefail

AGENT="hermes"
MODE="copy"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent) AGENT="${2:-}"; shift 2 ;;
    --mode) MODE="${2:-}"; shift 2 ;;
    -h|--help)
      cat <<'EOF'
Usage: ./install.sh [--agent hermes|claude|codex|opencode|omp|all] [--mode copy|symlink]

Installs every skill under skills/ (agentic-engineering-loop, software-factory,
factory-review, factory-frontend) into common agent skill directories.
EOF
      exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS=(agentic-engineering-loop software-factory factory-review factory-frontend)

install_one() {
  local name="$1"
  local src="$2"
  local dest="$3"
  mkdir -p "$(dirname "$dest")"
  rm -rf "$dest"
  if [[ "$MODE" == "symlink" ]]; then
    ln -s "$src" "$dest"
  elif [[ "$MODE" == "copy" ]]; then
    cp -R "$src" "$dest"
  else
    echo "Unsupported --mode: $MODE (use copy or symlink)" >&2
    exit 1
  fi
  echo "installed $name -> $dest"
}

install_all() {
  local name="$1"
  local base="$2"
  local skill
  for skill in "${SKILLS[@]}"; do
    install_one "$name/$skill" "$ROOT/skills/$skill" "$base/$skill"
  done
}

case "$AGENT" in
  hermes)
    install_all hermes "$HOME/.hermes/skills/software-development" ;;
  claude)
    install_all claude "$HOME/.claude/skills" ;;
  codex)
    install_all codex "$HOME/.agents/skills"
    install_all codex-legacy "$HOME/.codex/skills" ;;
  omp)
    # OMP discovers the canonical Agent Skills dir (verified via live session);
    # shared with Codex.
    install_all omp "$HOME/.agents/skills" ;;
  all)
    "$0" --agent hermes --mode "$MODE"
    "$0" --agent claude --mode "$MODE"
    "$0" --agent codex --mode "$MODE"
    "$0" --agent opencode --mode "$MODE"
    "$0" --agent omp --mode "$MODE" ;;
  *) echo "Unsupported --agent: $AGENT" >&2; exit 1 ;;
esac
