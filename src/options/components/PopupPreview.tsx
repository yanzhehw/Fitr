import { useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  theme: 'light' | 'dark';
  onClose: () => void;
};

export function PopupPreview({ open, theme, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const frame = iframeRef.current;
    if (!frame) return;
    const sync = () => {
      try {
        frame.contentDocument?.documentElement.setAttribute('data-theme', theme);
      } catch {
        // cross-origin guard
      }
    };
    sync();
    frame.addEventListener('load', sync);
    return () => frame.removeEventListener('load', sync);
  }, [open, theme]);

  return (
    <div className={`popup-preview-overlay ${open ? '' : 'hidden'}`}>
      <div className="popup-preview-backdrop" onClick={onClose} />
      <div className="popup-preview-frame">
        <div className="popup-preview-header">
          <span className="text-small text-muted">Popup Preview</span>
          <button className="popup-preview-close" onClick={onClose}>
            ×
          </button>
        </div>
        <iframe
          ref={iframeRef}
          src="../popup/popup.html"
          className="popup-preview-iframe"
          title="Popup Preview"
        />
      </div>
    </div>
  );
}
