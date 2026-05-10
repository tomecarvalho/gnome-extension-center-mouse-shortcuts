#!/usr/bin/env sh
# SPDX-License-Identifier: GPL-2.0-or-later

# Regenerate the POT template, merge into PO files, and compile MO files under locale/.
# Requires GNU gettext (xgettext, msgcat, msgmerge, msgfmt).

set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
DOMAIN="centermouseshortcuts@tomecarvalho.github.io"
GSCHEMA_ITS="${GSCHEMA_ITS:-/usr/share/gettext/its/gschema.its}"
BUGS_URL="https://github.com/tomecarvalho/gnome-extension-center-mouse-shortcuts/issues"

cd "$ROOT"
mkdir -p po

if [ ! -f "$GSCHEMA_ITS" ]; then
    printf '%s\n' "Missing gschema ITS rules at: $GSCHEMA_ITS" >&2
    printf '%s\n' "Set GSCHEMA_ITS to the path of gschema.its from gettext." >&2
    exit 1
fi

JS_POT="po/${DOMAIN}.js.pot"
SCHEMA_POT="po/${DOMAIN}.schema.pot"
POT="po/${DOMAIN}.pot"

xgettext -o "$JS_POT" \
    -L JavaScript \
    --from-code=UTF-8 \
    --keyword=_ \
    --add-comments=/ \
    --package-name="gnome-extension-center-mouse-shortcuts" \
    --package-version="0.1.0" \
    --copyright-holder="Tomé Carvalho" \
    --msgid-bugs-address="$BUGS_URL" \
    prefs.js

xgettext -o "$SCHEMA_POT" \
    --its="$GSCHEMA_ITS" \
    --from-code=UTF-8 \
    --package-name="gnome-extension-center-mouse-shortcuts" \
    --package-version="0.1.0" \
    --copyright-holder="Tomé Carvalho" \
    --msgid-bugs-address="$BUGS_URL" \
    schemas/org.gnome.shell.extensions.centermouseshortcuts.gschema.xml

msgcat --sort-output --no-location -o "$POT" "$JS_POT" "$SCHEMA_POT"
rm -f "$JS_POT" "$SCHEMA_POT"

while read -r lang; do
    case "$lang" in
        ''|\#*) continue ;;
    esac
    po_file="po/${lang}.po"
    if [ ! -f "$po_file" ]; then
        printf '%s\n' "Missing $po_file — add it or remove $lang from po/LINGUAS." >&2
        exit 1
    fi
    msgmerge --update --backup=none --quiet "$po_file" "$POT"
    mkdir -p "locale/${lang}/LC_MESSAGES"
    msgfmt -o "locale/${lang}/LC_MESSAGES/${DOMAIN}.mo" "$po_file"
done < po/LINGUAS

printf '%s\n' "Updated $POT and locale/*/LC_MESSAGES/${DOMAIN}.mo"
