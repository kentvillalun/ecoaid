"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export const HoverPortal = ({ children, content }) => {
  const [show, setShow] = useState(false);
  const [positionTop, setPositionTop] = useState(0);
  const [positionLeft, setPositionLeft] = useState(0);
  const [isAbove, setIsAbove] = useState(false)

  return (
    <div
      className="relative flex flex-wrap gap-1 min-h-full"
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const isAbove = rect.bottom > window.innerHeight / 2;
        setIsAbove(isAbove)
        setPositionTop(isAbove ? rect.top : rect.bottom);
        setPositionLeft(rect.left);
        setShow(true);
      }}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show &&
        createPortal(
          <div
            className="fixed left-0 z-50 bg-white rounded-xl  new-border p-3 min-w-56"
            style={{ top: positionTop, left: positionLeft, transform: isAbove ? 'translateY(-100%)' : 'none' }}
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
};
