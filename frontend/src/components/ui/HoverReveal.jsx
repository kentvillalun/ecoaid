"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const HoverPortal = ({ children, content }) => {
  const [show, setShow] = useState(false);
  const [positionTop, setPositionTop] = useState(0);
  const [positionLeft, setPositionLeft] = useState(0);
  const [isAbove, setIsAbove] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isAbove = rect.bottom > window.innerHeight / 2;
    setIsAbove(isAbove);
    setPositionTop(isAbove ? rect.top : rect.bottom);
    setPositionLeft(rect.left);

    timeoutRef.current = setTimeout(() => {
      setShow(true);
    }, 350);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setShow(false);
  };

  return (
    <div
      className="relative flex flex-wrap gap-1 min-h-full"
      onMouseEnter={(e) => handleMouseEnter(e)}
      onMouseLeave={() => handleMouseLeave()}
    >
      {children}
      {show &&
        createPortal(
          <div
            className="fixed left-0 z-50 bg-white rounded-xl  new-border p-3 min-w-56"
            style={{
              top: positionTop,
              left: positionLeft,
              transform: isAbove ? "translateY(-100%)" : "none",
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
};
