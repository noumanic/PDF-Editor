import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { hexToRgb } from '../utils/colorUtils.js';

/**
 * Embeds all annotations into the PDF and removes deleted pages.
 * Returns the saved Uint8Array, or throws on error.
 *
 * @param {Uint8Array}  pdfBytes     - Original PDF bytes (preserved copy, not PDF.js copy)
 * @param {object}      pdfDoc       - PDF.js document (for viewport size lookup)
 * @param {object}      anns         - Annotation map: { pageNum: Annotation[] }
 * @param {Set<number>} deletedPages - 1-based page numbers to remove
 * @param {number}      zoom         - Current zoom level
 */
export async function buildPdf(pdfBytes, pdfDoc, anns, deletedPages, zoom) {
    const lib = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const libPages = lib.getPages();
    const hFont = await lib.embedFont(StandardFonts.Helvetica);

    // Embed annotations
    for (const [pgStr, annList] of Object.entries(anns)) {
        const pgIdx = parseInt(pgStr, 10) - 1;
        if (pgIdx < 0 || pgIdx >= libPages.length) continue;
        const lp = libPages[pgIdx];
        const { width: pw, height: ph } = lp.getSize();
        const origPg = await pdfDoc.getPage(parseInt(pgStr, 10));
        const origVp = origPg.getViewport({ scale: 1 });
        const sx = pw / (origVp.width * zoom * 1.5);
        const sy = ph / (origVp.height * zoom * 1.5);

        for (const ann of annList) {
            if (!ann) continue;

            if (ann.type === 'text' && ann.text?.trim()) {
                const fs = Math.max(4, ann.fontSize * sx);
                const c = hexToRgb(ann.color ?? '#000000');
                lp.drawText(ann.text, {
                    x: ann.x * sx, y: ph - ann.y * sy - fs,
                    size: fs, font: hFont,
                    color: rgb(c.r / 255, c.g / 255, c.b / 255),
                });
            } else if (ann.type === 'highlight') {
                const c = hexToRgb(ann.color ?? '#ffff00');
                lp.drawRectangle({
                    x: ann.x * sx, y: ph - (ann.y + ann.h) * sy,
                    width: ann.w * sx, height: ann.h * sy,
                    color: rgb(c.r / 255, c.g / 255, c.b / 255),
                    opacity: 0.38, borderWidth: 0,
                });
            } else if (ann.type === 'rectangle') {
                const c = hexToRgb(ann.color ?? '#7c3aed');
                lp.drawRectangle({
                    x: ann.x * sx, y: ph - (ann.y + ann.h) * sy,
                    width: ann.w * sx, height: ann.h * sy,
                    borderColor: rgb(c.r / 255, c.g / 255, c.b / 255),
                    borderWidth: 2, opacity: 0,
                });
            }
        }
    }

    // Remove deleted pages in reverse order so indices stay valid
    const sorted = [...deletedPages].sort((a, b) => b - a);
    for (const pg of sorted) {
        const idx = pg - 1;
        if (idx >= 0 && idx < lib.getPageCount()) lib.removePage(idx);
    }

    return lib.save();
}
