/**
 * Pulls in generated GIR typings so the editor understands `gi://…` imports and
 * extension globals. See: https://gjs.guide/extensions/development/typescript.html
 */
import '@girs/gjs';
import '@girs/gjs/dom';
import '@girs/gnome-shell/ambient';
import '@girs/gnome-shell/extensions/global';
