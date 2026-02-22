import { useState, useCallback, useMemo } from 'react';

/**
 * Manages the annotation state, undo/redo stack.
 * Returns helpers: addAnn, updateAnn, deleteAnn, undo, redo, pageAnns.
 */
export function useAnnotations(currentPage) {
    const [anns, setAnns] = useState({});
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const pageAnns = useMemo(() => anns[currentPage] ?? [], [anns, currentPage]);

    const snapshot = useCallback(() => JSON.parse(JSON.stringify(anns)), [anns]);

    const pushUndo = useCallback(prev => {
        setUndoStack(s => [...s.slice(-49), prev]);
        setRedoStack([]);
    }, []);

    const mutate = useCallback(fn => {
        setAnns(prev => {
            pushUndo(JSON.parse(JSON.stringify(prev)));
            const next = { ...prev };
            fn(next);
            return next;
        });
    }, [pushUndo]);

    const addAnn = useCallback(ann => mutate(next => {
        next[currentPage] = [...(next[currentPage] ?? []), ann];
    }), [currentPage, mutate]);

    const updateAnn = useCallback((idx, patch) => mutate(next => {
        const arr = [...(next[currentPage] ?? [])];
        arr[idx] = { ...arr[idx], ...patch };
        next[currentPage] = arr;
    }), [currentPage, mutate]);

    const deleteAnn = useCallback(idx => {
        mutate(next => {
            next[currentPage] = (next[currentPage] ?? []).filter((_, i) => i !== idx);
        });
    }, [currentPage, mutate]);

    const undo = useCallback(() => {
        setUndoStack(s => {
            if (!s.length) return s;
            const prev = s[s.length - 1];
            setRedoStack(r => [...r, snapshot()]);
            setAnns(prev);
            return s.slice(0, -1);
        });
    }, [snapshot]);

    const redo = useCallback(() => {
        setRedoStack(s => {
            if (!s.length) return s;
            const next = s[s.length - 1];
            setUndoStack(u => [...u, snapshot()]);
            setAnns(next);
            return s.slice(0, -1);
        });
    }, [snapshot]);

    const reset = useCallback(() => {
        setAnns({}); setUndoStack([]); setRedoStack([]);
    }, []);

    return { anns, pageAnns, undoStack, redoStack, addAnn, updateAnn, deleteAnn, undo, redo, reset };
}
