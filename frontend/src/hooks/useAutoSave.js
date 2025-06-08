import { useEffect, useRef, useCallback } from 'react';

export function useAutoSave(data, saveFunction, options = {}) {
  const {
    delay = 2000, // Auto-save delay in milliseconds
    enabled = true,
    onSave = () => {},
    onError = () => {}
  } = options;

  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(null);
  const isInitialMount = useRef(true);

  const saveData = useCallback(async () => {
    if (!enabled || !saveFunction) return;

    try {
      await saveFunction(data);
      lastSavedRef.current = JSON.stringify(data);
      onSave(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
      onError(error);
    }
  }, [data, saveFunction, enabled, onSave, onError]);

  const scheduleAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(saveData, delay);
  }, [saveData, delay]);

  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only save if data has actually changed
    const currentData = JSON.stringify(data);
    if (currentData !== lastSavedRef.current && enabled) {
      scheduleAutoSave();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, scheduleAutoSave]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return saveData();
  }, [saveData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { saveNow };
}

export default useAutoSave;
