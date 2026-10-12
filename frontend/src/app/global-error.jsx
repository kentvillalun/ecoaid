"use client";

import { useEffect } from "react";

// Shown when the root layout itself crashes. It REPLACES the root layout,
// so it must render its own <html> and <body>, and globals.css is not loaded:
// plain inline styles only.
export default function GlobalError({ error }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" translate="no">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "32px",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8f8f8",
          color: "#092517",
        }}
      >
        <p style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
          Something went wrong
        </p>
        <p style={{ fontSize: "14px", margin: 0 }}>
          Please reload the page to continue.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 40px",
            borderRadius: "14px",
            border: "none",
            background: "#092517",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
