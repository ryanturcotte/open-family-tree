import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 50;

/**
 * useUndoableState
 * Wraps useState with a full undo/redo history stack.
 * The setNodes API is identical to useState's setter.
 */
export function useUndoableState(initialState) {
  const [current, setCurrent] = useState(initialState);
  // past[0] is oldest, past[past.length-1] is most recent before current
  const past = useRef([]);
  const future = useRef([]);

  const set = useCallback((valueOrUpdater) => {
    setCurrent(prev => {
      const next =
        typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;

      // Push current to past, clear future (new branch)
      past.current = [...past.current.slice(-(MAX_HISTORY - 1)), prev];
      future.current = [];

      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    setCurrent(prev => {
      const previous = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [prev, ...future.current];
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    setCurrent(prev => {
      const next = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current, prev];
      return next;
    });
  }, []);

  // Expose reactive canUndo/canRedo by tracking lengths in state
  const [historySize, setHistorySize] = useState({ past: 0, future: 0 });

  // Keep historySize in sync after mutations
  const setAndSync = useCallback((valueOrUpdater) => {
    set(valueOrUpdater);
    // Use setTimeout(0) to read refs after the state update queues
    setTimeout(() => {
      setHistorySize({ past: past.current.length, future: future.current.length });
    }, 0);
  }, [set]);

  const undoAndSync = useCallback(() => {
    undo();
    setTimeout(() => {
      setHistorySize({ past: past.current.length, future: future.current.length });
    }, 0);
  }, [undo]);

  const redoAndSync = useCallback(() => {
    redo();
    setTimeout(() => {
      setHistorySize({ past: past.current.length, future: future.current.length });
    }, 0);
  }, [redo]);

  return {
    nodes: current,
    setNodes: setAndSync,
    undo: undoAndSync,
    redo: redoAndSync,
    canUndo: historySize.past > 0,
    canRedo: historySize.future > 0,
  };
}
