import { useRef, useEffect, useCallback } from 'react';
import I from './Icons.jsx';

function getXY(e, overlayEl) {
    const r = overlayEl.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function hitTest(ann, x, y) {
    if (ann.type === 'text') {
        return x >= ann.x - 2 && x <= ann.x + 200 && y >= ann.y - 2 && y <= ann.y + ann.fontSize * 1.5 + 8;
    }
    if (ann.type === 'highlight' || ann.type === 'rectangle') {
        return x >= ann.x && x <= ann.x + ann.w && y >= ann.y && y <= ann.y + ann.h;
    }
    return false;
}

export default function MainCanvas({
    pdfDoc, currentPage, totalPages, setCurrentPage,
    zoom, rotation = 0, containerRef,
    tool, opts,
    pageAnns, addAnn, updateAnn, deleteAnn,
    selIdx, setSelIdx,
    drawStart, setDrawStart, drawCur, setDrawCur,
    dragging, setDragging,
    pageWH, setPageWH, rendering, setRendering,
}) {
    const canvasRef = useRef();
    const overlayRef = useRef();

    /* Render PDF page whenever doc / page / zoom / rotation changes */
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;
        let cancelled = false;
        setRendering(true);
        pdfDoc.getPage(currentPage).then(page => {
            if (cancelled) return;
            const vp = page.getViewport({ scale: zoom * 1.5, rotation });
            const canvas = canvasRef.current;
            canvas.width = vp.width;
            canvas.height = vp.height;
            setPageWH({ w: vp.width, h: vp.height });
            page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise.then(() => {
                if (!cancelled) setRendering(false);
            });
        });
        return () => { cancelled = true; };
    }, [pdfDoc, currentPage, zoom, rotation, setPageWH, setRendering]);

    const onDown = useCallback(e => {
        if (e.button !== 0) return;
        const { x, y } = getXY(e, overlayRef.current);

        if (tool === 'text') {
            addAnn({ type: 'text', x, y, text: '', fontSize: opts.fontSize, fontFamily: opts.fontFamily, color: opts.textColor, id: Date.now() });
            setTimeout(() => {
                const el = document.querySelector('.ann-text-new');
                if (el) { el.focus(); el.classList.remove('ann-text-new'); }
            }, 40);
            return;
        }
        if (tool === 'highlight' || tool === 'rectangle') {
            setDrawStart({ x, y }); setDrawCur({ x, y }); return;
        }
        if (tool === 'eraser') {
            for (let i = pageAnns.length - 1; i >= 0; i--) {
                if (hitTest(pageAnns[i], x, y)) { deleteAnn(i); break; }
            }
            return;
        }
        if (tool === 'select') {
            for (let i = pageAnns.length - 1; i >= 0; i--) {
                const a = pageAnns[i];
                if (hitTest(a, x, y)) {
                    setSelIdx(i); setDragging({ idx: i, ox: x - a.x, oy: y - a.y });
                    e.stopPropagation(); return;
                }
            }
            setSelIdx(null);
        }
    }, [tool, opts, pageAnns, addAnn, deleteAnn, setDrawStart, setDrawCur, setSelIdx, setDragging]);

    const onMove = useCallback(e => {
        const { x, y } = getXY(e, overlayRef.current);
        if (drawStart) { setDrawCur({ x, y }); return; }
        if (dragging) { updateAnn(dragging.idx, { x: x - dragging.ox, y: y - dragging.oy }); }
    }, [drawStart, dragging, updateAnn, setDrawCur]);

    const onUp = useCallback(() => {
        if (drawStart && drawCur) {
            const rx = Math.min(drawStart.x, drawCur.x);
            const ry = Math.min(drawStart.y, drawCur.y);
            const rw = Math.abs(drawCur.x - drawStart.x);
            const rh = Math.abs(drawCur.y - drawStart.y);
            if (rw > 6 && rh > 6) addAnn({ type: tool, x: rx, y: ry, w: rw, h: rh, color: opts.color, id: Date.now() });
        }
        setDrawStart(null); setDrawCur(null); setDragging(null);
    }, [drawStart, drawCur, tool, opts.color, addAnn, setDrawStart, setDrawCur, setDragging]);

    const cursorFor = { text: 'text', highlight: 'crosshair', rectangle: 'crosshair', eraser: 'cell', select: 'default' };

    const previewRect = drawStart && drawCur ? {
        x: Math.min(drawStart.x, drawCur.x), y: Math.min(drawStart.y, drawCur.y),
        w: Math.abs(drawCur.x - drawStart.x), h: Math.abs(drawCur.y - drawStart.y),
    } : null;

    return (
        <div ref={containerRef} style={{
            flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: 32,
            background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.06), transparent)',
        }}>
            {/* Canvas Paper Wrapper */}
            <div style={{
                position: 'relative', animation: 'scaleIn 0.35s var(--ease)',
                boxShadow: '0 12px 48px rgba(99,102,241,0.18), 0 4px 12px rgba(0,0,0,0.04)', borderRadius: 4,
                opacity: rendering ? 0.6 : 1, transition: 'opacity 0.2s', background: '#fff',
            }}>
                <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 4 }} />

                {/* Transparent Annotation Overlay */}
                <div
                    ref={overlayRef}
                    style={{
                        position: 'absolute', top: 0, left: 0,
                        width: pageWH.w || '100%', height: pageWH.h || '100%',
                        cursor: cursorFor[tool] || 'default', userSelect: 'none',
                    }}
                    onMouseDown={onDown} onMouseMove={onMove}
                    onMouseUp={onUp} onMouseLeave={onUp}
                >
                    {previewRect && (
                        <div style={{
                            position: 'absolute', left: previewRect.x, top: previewRect.y,
                            width: previewRect.w, height: previewRect.h,
                            background: tool === 'highlight' ? `${opts.color}55` : 'transparent',
                            border: tool === 'rectangle' ? `2.5px solid ${opts.color}` : 'none', pointerEvents: 'none',
                        }} />
                    )}

                    {pageAnns.map((ann, idx) => {
                        const isSel = selIdx === idx;
                        if (ann.type === 'text') {
                            return (
                                <div key={ann.id ?? idx} contentEditable suppressContentEditableWarning
                                    className={ann.text === '' ? 'ann-text-new' : ''}
                                    onBlur={e => updateAnn(idx, { text: e.currentTarget.innerText })}
                                    style={{
                                        position: 'absolute', left: ann.x, top: ann.y,
                                        fontSize: ann.fontSize, fontFamily: ann.fontFamily, color: ann.color,
                                        outline: 'none', minWidth: 40, minHeight: 20, padding: 2, zIndex: 10,
                                        border: isSel ? '1.5px dashed var(--acc)' : '1.5px dashed transparent',
                                        cursor: tool === 'select' ? 'move' : 'text', whiteSpace: 'nowrap',
                                    }}>
                                    {ann.text}
                                </div>
                            );
                        }
                        if (ann.type === 'highlight') {
                            return (
                                <div key={ann.id ?? idx} style={{
                                    position: 'absolute', left: ann.x, top: ann.y, width: ann.w, height: ann.h,
                                    background: `${ann.color}55`, mixBlendMode: 'multiply',
                                    pointerEvents: tool === 'eraser' || tool === 'select' ? 'auto' : 'none',
                                    outline: isSel ? '1.5px dashed var(--acc)' : 'none',
                                    cursor: tool === 'select' ? 'move' : 'default',
                                }} />
                            );
                        }
                        if (ann.type === 'rectangle') {
                            return (
                                <div key={ann.id ?? idx} style={{
                                    position: 'absolute', left: ann.x, top: ann.y, width: ann.w, height: ann.h,
                                    border: `2.5px solid ${ann.color}`, background: 'transparent',
                                    pointerEvents: tool === 'eraser' || tool === 'select' ? 'auto' : 'none',
                                    outline: isSel ? '1.5px dashed var(--acc)' : 'none', outlineOffset: 2,
                                    cursor: tool === 'select' ? 'move' : 'default',
                                }} />
                            );
                        }
                        return null;
                    })}
                </div>
            </div>

            {/* Modern Page Navigation Pill */}
            <div style={{
                marginTop: 24, display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 16px', borderRadius: 24, background: '#ffffff',
                border: '1.5px solid rgba(99,102,241,0.15)',
                boxShadow: '0 4px 16px rgba(99,102,241,0.08)',
            }}>
                <button className="btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} aria-label="Previous page" style={{ padding: 6, borderRadius: '50%' }}>
                    <I.ChevL />
                </button>
                <span style={{ fontSize: 13, color: 'var(--txm)', fontWeight: 500 }}>
                    Page <strong style={{ color: 'var(--acc)', fontWeight: 800 }}>{currentPage}</strong> of {totalPages}
                </span>
                <button className="btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} aria-label="Next page" style={{ padding: 6, borderRadius: '50%' }}>
                    <I.ChevR />
                </button>
            </div>
        </div>
    );
}
