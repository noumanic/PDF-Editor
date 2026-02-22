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
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 6 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                }}>📄</div>
                <span style={{
                    fontSize: 16, fontWeight: 800, letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap',
                }}>PDF Editor <span style={{ color: '#10b981', WebkitTextFillColor: '#10b981', fontWeight: 700 }}>Free</span></span>
            </div>

            {/* Sidebar toggle */}
            <button className="btn hide-m" onClick={() => setSideOpen(s => !s)}
                aria-label={sideOpen ? 'Collapse sidebar' : 'Expand sidebar'} style={{ padding: '6px 9px' }}>
                <I.Menu />
            </button>

            <div className="nav-sep hide-m" />

            {/* Filename */}
            <div className="hide-t" style={{ display: 'flex', alignItems: 'center', gap: 5, maxWidth: 200, overflow: 'hidden' }}>
                <I.File />
                <span style={{
                    fontSize: 12, color: 'var(--txm)', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', animation: 'fadeUp 0.4s var(--ease)',
                }}>{fileName}</span>
            </div>

            <div style={{ flex: 1 }} />

            {/* Open New PDF */}
            <button className="btn hide-m" onClick={onOpenNew} aria-label="Open a new PDF">
                <I.Upload16 /><span>Open PDF</span>
            </button>

            <div className="nav-sep hide-m" />

            {/* Undo / Redo */}
            <button className="btn" onClick={onUndo} disabled={!undoStack.length} aria-label="Undo (Ctrl+Z)">
                <I.Undo /><span className="hide-m">Undo</span>
            </button>
            <button className="btn" onClick={onRedo} disabled={!redoStack.length} aria-label="Redo (Ctrl+Y)">
                <I.Redo /><span className="hide-m">Redo</span>
            </button>

            <div className="nav-sep hide-m" />

            {/* Zoom */}
            <button className="btn" onClick={onZoomOut} aria-label="Zoom out" title="Zoom out"><I.ZoomOut /></button>
            <span style={{ fontSize: 13, color: 'var(--txm)', minWidth: 44, textAlign: 'center', userSelect: 'none', fontWeight: 600 }}>
                {Math.round(zoom * 100)}%
            </span>
            <button className="btn" onClick={onZoomIn} aria-label="Zoom in" title="Zoom in"><I.ZoomIn /></button>
            <button className="btn hide-m" onClick={onFitWidth} aria-label="Fit to width" title="Fit width">
                <I.Fit /><span>Fit</span>
            </button>

            <div className="nav-sep hide-m" />

            {/* Rotate */}
            <button className="btn hide-m" onClick={onRotateLeft} aria-label="Rotate page left" title="Rotate Left">
                <I.RotateL />
            </button>
            <button className="btn hide-m" onClick={onRotateRight} aria-label="Rotate page right" title="Rotate Right">
                <I.RotateR />
            </button>

            <div className="nav-sep hide-m" />

            {/* Download */}
            <button className="btn btn-prim" onClick={onDownload} disabled={downloading} aria-label="Download PDF">
                {downloading
                    ? <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⏳</span>
                    : dlDone ? <I.Check /> : <I.Download />}
                <span className="hide-m">{downloading ? 'Saving…' : dlDone ? 'Saved!' : 'Download'}</span>
            </button>
        </nav>
    );
}
