import { useEffect, useRef, useState } from 'react';
import I from './Icons.jsx';

/**
 * Single page thumbnail in the sidebar.
 * Renders the PDF page at small scale and shows a delete button on hover.
 */
export default function Thumbnail({ doc, pageNum, active, onClick, onDelete }) {
    const canvasRef = useRef();
    const [hover, setHover] = useState(false);

    useEffect(() => {
        let cancelled = false;
        doc.getPage(pageNum).then(page => {
            if (cancelled || !canvasRef.current) return;
            const vp = page.getViewport({ scale: 0.22 });
            const c = canvasRef.current;
            c.width = vp.width;
            c.height = vp.height;
            page.render({ canvasContext: c.getContext('2d'), viewport: vp });
        });
        return () => { cancelled = true; };
    }, [doc, pageNum]);

    return (
        <div
            style={{ marginBottom: 8, position: 'relative', animation: 'fadeUp 0.3s var(--ease)' }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <canvas
                ref={canvasRef}
                className={`thumb ${active ? 'act' : ''}`}
                style={{ display: 'block', cursor: 'pointer' }}
                onClick={onClick}
                role="button"
                tabIndex={0}
                aria-label={`Go to page ${pageNum}`}
                onKeyDown={e => e.key === 'Enter' && onClick()}
            />

            {/* Page number badge */}
            <span style={{
                position: 'absolute', bottom: 4, left: 5, fontSize: 10,
                color: 'rgba(255,255,255,0.65)', background: 'rgba(0,0,0,0.55)',
                padding: '1px 5px', borderRadius: 4, pointerEvents: 'none',
            }}>{pageNum}</span>

            {/* Active page indicator bar */}
            {active && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
                    borderRadius: '3px 0 0 3px',
                    background: 'linear-gradient(to bottom, var(--acc), var(--acc2))',
                    pointerEvents: 'none',
                }} />
            )}

            {/* Hover delete button */}
            {hover && (
                <button
                    onClick={e => { e.stopPropagation(); onDelete(pageNum); }}
                    aria-label={`Delete page ${pageNum}`}
                    title={`Delete page ${pageNum}`}
                    style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 20, height: 20, borderRadius: 5,
                        background: 'rgba(239,68,68,0.85)', border: 'none',
                        color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)', transition: 'transform 0.15s',
                    }}
                >
                    <I.PageDel />
                </button>
            )}
        </div>
    );
}
