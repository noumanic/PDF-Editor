import Thumbnail from './Thumbnail.jsx';
import I from './Icons.jsx';

const FIELD = {
    width: '100%',
    background: '#f8f9ff',
    border: '1.5px solid rgba(99,102,241,0.18)',
    borderRadius: 7,
    color: '#1e1b4b',
    padding: '5px 8px',
    fontSize: 12,
    outline: 'none',
};

export default function Sidebar({
    pdfDoc, totalPages, currentPage, deletedPages,
    rangeFrom, rangeTo, setRangeFrom, setRangeTo,
    onPageClick, onDeletePage, onDeleteRange,
}) {
    const activeCount = totalPages - deletedPages.size;

    return (
        <div style={{
            width: 148, flexShrink: 0, overflowY: 'auto',
            borderRight: '1.5px solid rgba(99,102,241,0.13)',
            padding: 10, display: 'flex', flexDirection: 'column',
            background: '#ffffff',
            animation: 'slideInL 0.25s var(--ease)',
        }} className="hide-m">

            {/* ── Delete Range Panel ── */}
            <div style={{
                marginBottom: 12, padding: '10px 9px', borderRadius: 11,
                background: '#fff5f5', border: '1.5px solid rgba(239,68,68,0.18)',
            }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Delete Range
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 7 }}>
                    <input type="number" min={1} max={totalPages} value={rangeFrom}
                        aria-label="Delete range from" onChange={e => setRangeFrom(Math.max(1, Math.min(+e.target.value, totalPages)))}
                        style={FIELD} />
                    <span style={{ color: '#6b6f9a', fontSize: 11, flexShrink: 0 }}>to</span>
                    <input type="number" min={1} max={totalPages} value={rangeTo}
                        aria-label="Delete range to" onChange={e => setRangeTo(Math.max(1, Math.min(+e.target.value, totalPages)))}
                        style={FIELD} />
                </div>
                <button onClick={onDeleteRange}
                    aria-label={`Delete pages ${rangeFrom} to ${rangeTo}`}
                    style={{
                        width: '100%', padding: '7px 4px', borderRadius: 8, border: 'none',
                        background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                        color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(239,68,68,0.22)', transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,68,68,0.35)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(239,68,68,0.22)'; }}>
                    🗑 Delete {rangeFrom}–{rangeTo}
                </button>
            </div>

            {/* ── Page Count ── */}
            <div style={{
                fontSize: 11, color: '#6b6f9a', marginBottom: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <span>Pages</span>
                <span style={{
                    background: 'rgba(99,102,241,0.10)', color: '#6366f1',
                    padding: '2px 7px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                }}>{activeCount}/{totalPages}</span>
            </div>

            {/* ── Thumbnails ── */}
            {Array.from({ length: totalPages }, (_, i) => {
                const pgNum = i + 1;
                if (deletedPages.has(pgNum)) return null;
                return (
                    <Thumbnail key={pgNum} doc={pdfDoc} pageNum={pgNum}
                        active={currentPage === pgNum}
                        onClick={() => onPageClick(pgNum)}
                        onDelete={onDeletePage} />
                );
            })}

            <div style={{ marginTop: 'auto', paddingTop: 20, textAlign: 'center' }}>
                <a href="https://www.linkedin.com/in/noumanic" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#6b6f9a', textDecoration: 'none', fontSize: 10, fontWeight: 500, transition: 'color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.color = '#6366f1'}
                    onMouseOut={e => e.currentTarget.style.color = '#6b6f9a'}>
                    <I.LinkedIn /> Nouman Hafeez
                </a>
            </div>
        </div>
    );
}
