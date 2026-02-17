#!/usr/bin/env bash

set -euo pipefail

# Colors - these MUST be created fresh in the heredoc to avoid corruption
RESET='\033[0m'
BOLD='\033[1m'
CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
MAGENTA='\033[35m'
BLUE='\033[34m'
DIM='\033[2m'

find_root() {
  local dir="$PWD"
  while [[ "$dir" != "/" ]]; do
    if [[ -f "$dir/package.json" ]]; then
      echo "$dir"
      return 0
    fi
    dir="$(dirname "$dir")"
  done
  echo -e "${RED}Error: No package.json found${RESET}" >&2
  exit 1
}

ROOT=$(find_root)
cd "$ROOT" || exit 1

success() { echo -e "${GREEN}✓ $1${RESET}"; }
error()   { echo -e "${RED}✗ $1${RESET}"; }

run() {
  local cmd="$1"
  local title="$2"
  echo -e "\n${MAGENTA}══════════════════════════════════════════════════════════════${RESET}"
  echo -e "${YELLOW}→ $title${RESET}"
  echo -e "${MAGENTA}══════════════════════════════════════════════════════════════${RESET}\n"
  eval "$cmd" || error "Command failed (code $?)"
  echo -e "\n${GREEN}Press Enter to return...${RESET}"
  read -r
}

quick_commit() {
  echo -e "${YELLOW}Quick Commit${RESET}"
  echo -e "──────────────────────────────────────────────────────────────"

  read -p "${BLUE}Commit title (required): ${RESET}" title
  if [[ -z "$title" ]]; then
    error "Title is required. Aborting."
    echo -e "\n${GREEN}Press Enter...${RESET}"
    read -r
    return
  fi

  echo -e "${DIM}(Press Enter twice to finish description or leave empty)${RESET}"
  body=""
  while IFS= read -r line; do
    [[ -z "$line" ]] && break
    body+="$line\n"
  done

  git add . || { error "git add failed"; return; }

  if [[ -n "$body" ]]; then
    git commit -m "$title" -m "$body" || { error "Commit failed"; return; }
  else
    git commit -m "$title" || { error "Commit failed"; return; }
  fi

  success "Committed: $title"
  echo -e "\n${GREEN}Press Enter...${RESET}"
  read -r
}

show_menu() {
  clear
  echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${RESET}"
  echo -e "          ${CYAN}${BOLD}crhomepros – Next.js / Vercel Menu${RESET}"
  echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════${RESET}"
  echo -e "Root: ${YELLOW}$ROOT${RESET}\n"

  printf "  ${GREEN}1)${RESET} Start dev server\n"
  printf "  ${GREEN}2)${RESET} Build production\n"
  printf "  ${GREEN}3)${RESET} Preview production\n"
  printf "  ${GREEN}4)${RESET} Lint & auto-fix\n"
  printf "  ${GREEN}5)${RESET} Run tests\n"
  printf "  ${GREEN}6)${RESET} Install dependencies\n"
  printf "  ${GREEN}7)${RESET} Clean node_modules & cache\n"
  printf "  ${GREEN}8)${RESET} Deploy preview (Vercel)\n"
  printf "  ${GREEN}9)${RESET} Deploy production (Vercel)\n"
  printf " ${GREEN}10)${RESET} Open in VS Code\n"
  printf " ${GREEN}11)${RESET} Open localhost:3000\n"
  printf " ${GREEN}12)${RESET} Quick Git Commit (title + optional body)\n"
  printf "  ${RED}0)${RESET} Exit (terminal stays open)\n\n"

  printf "${BLUE}Choice [0-12]: ${RESET}"
}

while true; do
  show_menu
  read -r c

  case $c in
    0)
      echo -e "\n${CYAN}Thanks!${RESET} Terminal stays open – type ${YELLOW}exit${RESET} when ready."
      exec $SHELL -l
      ;;
    1) run "npm run dev" "Starting dev server" ;;
    2) run "npm run build" "Building production bundle" ;;
    3) run "npm run start" "Starting production preview" ;;
    4) run "npm run lint --fix && npm run format" "Lint & format fix" ;;
    5) run "npm run test" "Running tests" ;;
    6) run "npm install" "Installing dependencies" ;;
    7)
      echo -e "${YELLOW}Warning: This deletes node_modules, .next and lockfiles.${RESET}"
      read -p "Are you sure? (y/N) " confirm
      if [[ $confirm =~ ^[Yy]$ ]]; then
        rm -rf node_modules .next package-lock.json yarn.lock pnpm-lock.yaml
        success "Cleaned"
      else
        warning "Cancelled"
      fi
      echo -e "\n${GREEN}Press Enter...${RESET}"
      read -r
      ;;
    8) run "vercel" "Deploying preview" ;;
    9) run "vercel --prod" "Deploying production" ;;
    10) run "code ." "Opening VS Code" ;;
    11) run "open http://localhost:3000" "Opening browser" ;;
    12) quick_commit ;;
    *) echo -e "${YELLOW}Invalid${RESET}"; sleep 1 ;;
  esac
done
