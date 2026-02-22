/**
 * Converts a CSS hex colour string to { r, g, b } (0–255).
 * @param {string} hex  e.g. '#a855f7'
 * @returns {{ r: number, g: number, b: number }}
 */
export function hexToRgb(hex) {
    if (!hex || hex[0] !== '#') return { r: 0, g: 0, b: 0 };
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
