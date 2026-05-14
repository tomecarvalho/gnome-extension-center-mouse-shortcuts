#!/usr/bin/env sh

# SPDX-License-Identifier: GPL-2.0-or-later

# Package the extension in a Zip file for https://extensions.gnome.org/
# Usage: `npm run pack`
# Before packing: `npm run build` (builds schemas and translations).

set -eu

ROOT="$(env CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
UUID="$(basename "$ROOT")"
OUT="$ROOT/dist/${UUID}.zip"

if [ ! -f "$ROOT/metadata.json" ] || [ ! -f "$ROOT/extension.js" ]; then
    printf '%s\n' "Expected metadata.json and extension.js under $ROOT" >&2
    exit 1
fi


mkdir -p "$ROOT/dist"
cd "$ROOT"

zip -r "$OUT" . \
    -x ".editorconfig" \
    -x ".git/*" \
    -x ".github/*" \
    -x ".gitignore" \
    -x ".nvmrc" \
    -x ".prettierignore" \
    -x ".prettierrc" \
    -x ".vscode/*" \
    -x "*.zip" \
    -x "ambient.d.ts" \
    -x "dist/*" \
    -x "eslint.config.js" \
    -x "jsconfig.json" \
    -x "knip.json" \
    -x "node_modules/*" \
    -x "package-lock.json" \
    -x "package.json" \
    -x "po/*" \
    -x "README.md" \
    -x "schemas/gschemas.compiled" \
    -x "scripts/*" \
    -x "src/*" \
    -x "tsconfig.json" \
    -x "types.js" \
    -x "venv/*"

# If the `virtualenv` command is available, analyze the packaged extension with Shexli.
if command -v virtualenv > /dev/null 2>&1; then
    virtualenv venv
    . venv/bin/activate
    pip install -U shexli
    shexli "$OUT"
    deactivate
else
    printf '%s\n' "virtualenv command not found. Skipping Shexli analysis." >&2
    exit 1
fi

printf '%s\n' "Wrote $OUT"
printf '%s\n' "Upload at https://extensions.gnome.org/upload/"
