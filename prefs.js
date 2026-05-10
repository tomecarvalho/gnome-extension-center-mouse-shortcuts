// SPDX-License-Identifier: GPL-2.0-or-later

import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk';

import {
    ExtensionPreferences,
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

/**
 * @typedef {import('gi://Adw').default.PreferencesDialog | import('gi://Adw').default.PreferencesWindow} PreferencesDialogOrWindow
 */

const SHORTCUT_EDITOR_MARGIN = 24;

/**
 * @param {import('gi://Gtk').default.Window | null} parent
 * @param {import('gi://Gio').default.Settings} settings
 * @param {string} settingsKey
 * @param {string} actionTitle Row title (shown bold), matching GNOME Settings wording
 */
const openShortcutEditor = (parent, settings, settingsKey, actionTitle) => {
    const window = new Adw.Window({
        title: _('Set Shortcut'),
        modal: true,
        transient_for: parent ?? undefined,
        destroy_with_parent: true,
    });

    const escaped = GLib.markup_escape_text(actionTitle, -1);

    const instruction = _('Enter new shortcut to change <b>%s</b>').format(
        escaped
    );

    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        valign: Gtk.Align.START,
        margin_top: SHORTCUT_EDITOR_MARGIN,
        margin_bottom: SHORTCUT_EDITOR_MARGIN,
        margin_start: SHORTCUT_EDITOR_MARGIN,
        margin_end: SHORTCUT_EDITOR_MARGIN,
        spacing: SHORTCUT_EDITOR_MARGIN,
    });

    const instructionLabel = new Gtk.Label({
        label: instruction,
        use_markup: true,
        wrap: true,
        justify: Gtk.Justification.CENTER,
        xalign: 0.5,
        max_width_chars: 42,
    });

    const hintLabel = new Gtk.Label({
        label: _(
            'Press Esc to cancel or Backspace to disable the keyboard shortcut'
        ),
        wrap: true,
        justify: Gtk.Justification.LEFT,
        xalign: 0,
        max_width_chars: 42,
        css_classes: ['dim-label'],
    });

    box.append(instructionLabel);
    box.append(hintLabel);

    const keyController = new Gtk.EventControllerKey();
    keyController.connect('key-pressed', (_c, keyval, _keycode, state) => {
        // Esc: cancel.
        if (keyval === Gdk.KEY_Escape) {
            window.destroy();
            return Gdk.EVENT_STOP;
        }

        // Backspace: unbind.
        if (keyval === Gdk.KEY_BackSpace) {
            settings.set_strv(settingsKey, []);
            window.destroy();
            return Gdk.EVENT_STOP;
        }

        if (!Gtk.accelerator_valid(keyval, state)) return Gdk.EVENT_PROPAGATE;

        settings.set_strv(settingsKey, [Gtk.accelerator_name(keyval, state)]);
        window.destroy();
        return Gdk.EVENT_STOP;
    });
    window.add_controller(keyController);

    window.set_content(box);
    window.present();
};

/**
 * @param {import('gi://Adw').default.PreferencesGroup} group
 * @param {import('gi://Gio').default.Settings} settings
 * @param {string} settingsKey
 * @param {string} title
 */
const addKeybindingRow = (group, settings, settingsKey, title) => {
    const row = new Adw.ActionRow({title});

    const shortcutLabel = new Gtk.ShortcutLabel({
        accelerator: settings.get_strv(settingsKey)[0] ?? '',
        disabled_text: _('Not set'),
        valign: Gtk.Align.CENTER,
    });

    const resetButton = new Gtk.Button({
        css_classes: ['flat', 'circular'],
        icon_name: 'edit-clear-symbolic',
        tooltip_text: _('Reset to default'),
        valign: Gtk.Align.CENTER,
    });

    const setButton = new Gtk.Button({
        label: _('Set…'),
        valign: Gtk.Align.CENTER,
    });

    const suffix = new Gtk.Box({spacing: 12});
    suffix.append(shortcutLabel);
    suffix.append(resetButton);
    suffix.append(setButton);
    row.add_suffix(suffix);

    const sync = () => {
        shortcutLabel.accelerator = settings.get_strv(settingsKey)[0] ?? '';
        resetButton.visible = settings.get_user_value(settingsKey) !== null;
    };

    const reset = () => {
        settings.reset(settingsKey);
    };

    const set = () => {
        const root = row.get_root();

        openShortcutEditor(
            root instanceof Gtk.Window ? root : null,
            settings,
            settingsKey,
            title
        );
    };

    settings.connect(`changed::${settingsKey}`, sync);

    sync();

    resetButton.connect('clicked', reset);

    setButton.connect('clicked', set);

    group.add(row);
};

export default class CenterMouseShortcutsPreferences extends ExtensionPreferences {
    /**
     * @param {PreferencesDialogOrWindow} window
     */
    async fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const group = new Adw.PreferencesGroup({
            title: _('Shortcuts'),
            vexpand: false,
        });

        for (const {key, title} of [
            {
                key: 'center-pointer-on-window',
                title: _('Center mouse on focused window'),
            },
            {
                key: 'center-pointer-on-display',
                title: _('Center mouse on focused display'),
            },
        ])
            addKeybindingRow(group, settings, key, title);

        const page = new Adw.PreferencesPage({
            title: _('Shortcuts'),
            icon_name: 'preferences-desktop-keyboard-symbolic',
            vexpand: false,
            valign: Gtk.Align.START,
        });

        page.add(group);
        window.add(page);
    }
}
