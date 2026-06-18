import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onEnter?: () => void;
  onBack?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onPlayPause?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onEnter,
  onBack,
  onLeft,
  onRight,
  onUp,
  onDown,
  onPlayPause,
  enabled = true,
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          onEnter?.();
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          onBack?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onRight?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onDown?.();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          onPlayPause?.();
          break;
      }
    },
    [enabled, onEnter, onBack, onLeft, onRight, onUp, onDown, onPlayPause]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, enabled = true) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, [containerRef, enabled]);
}
