#!/usr/bin/env bash
# Generate docs/assets/demo.gif with VHS (https://github.com/charmbracelet/vhs)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
npm run build -w flareskill >/dev/null

TAPE="$(mktemp -t flareskill-demo.XXXXXX.tape)"
trap 'rm -f "$TAPE"' EXIT

cat > "$TAPE" <<EOF
Output docs/assets/demo.gif
Set FontSize 14
Set Width 980
Set Height 580
Set Theme "Catppuccin Mocha"
Set Padding 16
Set TypingSpeed 40ms
Set Shell zsh

Hide
Type \`FS=$ROOT\`
Enter
Type \`alias flareskill="node \\\$FS/apps/cli/dist/index.js"\`
Enter
Type \`rm -rf /tmp/flareskill-demo && mkdir -p /tmp/flareskill-demo && cd /tmp/flareskill-demo && git init -q\`
Enter
Type "clear"
Enter
Show

Type "# Search the registry"
Enter
Sleep 400ms
Type \`flareskill search react -r \\\$FS/registry/index.json\`
Enter
Sleep 1.6s

Type "# Install with Claude adapter + dependencies"
Enter
Sleep 300ms
Type \`flareskill install senior-nextjs-engineer --agent claude -r \\\$FS/registry/index.json\`
Enter
Sleep 2.4s

Type \`flareskill outdated -r \\\$FS/registry/index.json\`
Enter
Sleep 1.2s

Type "# Lockfile sync for teammates"
Enter
Sleep 300ms
Type \`flareskill install -r \\\$FS/registry/index.json\`
Enter
Sleep 1.6s

Type "# Codex adapter + quiet mode"
Enter
Sleep 300ms
Type \`flareskill install docker-engineer --agent codex -q -r \\\$FS/registry/index.json\`
Enter
Sleep 1.8s

Type "flareskill list"
Enter
Sleep 2.2s
EOF

vhs "$TAPE"
echo "Wrote $ROOT/docs/assets/demo.gif"
