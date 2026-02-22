import I from './Icons.jsx';

const TOOLS = [
    { key: 'select', Icon: I.Select, label: 'Select & Move' },
    { key: 'text', Icon: I.Text, label: 'Add Text' },
    { key: 'highlight', Icon: I.Highlight, label: 'Highlight' },
    { key: 'rectangle', Icon: I.Rect, label: 'Rectangle' },
    { key: 'eraser', Icon: I.Eraser, label: 'Eraser' },
];

const HL_COLORS = [{ v: '#facc15', l: 'Yellow' }, { v: '#34d399', l: 'Green' }, { v: '#60a5fa', l: 'Blue' }, { v: '#f472b6', l: 'Pink' }];
const RECT_COLORS = [{ v: '#6366f1', l: 'Indigo' }, { v: '#0ea5e9', l: 'Sky' }, { v: '#ef4444', l: 'Red' }, { v: '#10b981', l: 'Emerald' }];
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48];
const FONT_FAMILIES = ['sans-serif', 'serif', 'monospace', 'Georgia', 'Arial', 'Courier New'];

const SELECT_STYLE = {
    width: '100%',
    background: '#f8f9ff',
    border: '1.5px solid rgba(99,102,241,0.2)',
    borderRadius: 7,
    color: '#1e1b4b',
    padding: '5px 7px',
    fontSize: 12,
    outline: 'none',
    cursor: 'pointer',
};

export default function RightToolbar({ tool, setTool, opts, setOpts }) {
    const showColors = tool === 'highlight' || tool === 'rectangle';
    const showText = tool === 'text';
    const colorSet = tool === 'rectangle' ? RECT_COLORS : HL_COLORS;

    return (
        <div style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: 6, zIndex: 40,
            animation: 'slideInR 0.25s var(--ease)',
        }} className="hide-m">

            {/* Tool buttons */}
            <div style={{
                background: '#ffffff', border: '1.5px solid rgba(99,102,241,0.13)',
                borderRadius: 14, padding: 8, display: 'flex', flexDirection: 'column', gap: 4,
                boxShadow: '0 4px 20px rgba(99,102,241,0.10)',
            }}>
                {TOOLS.map(({ key, Icon, label }) => (
                    <button key={key}
                        className={`tool-btn ${tool === key ? 'act' : ''}`}
                        onClick={() => setTool(key)}
                        aria-label={label} title={label}>
                        <Icon />
                        <span className="tooltip">{label}</span>
                    </button>
                ))}
            </div>

            {/* Options panel */}
            {(showColors || showText) && (
                <div style={{
                    background: '#ffffff', border: '1.5px solid rgba(99,102,241,0.13)',
                    borderRadius: 12, padding: '11px 10px',
                    display: 'flex', flexDirection: 'column', gap: 9,
                    boxShadow: '0 4px 20px rgba(99,102,241,0.10)', minWidth: 132,
                }}>
                    {showColors && (
                        <>
                            <label style={{ fontSize: 10, color: '#6b6f9a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Color</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                {colorSet.map(({ v, l }) => (
                                    <button key={v} title={l} onClick={() => setOpts(o => ({ ...o, color: v }))}
                                        style={{
                                            width: 24, height: 24, borderRadius: 7, background: v, border: 'none', cursor: 'pointer',
                                            outline: opts.color === v ? '2.5px solid #6366f1' : '2px solid transparent',
                                            outlineOffset: 2, transition: 'transform 0.15s',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                                        }}
                                        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.18)')}
                                        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {showText && (
                        <>
                            <label style={{ fontSize: 10, color: '#6b6f9a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Font</label>
                            <select value={opts.fontFamily} onChange={e => setOpts(o => ({ ...o, fontFamily: e.target.value }))}
                                style={SELECT_STYLE}>
                                {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>

                            <label style={{ fontSize: 10, color: '#6b6f9a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Size</label>
                            <select value={opts.fontSize} onChange={e => setOpts(o => ({ ...o, fontSize: +e.target.value }))}
                                style={SELECT_STYLE}>
                                {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
                            </select>

                            <label style={{ fontSize: 10, color: '#6b6f9a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Text Color</label>
                            <input type="color" value={opts.textColor} onChange={e => setOpts(o => ({ ...o, textColor: e.target.value }))}
                                style={{ width: '100%', height: 32, borderRadius: 7, border: '1.5px solid rgba(99,102,241,0.2)', cursor: 'pointer', background: 'none', padding: 2 }} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
