"use client";

import { useState, ReactNode } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDragging) {
      const diff = e.changedTouches[0].clientY - startY;
      if (diff > 100) onClose();
      setIsDragging(false);
    }
  };

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div
        className="bottom-sheet"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bottom-sheet-handle" />
        <div className="px-5 pb-8 pt-2">
          <h2 className="text-lg font-black text-text-white mb-1 uppercase tracking-wide">{title}</h2>
          <div className="zigzag-divider mb-5" />
          {children}
        </div>
      </div>
    </>
  );
}
