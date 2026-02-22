import { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import I from './Icons.jsx';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export default function UploadView({ onLoad, showToast }) {
    const [drag, setDrag] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');
    const fileRef = useRef();

    const processFile = useCallback(async (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            showToast('Please upload a valid PDF file', 'error'); return;
        }
        setFileName(file.name); setLoading(true); setProgress(0);
        const iv = setInterval(() => setProgress(p => p < 88 ? p + Math.random() * 12 : p), 130);
        try {
            const buf = await file.arrayBuffer();
            const bytesCopy = new Uint8Array(buf.slice(0));
            clearInterval(iv); setProgress(95);
            const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
            setProgress(100);
            setTimeout(() => onLoad(doc, bytesCopy, file.name), 350);
        } catch (e) {
            clearInterval(iv); setLoading(false); setProgress(0);
            showToast('Failed to load PDF: ' + e.message, 'error');
        }
    }, [onLoad, showToast]);

    const onDrop = useCallback(e => { e.preventDefault(); setDrag(false); processFile(e.dataTransfer.files[0]); }, [processFile]);
    const onDragOver = e => { e.preventDefault(); setDrag(true); };
    const onDragLeave = () => setDrag(false);

    return (
        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            style={{
                height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#f0f4ff 0%,#e8edf8 100%)',
            }}>
            <div style={{ width: '100%', maxWidth: 560, padding: 32, animation: 'fadeUp 0.55s var(--ease)' }}>

                {/* Hero branding */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 72, height: 72, borderRadius: 20,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        boxShadow: '0 8px 30px rgba(99,102,241,0.35)',
                        fontSize: 34, marginBottom: 18,
                    }}>📄</div>
                    <h1 style={{
                        fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        PDF Editor{' '}
                        <span style={{ color: '#10b981', WebkitTextFillColor: '#10b981' }}>Free</span>
                    </h1>
                    <p style={{ color: 'var(--txm)', fontSize: 15, lineHeight: 1.6 }}>
                        Annotate, highlight, delete pages &amp; download — no account needed.
                    </p>
                </div>

                {/* Drop zone */}
                {!loading ? (
                    <div onClick={() => fileRef.current.click()}
                        style={{
                            borderRadius: 20,
                            border: `2.5px dashed ${drag ? '#6366f1' : 'rgba(99,102,241,0.25)'}`,
                            padding: '52px 36px', textAlign: 'center', cursor: 'pointer',
                            transition: 'all 0.3s var(--ease)',
                            background: drag ? 'rgba(99,102,241,0.04)' : '#ffffff',
                            transform: drag ? 'scale(1.015)' : 'scale(1)',
                            animation: 'pulseGlow 3.5s ease-in-out infinite',
                            boxShadow: drag
                                ? '0 0 32px rgba(99,102,241,0.15), 0 4px 24px rgba(0,0,0,0.06)'
                                : '0 4px 24px rgba(99,102,241,0.08)',
                        }}>
                        <div style={{ color: '#6366f1', marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>
                            <I.Upload />
                        </div>
                        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx)', marginBottom: 6 }}>
                            {drag ? 'Drop it here!' : 'Drop your PDF here'}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--txm)', marginBottom: 20 }}>or click to browse · PDF files only</p>
                        <span style={{
                            padding: '9px 22px', borderRadius: 10,
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            color: '#fff', fontSize: 14, fontWeight: 600,
                            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                        }}>Browse Files</span>
                        <input ref={fileRef} type="file" accept=".pdf,application/pdf" hidden
                            onChange={e => processFile(e.target.files[0])} />
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center', padding: '48px 36px', borderRadius: 20,
                        background: '#ffffff', border: '1.5px solid rgba(99,102,241,0.15)',
                        boxShadow: '0 4px 24px rgba(99,102,241,0.08)',
                    }}>
                        <div style={{ fontSize: 13, color: 'var(--txm)', marginBottom: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {fileName}
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'rgba(99,102,241,0.1)', overflow: 'hidden', marginBottom: 10 }}>
                            <div style={{
                                height: '100%', borderRadius: 3,
                                background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                                width: progress + '%', transition: 'width 0.18s var(--ease)',
                            }} />
                        </div>
                        <p style={{ fontSize: 13, color: '#6366f1', fontWeight: 600 }}>{Math.round(progress)}% — Loading PDF…</p>
                    </div>
                )}

                {/* Feature pills */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
                    {['✏️ Annotate', '🟡 Highlight', '🗑 Delete Pages', '💾 Download', '🔒 100% Private'].map(f => (
                        <span key={f} style={{
                            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                            background: '#fff', border: '1.5px solid rgba(99,102,241,0.15)',
                            color: 'var(--txm)', boxShadow: '0 2px 6px rgba(99,102,241,0.06)',
                        }}>{f}</span>
                    ))}
                </div>

                <div style={{ marginTop: 40, textAlign: 'center' }}>
                    <a href="https://www.linkedin.com/in/noumanic" target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b6f9a', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#6366f1'}
                        onMouseOut={e => e.currentTarget.style.color = '#6b6f9a'}>
                        <I.LinkedIn /> Developed by Muhammad Nouman Hafeez
                    </a>
                </div>
            </div>
        </div>
    );
}
