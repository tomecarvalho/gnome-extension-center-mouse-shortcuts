/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import Meta from 'gi://Meta';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {wm} from 'resource:///org/gnome/shell/ui/main.js';

import APPLICABLE_ACTION_MODES from './constants/action-modes.js';
import KEYS from './constants/keys.js';
import {warpPointerToRectCenter} from './utils/pointer.js';

export default class CenterMouseShortcut extends Extension {
    enable() {
        this._settings = this.getSettings();

        for (const {name, handler} of [
            {
                name: KEYS.CENTER_POINTER_ON_WINDOW,
                handler: () => {
                    this._centerOnFocusedWindow();
                },
            },
            {
                name: KEYS.CENTER_POINTER_ON_DISPLAY,
                handler: () => {
                    this._centerOnFocusedDisplay();
                },
            },
        ])
            wm.addKeybinding(
                name,
                this._settings,
                Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
                APPLICABLE_ACTION_MODES,
                handler
            );
    }

    disable() {
        for (const name of Object.values(KEYS)) wm.removeKeybinding(name);

        this._settings = null;
    }

    /**
     * Warp the mouse pointer to the center of the focused window.
     * If no window is focused, fall back to centering on the focused display.
     * @returns {void}
     */
    _centerOnFocusedWindow() {
        const window = global.display.get_focus_window();

        if (!window) {
            this._centerOnFocusedDisplay();
            return;
        }

        const rect = window.get_frame_rect();

        warpPointerToRectCenter(rect);
    }

    /**
     * Warp the mouse pointer to the center of the focused display (display that contains the focused window).
     * If no window is focused, fall back to centering on the primary display.
     * @returns {void}
     */
    _centerOnFocusedDisplay() {
        const {display} = global;

        const window = display.get_focus_window();
        const monitor = window?.get_monitor() ?? display.get_primary_monitor();
        const rect = display.get_monitor_geometry(monitor);

        warpPointerToRectCenter(rect);
    }
}
