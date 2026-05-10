#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
MODE="dev"

usage() {
  cat <<'EOF'
Team USA Archetype Lab runner

Usage:
  ./run.sh [--dev|--prod|--check|--smoke] [--port PORT]

Modes:
  --dev     Install deps if needed, build data summary, start next dev. Default.
  --prod    Install deps if needed, build data summary, build app, start next start.
  --check   Run the full verification chain: lint, production build, smoke test.
  --smoke   Run the product smoke test only.

Environment:
  PORT             Server port. Default: 3000.
  GEMINI_API_KEY   Optional. If omitted, the app runs deterministic demo mode.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dev)
      MODE="dev"
      shift
      ;;
    --prod)
      MODE="prod"
      shift
      ;;
    --check)
      MODE="check"
      shift
      ;;
    --smoke)
      MODE="smoke"
      shift
      ;;
    --port)
      PORT="${2:-}"
      if [[ -z "$PORT" ]]; then
        echo "Missing value for --port" >&2
        exit 1
      fi
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install Node.js first." >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies with npm ci..."
  npm ci
fi

if [[ ! -f .env.local && -f .env.example ]]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example. Add GEMINI_API_KEY for live Gemini mode; otherwise demo mode works."
fi

echo "Preparing Team USA sport summary..."
npm run build:data

case "$MODE" in
  check)
    npm test
    ;;
  smoke)
    npm run smoke
    ;;
  prod)
    npm run build
    echo "Starting production server on http://localhost:${PORT}"
    npm run start -- --port "$PORT"
    ;;
  dev)
    echo "Starting development server on http://localhost:${PORT}"
    npm run dev -- --port "$PORT"
    ;;
esac
