import { useState, useRef, useCallback, useEffect } from 'react';
import Toast from './components/Toast.jsx';
import UploadView from './components/UploadView.jsx';
import TopNav from './components/TopNav.jsx';
import Sidebar from './components/Sidebar.jsx';
import MainCanvas from './components/MainCanvas.jsx';
import RightToolbar from './components/RightToolbar.jsx';
import { useAnnotations } from './hooks/useAnnotations.js';
import { buildPdf } from './hooks/usePdfDownload.js';

export default function App() {
    /* ── PDF state ── */
    const [pdfDoc, setPdfDoc] = useState(null);
    const pdfBytesRef = useRef(null);
    const [fileName, setFileName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    /* ── View state ── */
    const [zoom, setZoom] = useState(1.0);
    const [rotation, setRotation] = useState(0); // overall visual rotation
    const [sideOpen, setSideOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
    const [toast, setToast] = useState(null);
    const [rendering, setRendering] = useState(false);
    const [pageWH, setPageWH] = useState({ w: 0, h: 0 });

    /* ── Tool state ── */
    const [tool, setTool] = useState('select');
    const [opts, setOpts] = useState({
        color: '#facc15', textColor: '#1e1b4b', fontSize: 18, fontFamily: 'sans-serif', opacity: 0.35,
    });
    const [selIdx, setSelIdx] = useState(null);
    const [drawStart, setDrawStart] = useState(null);
    const [drawCur, setDrawCur] = useState(null);
    const [dragging, setDragging] = useState(null);

    /* ── Page management ── */
    const [deletedPages, setDeletedPages] = useState(new Set());
    const [rangeFrom, setRangeFrom] = useState(1);
    const [rangeTo, setRangeTo] = useState(1);

    /* ── Annotations ── */
    const { anns, pageAnns, undoStack, redoStack, addAnn, updateAnn, deleteAnn, undo, redo, reset: resetAnns } = useAnnotations(currentPage);

    /* ── Download state ── */
    const [downloading, setDownloading] = useState(false);
    const [dlDone, setDlDone] = useState(false);

    /* ── Refs ── */
    const containerRef = useRef();

    /* ── Helpers ── */
    const showToast = useCallback((msg, type = 'info') => setToast({ msg, type, key: Date.now() }), []);

    /* ── Load PDF ── */
    const handleLoad = useCallback((doc, bytes, name) => {
        pdfBytesRef.current = bytes;
        setPdfDoc(doc);
        setFileName(name);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setDeletedPages(new Set());
        setRangeFrom(1);
        setRangeTo(1);
        setRotation(0);
        resetAnns();
        setSelIdx(null);
        setZoom(window.innerWidth < 768 ? 0.55 : 1.0);
    }, [resetAnns]);

    const openNew = useCallback(() => {
        if (confirm('Are you sure? Any unsaved changes will be lost.')) {
            setPdfDoc(null);
            pdfBytesRef.current = null;
        }
    }, []);

    /* ── Zoom and Rotation ── */
    const zoomIn = useCallback(() => setZoom(z => Math.min(+(z + 0.15).toFixed(2), 2.5)), []);
    const zoomOut = useCallback(() => setZoom(z => Math.max(+(z - 0.15).toFixed(2), 0.3)), []);
    const fitWidth = useCallback(async () => {
        if (!pdfDoc || !containerRef.current) return;
        const page = await pdfDoc.getPage(currentPage);
        const vp = page.getViewport({ scale: 1, rotation });
        setZoom(+((containerRef.current.clientWidth - 80) / (vp.width * 1.5)).toFixed(2));
    }, [pdfDoc, currentPage, rotation]);

    const rotateLeft = useCallback(() => setRotation(r => (r - 90) % 360), []);
    const rotateRight = useCallback(() => setRotation(r => (r + 90) % 360), []);

    /* ── Keyboard shortcuts ── */
    useEffect(() => {
        const handler = e => {
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [undo, redo]);

    /* ── Delete single page ── */
    const deletePage = useCallback(pageNum => {
        if (totalPages - deletedPages.size <= 1) {
            showToast('Cannot delete the last remaining page', 'error'); return;
        }
        setDeletedPages(prev => new Set([...prev, pageNum]));
        if (currentPage === pageNum) {
            setCurrentPage(pageNum < totalPages ? pageNum + 1 : pageNum - 1);
        }
        showToast(`Page ${pageNum} deleted`, 'info');
    }, [totalPages, deletedPages, currentPage, showToast]);

    /* ── Delete a range of pages ── */
    const deletePageRange = useCallback(() => {
        const from = Math.max(1, Math.min(rangeFrom, totalPages));
        const to = Math.max(from, Math.min(rangeTo, totalPages));
        const count = to - from + 1;
        if (totalPages - deletedPages.size - count < 1) {
            showToast('Cannot delete all pages — at least one must remain', 'error'); return;
        }
        setDeletedPages(prev => {
            const next = new Set(prev);
            for (let p = from; p <= to; p++) next.add(p);
            return next;
        });
        if (currentPage >= from && currentPage <= to) {
            let nav = to + 1;
            if (nav > totalPages) nav = from - 1;
            if (nav >= 1 && nav <= totalPages) setCurrentPage(nav);
        }
        showToast(`Deleted pages ${from}–${to} (${count} page${count !== 1 ? 's' : ''})`, 'info');
    }, [rangeFrom, rangeTo, totalPages, deletedPages, currentPage, showToast]);

    /* ── Download ── */
    const download = useCallback(async () => {
        if (!pdfBytesRef.current || !pdfDoc) return;
        setDownloading(true); setDlDone(false);
        try {
            const saved = await buildPdf(pdfBytesRef.current, pdfDoc, anns, deletedPages, zoom);
            const url = URL.createObjectURL(new Blob([saved], { type: 'application/pdf' }));
            const a = Object.assign(document.createElement('a'), {
                href: url, download: fileName.replace(/\.pdf$/i, '') + '_edited.pdf',
            });
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); URL.revokeObjectURL(url);
            setDlDone(true);
            showToast('PDF saved successfully!', 'success');
            setTimeout(() => setDlDone(false), 3000);
        } catch (e) {
            showToast('Download failed: ' + e.message, 'error');
        } finally {
            setDownloading(false);
        }
    }, [pdfDoc, anns, deletedPages, zoom, fileName, showToast]);

    /* ── Render ── */
    if (!pdfDoc) {
        return (
            <>
                {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
                <UploadView onLoad={handleLoad} showToast={showToast} />
            </>
        );
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
            {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <TopNav
                fileName={fileName}
                sideOpen={sideOpen} setSideOpen={setSideOpen}
                undoStack={undoStack} redoStack={redoStack}
                onUndo={undo} onRedo={redo}
                zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onFitWidth={fitWidth}
                onRotateLeft={rotateLeft} onRotateRight={rotateRight}
                downloading={downloading} dlDone={dlDone} onDownload={download}
                onOpenNew={openNew}
            />

            <div style={{ flex: 1, display: 'flex', overflowX: 'auto', overflowY: 'hidden', position: 'relative' }}>
                {sideOpen && (
                    <Sidebar
                        pdfDoc={pdfDoc} totalPages={totalPages} currentPage={currentPage}
                        deletedPages={deletedPages}
                        rangeFrom={rangeFrom} rangeTo={rangeTo}
                        setRangeFrom={setRangeFrom} setRangeTo={setRangeTo}
                        onPageClick={p => {
                            setCurrentPage(p);
                            if (window.innerWidth < 768) setSideOpen(false);
                        }}
                        onDeletePage={deletePage}
                        onDeleteRange={deletePageRange}
                    />
                )}

                <div className="canvas-wrapper" style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
                    <MainCanvas
                        pdfDoc={pdfDoc} currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}
                        zoom={zoom} rotation={rotation}
                        containerRef={containerRef}
                        tool={tool} opts={opts}
                        pageAnns={pageAnns} addAnn={addAnn} updateAnn={updateAnn} deleteAnn={deleteAnn}
                        selIdx={selIdx} setSelIdx={setSelIdx}
                        drawStart={drawStart} setDrawStart={setDrawStart}
                        drawCur={drawCur} setDrawCur={setDrawCur}
                        dragging={dragging} setDragging={setDragging}
                        pageWH={pageWH} setPageWH={setPageWH}
                        rendering={rendering} setRendering={setRendering}
                    />

                    <RightToolbar tool={tool} setTool={setTool} opts={opts} setOpts={setOpts} />
                </div>
            </div>
        </div>
    );
}
