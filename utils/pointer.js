import Clutter from 'gi://Clutter';

import {getRectCenter} from './rect.js';

/**
 * Warp the pointer of the default seat to the given coordinates.
 * Rounds the coordinates to the nearest integer.
 * @param {number} x
 * @param {number} y
 * @returns {void}
 */
const warpPointer = (x, y) => {
    const seat = Clutter.get_default_backend()?.get_default_seat();

    seat.warp_pointer(x, y);
};

/**
 * Warp the pointer of the default seat to the center of the given rectangle.
 * @param {import('gi://Gdk').default.Rectangle} rect
 * @returns {void}
 */
export const warpPointerToRectCenter = rect => {
    const {x, y} = getRectCenter(rect);

    warpPointer(x, y);
};
