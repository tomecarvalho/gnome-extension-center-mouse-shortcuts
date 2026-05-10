/**
 * Calculate the center of an axis, rounded to the nearest integer.
 * @param {number} coordinate
 * @param {number} length
 * @returns {number}
 */
const getAxisCenter = (coordinate, length) =>
    Math.round(coordinate + length / 2);

/**
 * Calculate the center of a rectangle.
 * Coordinates are rounded to the nearest integer.
 * @param {import('gi://Gdk').default.Rectangle} rectangle
 * @returns {{x: number, y: number}}
 */
export const getRectCenter = ({x, width, y, height}) => ({
    x: getAxisCenter(x, width),
    y: getAxisCenter(y, height),
});
