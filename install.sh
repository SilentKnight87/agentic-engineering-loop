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
Usage: ./install.sh [--agent hermes|claude|codex|opencode|all] [--mode copy|symlink]

Installs the agentic-engineering-loop skill into common agent skill directories.
EOF
      exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$ROOT/skills/agentic-engineering-loop"

install_one() {
  local name="$1"
  local dest="$2"
  mkdir -p "$(dirname "$dest")"
  rm -rf "$dest"
  if [[ "$MODE" == "symlink" ]]; then
    ln -s "$SRC" "$dest"
  elif [[ "$MODE" == "copy" ]]; then
    cp -R "$SRC" "$dest"
  else
    echo "Unsupported --mode: $MODE (use copy or symlink)" >&2
    exit 1
  fi
  echo "installed $name -> $dest"
}

case "$AGENT" in
  hermes)
    install_one hermes "$HOME/.hermes/skills/software-development/agentic-engineering-loop" ;;
  claude)
    install_one claude "$HOME/.claude/skills/agentic-engineering-loop" ;;
  codex)
    install_one codex "$HOME/.agents/skills/agentic-engineering-loop"
    install_one codex-legacy "$HOME/.codex/skills/agentic-engineering-loop" ;;
  opencode)
    install_one opencode "$HOME/.config/opencode/skills/agentic-engineering-loop" ;;
  all)
    "$0" --agent hermes --mode "$MODE"
    "$0" --agent claude --mode "$MODE"
    "$0" --agent codex --mode "$MODE"
    "$0" --agent opencode --mode "$MODE" ;;
  *) echo "Unsupported --agent: $AGENT" >&2; exit 1 ;;
esac
