import I from './Icons.jsx';

/**
 * Top navigation bar — branding, undo/redo, zoom, page rotate, open new, download.
 */
export default function TopNav({
    fileName, sideOpen, setSideOpen,
    undoStack, redoStack, onUndo, onRedo,
    zoom, onZoomIn, onZoomOut, onFitWidth,
    onRotateLeft, onRotateRight,
    downloading, dlDone, onDownload,
    onOpenNew,
}) {
    return (
        <nav style={{
            height: 56, flexShrink: 0, display: 'flex', alignItems: 'center',
            padding: '0 16px', gap: 6,
            background: '#ffffff',
            borderBottom: '1.5px solid rgba(99,102,241,0.13)',
            boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
            zIndex: 50,
            overflowX: 'auto',
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 6, flexShrink: 0 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                }}>📄</div>
                <span className="hide-m" style={{
                    fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap',
                }}>PDF Editor <span style={{ color: '#10b981', WebkitTextFillColor: '#10b981', fontWeight: 700 }}>Free</span></span>
            </div>

            {/* Sidebar toggle */}
            <button className="btn" onClick={() => setSideOpen(s => !s)}
                aria-label={sideOpen ? 'Collapse sidebar' : 'Expand sidebar'} style={{ padding: '6px 9px', flexShrink: 0 }}>
                <I.Menu />
            </button>

            <div className="nav-sep hide-m" style={{ flexShrink: 0 }} />

            {/* Filename */}
            <div className="hide-m" style={{ display: 'flex', alignItems: 'center', gap: 5, maxWidth: 200, overflow: 'hidden', flexShrink: 0 }}>
                <I.File />
                <span style={{
                    fontSize: 12, color: 'var(--txm)', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', animation: 'fadeUp 0.4s var(--ease)',
                }}>{fileName}</span>
            </div>

            <div className="hide-m" style={{ flex: 1 }} />

            {/* Open New PDF */}
            <button className="btn" onClick={onOpenNew} aria-label="Open a new PDF" style={{ flexShrink: 0 }}>
                <I.Upload16 /><span className="hide-m">Open PDF</span>
            </button>

            <div className="nav-sep" style={{ flexShrink: 0 }} />

            {/* Undo / Redo */}
            <button className="btn" onClick={onUndo} disabled={!undoStack.length} aria-label="Undo (Ctrl+Z)" style={{ flexShrink: 0 }}>
                <I.Undo /><span className="hide-m">Undo</span>
            </button>
            <button className="btn" onClick={onRedo} disabled={!redoStack.length} aria-label="Redo (Ctrl+Y)" style={{ flexShrink: 0 }}>
                <I.Redo /><span className="hide-m">Redo</span>
            </button>

            <div className="nav-sep" style={{ flexShrink: 0 }} />

            {/* Zoom */}
            <button className="btn" onClick={onZoomOut} aria-label="Zoom out" title="Zoom out" style={{ flexShrink: 0 }}><I.ZoomOut /></button>
            <span style={{ fontSize: 13, color: 'var(--txm)', minWidth: 44, textAlign: 'center', userSelect: 'none', fontWeight: 600, flexShrink: 0 }}>
                {Math.round(zoom * 100)}%
            </span>
            <button className="btn" onClick={onZoomIn} aria-label="Zoom in" title="Zoom in" style={{ flexShrink: 0 }}><I.ZoomIn /></button>
            <button className="btn" onClick={onFitWidth} aria-label="Fit to width" title="Fit width" style={{ flexShrink: 0 }}>
                <I.Fit /><span className="hide-m">Fit</span>
            </button>

            <div className="nav-sep" style={{ flexShrink: 0 }} />

            {/* Rotate */}
            <button className="btn" onClick={onRotateLeft} aria-label="Rotate page left" title="Rotate Left" style={{ flexShrink: 0 }}>
                <I.RotateL />
            </button>
            <button className="btn" onClick={onRotateRight} aria-label="Rotate page right" title="Rotate Right" style={{ flexShrink: 0 }}>
                <I.RotateR />
            </button>

            <div className="nav-sep" style={{ flexShrink: 0 }} />

            {/* Download */}
            <button className="btn btn-prim" onClick={onDownload} disabled={downloading} aria-label="Download PDF" style={{ flexShrink: 0 }}>
                {downloading
                    ? <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⏳</span>
                    : dlDone ? <I.Check /> : <I.Download />}
                <span className="hide-m">{downloading ? 'Saving…' : dlDone ? 'Saved!' : 'Download'}</span>
            </button>
        </nav>
    );
}
