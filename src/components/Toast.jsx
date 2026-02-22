import { useState, useEffect } from 'react';

/**
 * Toast notification that auto-dismisses after ~2.6 s.
 */
export default function Toast({ msg, type = 'info', onClose }) {
    const [exit, setExit] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setExit(true), 2600);
        const t2 = setTimeout(onClose, 2900);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [onClose]);

    // Light theme palettes
    const palettes = {
        error: ['#fff5f5', '#fecaca', '#dc2626'],
        success: ['#ecfdf5', '#a7f3d0', '#059669'],
        info: ['#eff6ff', '#bfdbfe', '#2563eb'],
    };
    const [bg, bdr, col] = palettes[type] ?? palettes.info;

    return (
        <div style={{
            position: 'fixed', top: 72, right: 18, zIndex: 9999,
            padding: '12px 18px', borderRadius: 12,
            background: bg, border: `1.5px solid ${bdr}`, color: col,
            fontSize: 14, fontWeight: 500, backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            animation: exit ? 'none' : 'toastIn 0.3s var(--ease)',
            opacity: exit ? 0 : 1,
            transform: exit ? 'translateX(110%)' : 'translateX(0)',
            transition: exit ? 'all 0.28s var(--ease)' : 'none',
        }}>
            {msg}
        </div>
    );
}
